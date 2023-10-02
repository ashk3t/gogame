from sqlalchemy import URL
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    create_async_engine,
    async_sessionmaker,
    AsyncAttrs,
)
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
    SessionMaker = async_sessionmaker(
        bind=engine, autocommit=False, autoflush=False, expire_on_commit=False
    )


async def hardreset_database():
    from . import models
    async with engine.begin() as conn:
        await conn.run_sync(DBase.metadata.drop_all)
        await conn.run_sync(DBase.metadata.create_all)


async def clear_tables():
    async with engine.begin() as conn:
        for table in reversed(DBase.metadata.sorted_tables):
            await conn.execute(table.delete())


init_database()