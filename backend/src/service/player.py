import uuid
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..schemas.player import *
from ..models import PlayerModel
from .utils import add_commit_refresh
from .generic import generate_basic_service_methods


class PlayerService:
    _get, get, get_all, _, update, delete = generate_basic_service_methods(
        PlayerModel, PlayerResponse, PlayerCreate, PlayerUpdate
    )

    @staticmethod
    async def get_by_token(db: AsyncSession, token: str) -> PlayerResponse:
        result = await db.execute(select(PlayerModel).where(PlayerModel.token == token))
        return PlayerResponse.model_validate(result.scalars().one())

    @staticmethod
    async def create(db: AsyncSession, player: PlayerCreate) -> PlayerResponse:
        db_player = PlayerModel(token=str(uuid.uuid4()), nickname=player.nickname)
        await add_commit_refresh(db, db_player)
        return PlayerResponse.model_validate(db_player)