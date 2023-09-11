from typing import Sequence
from sqlalchemy import delete, select
from .utils import add_commit_refresh
from sqlalchemy.ext.asyncio import AsyncSession


def get_query_factory(Model):
    async def get_query(db: AsyncSession, id: int) -> Model:
        result = await db.execute(select(Model).where(Model.id == id))
        return result.scalars().one()

    return get_query


def get_all_query_factory(Model):
    async def get_all_query(
        db: AsyncSession, skip: int = 0, limit: int = 100
    ) -> list[Model]:
        result = await db.execute(select(Model).offset(skip).limit(limit))
        return list(result.scalars().all())

    return get_all_query


def create_query_factory(Model, Schema):
    async def create_query(db: AsyncSession, schema: Schema) -> Model:
        result = Model(**schema.model_dump())
        await add_commit_refresh(db, result)
        return result

    return create_query


def delete_query_factory(Model):
    async def delete_query(db: AsyncSession, id: int) -> None:
        await db.execute(delete(Model).where(Model.id == id))
        await db.commit()

    return delete_query