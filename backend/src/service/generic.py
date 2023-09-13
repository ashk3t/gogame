from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession
from abc import ABC
from pydantic import BaseModel as BaseSchema

from ..models import BaseModel
from .utils import add_commit_refresh


class BaseModelService(ABC):
    Model = BaseModel
    ResponseSchema = BaseSchema
    CreateSchema = BaseSchema
    UpdateSchema = BaseSchema

    @classmethod
    async def _get(cls, db: AsyncSession, id: int) -> Model:
        result = await db.execute(select(cls.Model).where(cls.Model.id == id))
        return result.scalars().one()

    @classmethod
    async def get(cls, db: AsyncSession, id: int) -> ResponseSchema:
        return cls.ResponseSchema.model_validate(cls._get(db, id))

    @classmethod
    async def get_all(
        cls, db: AsyncSession, skip: int = 0, limit: int = 100
    ) -> list[ResponseSchema]:
        result = await db.execute(select(cls.Model).offset(skip).limit(limit))
        return [
            cls.ResponseSchema.model_validate(model)
            for model in list(result.scalars().all())
        ]

    @classmethod
    async def create(cls, db: AsyncSession, schema: CreateSchema) -> ResponseSchema:
        result = cls.Model(**schema.model_dump())
        await add_commit_refresh(db, result)
        return cls.ResponseSchema.model_validate(result)

    @classmethod
    async def update(cls, db: AsyncSession, id: int, schema: UpdateSchema) -> ResponseSchema:
        model = await cls._get(db, id)
        for attr, value in schema.model_dump().items():
            setattr(model, attr, value)
        await add_commit_refresh(db, model)
        return cls.ResponseSchema.model_validate(model)

    @classmethod
    async def delete(cls, db: AsyncSession, id: int) -> None:
        await db.execute(delete(cls.Model).where(cls.Model.id == id))
        await db.commit()