from sqlalchemy import URL
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncAttrs
from sqlalchemy.orm import DeclarativeBase
from .config import settings


class DBase(AsyncAttrs, DeclarativeBase):
    pass


def init_database():
    global SessionMaker, engine

    database_url = URL.create(
        drivername=settings.db_driver,
        username=settings.db_user,
        password=settings.db_password,
        host=settings.db_host,
        port=int(settings.db_port),
        database=settings.db_name,
    )
    engine = create_async_engine(database_url)

    SessionMaker = async_sessionmaker(bind=engine, autocommit=False, autoflush=False)


async def init_models():
    from . import models

    async with engine.begin() as conn:
        await conn.run_sync(DBase.metadata.create_all)


init_database()