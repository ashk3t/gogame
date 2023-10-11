import sqlalchemy as alc
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel as BaseSchema

from ..dependencies import session
from ..models import BaseModel
from .utils import add_commit_refresh


def generate_basic_service_methods(Model, ResponseSchema, CreateSchema, UpdateSchema):
    @staticmethod
    async def get(id: int) -> ResponseSchema:
        result = await session.execute(select(Model).where(Model.id == id))
        return ResponseSchema.model_validate(result.scalars().one())

    @staticmethod
    async def get_all(skip: int = 0, limit: int = 100) -> list[ResponseSchema]:
        result = await session.execute(select(Model).offset(skip).limit(limit))
        return [
            ResponseSchema.model_validate(model)
            for model in list(result.scalars().all())
        ]

    @staticmethod
    async def create(schema: CreateSchema) -> ResponseSchema:
        model = Model(**schema.model_dump())
        await add_commit_refresh(model)
        return ResponseSchema.model_validate(model)

    @staticmethod
    async def update(id: int, schema: UpdateSchema) -> ResponseSchema:
        result = await session.execute(
            alc.update(Model)
            .where(Model.id == id)
            .values(**schema.model_dump())
            .returning(Model)
        )
        return ResponseSchema.model_validate(result.scalars().one())

    @staticmethod
    async def delete(id: int) -> None:
        await session.execute(alc.delete(Model).where(Model.id == id))
        await session.commit()

    return get, get_all, create, update, delete