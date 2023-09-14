import sqlalchemy as alc
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession
from abc import ABC, ABCMeta
from pydantic import BaseModel as BaseSchema

from ..models import BaseModel
from .utils import add_commit_refresh


class ModelServiceMeta(ABCMeta):
    REQUIRED_ATTRS = {"Model", "ResponseSchema", "CreateSchema", "UpdateSchema"}

    def __new__(cls, name: str, bases: tuple, dct: dict):
        BaseClass = None
        try:
            for BaseClass in (
                base for base in bases if "__generate_declosured_methods" in base.__dict__
            ):
                declosured_methods = BaseClass.__generate_declosured_methods(
                    *[dct[reqattr] for reqattr in cls.REQUIRED_ATTRS],
                )
                dct.update(declosured_methods)
        except KeyError:
            raise Exception(
                f"Required attributes are not implemented: {
                    cls.REQUIRED_ATTRS - set(BaseClass.__dict__.keys()) if BaseClass else set()
                }",
            )
        return type.__new__(cls, name, bases, dct)


class BaseModelService(ABC, metaclass=ModelServiceMeta):
    Model = BaseModel
    ResponseSchema = BaseSchema
    CreateSchema = BaseSchema
    UpdateSchema = BaseSchema

    @staticmethod
    def __generate_declosured_methods(
        Model, ResponseSchema, CreateSchema, UpdateSchema
    ):
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
        async def update(
            cls, db: AsyncSession, id: int, schema: UpdateSchema
        ) -> ResponseSchema:
            model = await cls._get(db, id)
            for attr, value in schema.model_dump().items():
                setattr(model, attr, value)
            await add_commit_refresh(db, model)
            return cls.ResponseSchema.model_validate(model)

        @classmethod
        async def delete(cls, db: AsyncSession, id: int) -> None:
            await db.execute(alc.delete(cls.Model).where(cls.Model.id == id))
            await db.commit()

        return _get, get, get_all, create, update