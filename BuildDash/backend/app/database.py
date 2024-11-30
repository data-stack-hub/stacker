from sqlalchemy import create_engine, inspect
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from .config import settings
from .models.layout import Base

# Create connection strings
am_db_url = f"postgresql://{settings.AM_USER_NAME}:{settings.AM_PASS}@{settings.AM_HOST}:{settings.AM_PORT}/{settings.AM_DB_NAME}"
landing_db_url = f"postgresql://{settings.DB_USER_NAME}:{settings.DB_PASS}@{settings.DB_HOST}:{settings.DB_PORT}/{settings.DATABASE_NAME}"

# Create engines
am_engine = create_engine(am_db_url, pool_size=settings.CONNECTIONS_POOL)
landing_engine = create_engine(landing_db_url, pool_size=settings.CONNECTIONS_POOL)

# SQLite setup
SQLITE_URL = f"sqlite:///{settings.SQLITE_DB_PATH}"
ASYNC_SQLITE_URL = f"sqlite+aiosqlite:///{settings.SQLITE_DB_PATH}"

sqlite_engine = create_engine(SQLITE_URL)
async_sqlite_engine = create_async_engine(ASYNC_SQLITE_URL)
AsyncSessionLocal = sessionmaker(async_sqlite_engine, class_=AsyncSession, expire_on_commit=False)

# Create tables
Base.metadata.create_all(bind=sqlite_engine)

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

def get_all_tables():
    tables = {}
    
    # Get tables from asset_manager
    inspector = inspect(am_engine)
    tables['asset_manager'] = inspector.get_table_names()
    
    # Get tables from landing_tables
    inspector = inspect(landing_engine)
    tables['landing_tables'] = inspector.get_table_names()
    
    return tables 