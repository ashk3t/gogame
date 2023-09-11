from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .router import routers
from .dependencies import SessionMaker


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_allow_origins,
    allow_credentials=settings.cors_allow_methods,
    allow_methods=settings.cors_allow_methods,
    allow_headers=settings.cors_allow_headers,
)

for router in routers:
    app.include_router(router)


@app.on_event("startup")
async def startup_event():
    from .database import reset_tables
    if settings.reset_db_tables:
        await reset_tables()


@app.on_event("shutdown")
async def shutdown_event():
    from .service.search import clear_search_entries
    async with SessionMaker() as db:
        await clear_search_entries(db)