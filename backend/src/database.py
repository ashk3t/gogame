from sqlalchemy import URL
from sqlalchemy.ext.asyncio import (
    create_async_engine,
    async_sessionmaker,
    AsyncAttrs,
)
from sqlalchemy.orm import DeclarativeBase
from .config import settings
import redis.asyncio as redis


class DBase(AsyncAttrs, DeclarativeBase):
    pass


def init_database():
    global engine, SessionMaker, redis_connection_pool
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
    redis_connection_pool = redis.ConnectionPool(
        host=settings.cache_host, port=settings.cache_port
    )


async def create_all():
    from . import models

    async with engine.begin() as conn:
        await conn.run_sync(DBase.metadata.create_all)


async def drop_all():
    async with engine.begin() as conn:
        await conn.run_sync(DBase.metadata.drop_all)


async def clear_tables():
    async with engine.begin() as conn:
        for table in reversed(DBase.metadata.sorted_tables):
            await conn.execute(table.delete())


def connect_redis():
    return redis.Redis(connection_pool=redis_connection_pool)


init_database()