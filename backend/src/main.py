from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .router import routers
from .database import SessionMaker


app = FastAPI()
session = None

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_allow_origins,
    allow_credentials=settings.cors_allow_methods,
    allow_methods=settings.cors_allow_methods,
    allow_headers=settings.cors_allow_headers,
)

for router in routers:
    app.include_router(router)


@app.middleware("http")
async def update_global_db_session(request: Request, call_next):
    global session
    session = SessionMaker()
    try:
        response = await call_next(request)
    except:
        await session.rollback()
    else:
        return response
    finally:
        await session.close()


@app.on_event("startup")
async def startup_event():
    from .database import clear_tables
    if settings.reset_db_tables:
        await clear_tables()


@app.on_event("shutdown")
async def shutdown_event():
    from .service.search import SearchService
    global session
    session = SessionMaker()
    await SearchService.delete_all()