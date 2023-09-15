import sqlalchemy as alc
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel as BaseSchema

from ..models import BaseModel
from .utils import add_commit_refresh


def generate_basic_service_methods(Model, ResponseSchema, CreateSchema, UpdateSchema):
    @staticmethod
    async def _get(db: AsyncSession, id: int) -> Model:
        result = await db.execute(select(Model).where(Model.id == id))
        return result.scalars().one()

    @staticmethod
    async def get(db: AsyncSession, id: int) -> ResponseSchema:
        return ResponseSchema.model_validate(_get(db, id))

    @staticmethod
    async def get_all(
        db: AsyncSession, skip: int = 0, limit: int = 100
    ) -> list[ResponseSchema]:
        result = await db.execute(select(Model).offset(skip).limit(limit))
        return [
            ResponseSchema.model_validate(model)
            for model in list(result.scalars().all())
        ]

    @staticmethod
    async def create(db: AsyncSession, schema: CreateSchema) -> ResponseSchema:
        model = Model(**schema.model_dump())
        await add_commit_refresh(db, model)
        return ResponseSchema.model_validate(model)

    @staticmethod
    async def update(db: AsyncSession, id: int, schema: UpdateSchema) -> ResponseSchema:
        result = await db.execute(
            alc.update(Model)
            .where(Model.id == id)
            .values(**schema.model_dump())
            .returning(Model)
        )
        return ResponseSchema.model_validate(result.scalars().one())

    @staticmethod
    async def delete(db: AsyncSession, id: int) -> None:
        await db.execute(alc.delete(Model).where(Model.id == id))
        await db.commit()

    return _get, get, get_all, create, update, delete