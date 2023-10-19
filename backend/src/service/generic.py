import sqlalchemy as alc
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.dependencies import get_session

from .utils import add_commit_refresh


def generate_basic_service_methods(Model, ResponseSchema, CreateSchema, UpdateSchema):
    @staticmethod
    async def get(ss: AsyncSession, id: int) -> ResponseSchema:
        result = await ss.execute(select(Model).where(Model.id == id))
        return ResponseSchema.model_validate(result.scalars().one())

    @staticmethod
    async def get_all(ss: AsyncSession, offset: int = 0, limit: int = 10) -> list[ResponseSchema]:
        result = await ss.execute(select(Model).offset(offset).limit(limit))
        return list(map(ResponseSchema.model_validate, result.scalars()))

    @staticmethod
    async def create(ss: AsyncSession, schema: CreateSchema) -> ResponseSchema:
        model = Model(**schema.model_dump())
        await add_commit_refresh(ss, model)
        return ResponseSchema.model_validate(model)

    @staticmethod
    async def update(ss: AsyncSession, id: int, schema: UpdateSchema) -> ResponseSchema:
        result = await ss.execute(
            alc.update(Model)
            .where(Model.id == id)
            .values(**schema.model_dump())
            .returning(Model)
        )
        model = result.scalars().one()
        await add_commit_refresh(ss, model)
        return ResponseSchema.model_validate(model)

    @staticmethod
    async def delete(ss: AsyncSession, id: int) -> None:
        await ss.execute(alc.delete(Model).where(Model.id == id))
        await ss.commit()

    return get, get_all, create, update, delete