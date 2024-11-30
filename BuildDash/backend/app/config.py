from pydantic_settings import BaseSettings
from pydantic import Field
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    AM_HOST: str = Field(..., env='AM_HOST')
    AM_PORT: int = Field(..., env='AM_PORT')
    AM_USER_NAME: str = Field(..., env='AM_USER_NAME')
    AM_PASS: str = Field(..., env='AM_PASS')
    AM_DB_NAME: str = Field(..., env='AM_DB_NAME')
    
    DB_HOST: str = Field(..., env='DB_HOST')
    DB_PORT: int = Field(..., env='DB_PORT')
    DB_USER_NAME: str = Field(..., env='DB_USER_NAME')
    DB_PASS: str = Field(..., env='DB_PASS')
    DATABASE_NAME: str = Field(..., env='DATABASE_NAME')
    CONNECTIONS_POOL: int = Field(..., env='CONNECTIONS_POOL')
    
    # SQLite settings
    SQLITE_DB_PATH: str = "layouts.db"

    class Config:
        env_file = ".env"

settings = Settings() 