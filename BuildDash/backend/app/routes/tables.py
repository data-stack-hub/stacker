from fastapi import APIRouter, HTTPException
from sqlalchemy import text
from typing import Optional
from pydantic import BaseModel
from ..database import am_engine, landing_engine, get_all_tables

router = APIRouter()

class CustomQueryRequest(BaseModel):
    query: str
    params: dict = {}

@router.get("/tables")
async def get_tables():
    return get_all_tables()

@router.get("/tables/{db_name}/{table_name}")
async def get_table_data(db_name: str, table_name: str):
    try:
        # Select engine based on database name
        engine = am_engine if db_name == "asset_manager" else landing_engine
        
        # Fetch table structure
        query = text("""
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = :table_name
        """)
        
        with engine.connect() as connection:
            # Fetch columns info
            result = connection.execute(query, {"table_name": table_name})
            columns = [{"name": row[0], "type": row[1]} for row in result]
            
            # Fetch table data with proper dictionary conversion
            data_query = text(f"SELECT * FROM {text(table_name)} LIMIT 100")
            result = connection.execute(data_query)
            
            # Convert rows to dictionaries using column names
            column_names = [col["name"] for col in columns]
            data = [dict(zip(column_names, row)) for row in result]
            
            return {
                "columns": columns,
                "data": data
            }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/tables/{db_name}/query")
async def execute_custom_query(db_name: str, query_request: CustomQueryRequest):
    try:
        engine = am_engine if db_name == "asset_manager" else landing_engine
        
        with engine.connect() as connection:
            # Execute the custom query
            result = connection.execute(
                text(query_request.query), 
                query_request.params
            )
            
            # Get column information
            columns = [{"name": col[0], "type": str(col[1])} for col in result.cursor.description]
            
            # Convert rows to dictionaries
            rows = [dict(zip([col["name"] for col in columns], row)) for row in result.fetchall()]
            
            return {
                "columns": columns,
                "data": rows
            }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/schema")
async def get_schema():
    try:
        schemas = {}
        for db_name, engine in [("asset_manager", am_engine), ("landing_tables", landing_engine)]:
            with engine.connect() as connection:
                # Get tables and their columns with primary key information
                query = text("""
                    SELECT 
                        tc.table_name, 
                        kcu.column_name,
                        ccu.table_name AS foreign_table_name,
                        ccu.column_name AS foreign_column_name,
                        c.data_type,
                        c.is_nullable,
                        CASE WHEN pk.column_name IS NOT NULL THEN true ELSE false END as is_primary_key
                    FROM 
                        information_schema.tables t
                        LEFT JOIN information_schema.columns c 
                            ON t.table_name = c.table_name
                        LEFT JOIN information_schema.table_constraints tc 
                            ON t.table_name = tc.table_name
                            AND tc.constraint_type = 'FOREIGN KEY'
                        LEFT JOIN information_schema.key_column_usage kcu
                            ON tc.constraint_name = kcu.constraint_name
                        LEFT JOIN information_schema.constraint_column_usage ccu 
                            ON tc.constraint_name = ccu.constraint_name
                        LEFT JOIN (
                            SELECT kcu.column_name, kcu.table_name
                            FROM information_schema.table_constraints tc
                            JOIN information_schema.key_column_usage kcu 
                                ON tc.constraint_name = kcu.constraint_name
                            WHERE tc.constraint_type = 'PRIMARY KEY'
                        ) pk ON t.table_name = pk.table_name AND c.column_name = pk.column_name
                    WHERE 
                        t.table_schema = 'public'
                    ORDER BY 
                        t.table_name, 
                        c.ordinal_position;
                """)
                
                result = connection.execute(query)
                tables = {}
                
                for row in result:
                    table_name = row[0]
                    if table_name not in tables:
                        tables[table_name] = {
                            "columns": [],
                            "relationships": []
                        }
                    
                    # Add column info
                    tables[table_name]["columns"].append({
                        "name": row[1],
                        "type": row[4],
                        "nullable": row[5] == "YES",
                        "is_primary_key": row[6]
                    })
                    
                    # Add relationship info if exists
                    if row[2] and row[3]:  # if there's a foreign key
                        tables[table_name]["relationships"].append({
                            "from_column": row[1],
                            "to_table": row[2],
                            "to_column": row[3]
                        })
                
                schemas[db_name] = tables
        
        return schemas
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/tables/{db_name}/{table_name}/metadata")
async def get_table_metadata(db_name: str, table_name: str):
    try:
        engine = am_engine if db_name == "asset_manager" else landing_engine
        
        with engine.connect() as connection:
            # Get column information with additional metadata
            metadata_query = text("""
                SELECT 
                    c.column_name,
                    c.data_type,
                    c.is_nullable,
                    c.column_default,
                    c.character_maximum_length,
                    CASE WHEN pk.column_name IS NOT NULL THEN true ELSE false END as is_primary_key
                FROM 
                    information_schema.columns c
                    LEFT JOIN (
                        SELECT kcu.column_name
                        FROM information_schema.table_constraints tc
                        JOIN information_schema.key_column_usage kcu 
                            ON tc.constraint_name = kcu.constraint_name
                        WHERE tc.constraint_type = 'PRIMARY KEY'
                        AND kcu.table_name = :table_name
                    ) pk ON c.column_name = pk.column_name
                WHERE 
                    c.table_name = :table_name
                ORDER BY 
                    c.ordinal_position;
            """)
            
            result = connection.execute(metadata_query, {"table_name": table_name})
            columns = [{
                "name": row[0],
                "type": row[1],
                "nullable": row[2] == "YES",
                "default": row[3],
                "max_length": row[4],
                "is_primary_key": row[5]
            } for row in result]
            
            return {
                "table_name": table_name,
                "columns": columns
            }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
