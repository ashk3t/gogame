import uuid
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..schemas.player import *
from ..models import PlayerModel
from .utils import add_commit_refresh
from .generic import BaseModelService


class PlayerService(BaseModelService):
    Model = PlayerModel
    ResponseSchema = PlayerResponse
    CreateSchema = PlayerCreate
    UpdateSchema = PlayerUpdate

    @classmethod
    async def get_by_token(cls, db: AsyncSession, token: str) -> ResponseSchema:
        result = await db.execute(select(cls.Model).where(cls.Model.token == token))
        return cls.ResponseSchema.model_validate(result.scalars().one())

    @classmethod
    async def create(cls, db: AsyncSession, player: CreateSchema) -> ResponseSchema:
        db_player = cls.Model(token=str(uuid.uuid4()), nickname=player.nickname)
        await add_commit_refresh(db, db_player)
        return cls.ResponseSchema.model_validate(db_player)

    @classmethod
    async def update(cls, db: AsyncSession, id: int, player: UpdateSchema) -> ResponseSchema:
        db_player: PlayerModel = await cls._get(db, id)
        db_player.nickname = player.nickname
        db_player.status = player.status
        await add_commit_refresh(db, db_player)
        return cls.ResponseSchema.model_validate(db_player)