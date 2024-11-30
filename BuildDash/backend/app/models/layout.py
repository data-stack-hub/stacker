from sqlalchemy import Column, Integer, String, JSON, DateTime
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class Layout(Base):
    __tablename__ = "layouts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    layout_config = Column(JSON)
    widgets_config = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    class Config:
        orm_mode = True

    def __repr__(self):
        return f"<Layout {self.name}>"