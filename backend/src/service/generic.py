import sqlalchemy as alc
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel as BaseSchema

from ..models import BaseModel
from .utils import add_commit_refresh


class ModelServiceMeta(type):
    REQUIRED_ATTRS = {"Model", "ResponseSchema", "CreateSchema", "UpdateSchema"}

    def __new__(cls, name: str, bases: tuple, dct: dict):
        BaseClass = None
        all_declosured_methods = {}
        try:
            for BaseClass in (
                base
                for base in reversed(bases)
                if f"_generate_declosured_methods_" in base.__dict__
            ):
                declosured_methods = BaseClass._generate_declosured_methods_(
                    *[dct[reqattr] for reqattr in cls.REQUIRED_ATTRS],
                )
                all_declosured_methods.update(
                    {meth.__name__: meth for meth in declosured_methods}
                )
        except KeyError:
            raise Exception(
                f"""Required attributes are not implemented: {
                    cls.REQUIRED_ATTRS - set(BaseClass.__dict__.keys()) if BaseClass else set()
                }""",
            )
        return type.__new__(cls, name, bases, {**all_declosured_methods, **dct})

class BaseModelService(metaclass=ModelServiceMeta):
    Model = BaseModel
    ResponseSchema = BaseSchema
    CreateSchema = BaseSchema
    UpdateSchema = BaseSchema

    @staticmethod
    def _generate_declosured_methods_(
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

        return _get, get, get_all, create, update, delete