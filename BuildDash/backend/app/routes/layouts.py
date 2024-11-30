from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, insert
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel
from ..database import get_db
from ..models.layout import Layout

router = APIRouter()

class LayoutConfig(BaseModel):
    i: str
    x: int
    y: int
    w: int
    h: int

class LayoutCreate(BaseModel):
    name: str
    layout_config: List[dict]

class LayoutResponse(BaseModel):
    id: int
    name: str
    layout_config: List[dict]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

@router.post("/layouts", response_model=LayoutResponse)
async def create_layout(layout: LayoutCreate, db: AsyncSession = Depends(get_db)):
    try:
        # Check if layout with this name already exists
        existing = await db.execute(select(Layout).filter(Layout.name == layout.name))
        if existing.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="Layout with this name already exists")

        now = datetime.utcnow()
        new_layout = Layout(
            name=layout.name,
            layout_config=layout.layout_config,
            created_at=now,
            updated_at=now
        )
        
        db.add(new_layout)
        await db.commit()
        await db.refresh(new_layout)
        
        return new_layout
    except HTTPException as he:
        await db.rollback()
        raise he
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/layouts", response_model=List[LayoutResponse])
async def get_layouts(db: AsyncSession = Depends(get_db)):
    try:
        result = await db.execute(select(Layout))
        layouts = result.scalars().all()
        return layouts
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/layouts/{layout_id}", response_model=LayoutResponse)
async def get_layout(layout_id: int, db: AsyncSession = Depends(get_db)):
    try:
        result = await db.execute(select(Layout).filter(Layout.id == layout_id))
        layout = result.scalar_one_or_none()
        
        if layout is None:
            raise HTTPException(status_code=404, detail="Layout not found")
            
        return layout
    except ValueError:
        # If layout_id cannot be converted to int, try to find by name
        try:
            result = await db.execute(select(Layout).filter(Layout.name == layout_id))
            layout = result.scalar_one_or_none()
            if layout is None:
                raise HTTPException(status_code=404, detail="Layout not found")
            return layout
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/layouts/name/{layout_name}", response_model=LayoutResponse)
async def get_layout_by_name(layout_name: str, db: AsyncSession = Depends(get_db)):
    try:
        result = await db.execute(select(Layout).filter(Layout.name == layout_name))
        layout = result.scalar_one_or_none()
        
        if layout is None:
            raise HTTPException(status_code=404, detail="Layout not found")
            
        return layout
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/layouts/{layout_id}", response_model=LayoutResponse)
async def update_layout(
    layout_id: int,
    layout_update: LayoutCreate,
    db: AsyncSession = Depends(get_db)
):
    try:
        layout = await db.get(Layout, layout_id)
        if layout is None:
            raise HTTPException(status_code=404, detail="Layout not found")
        
        layout.name = layout_update.name
        layout.layout_config = layout_update.layout_config
        layout.updated_at = datetime.utcnow()
        
        await db.commit()
        await db.refresh(layout)
        return layout
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/layouts/{layout_id}")
async def delete_layout(layout_id: int, db: AsyncSession = Depends(get_db)):
    try:
        layout = await db.get(Layout, layout_id)
        if layout is None:
            raise HTTPException(status_code=404, detail="Layout not found")
            
        await db.delete(layout)
        await db.commit()
        return {"message": "Layout deleted successfully"}
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e)) 