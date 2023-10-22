from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from .config import settings
from .database import clear_tables, create_all
from .router import routers


@asynccontextmanager
async def lifespan(app: FastAPI):
    if settings.reset_db_tables:
        await create_all()
    await clear_tables()
    yield


app = FastAPI(lifespan=lifespan)


app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_allow_origins,
    allow_credentials=settings.cors_allow_methods,
    allow_methods=settings.cors_allow_methods,
    allow_headers=settings.cors_allow_headers,
)

for router in routers:
    app.include_router(router)