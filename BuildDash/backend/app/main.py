from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import tables, layouts

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(tables.router, prefix="/api")
app.include_router(layouts.router, prefix="/api")