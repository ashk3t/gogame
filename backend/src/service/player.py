import uuid
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..dependencies import session
from ..schemas.player import *
from ..models import PlayerModel
from .utils import add_commit_refresh
from .generic import generate_basic_service_methods


class PlayerService:
    _get, get, get_all, _, update, delete = generate_basic_service_methods(
        PlayerModel, PlayerResponse, PlayerCreate, PlayerUpdate
    )

    @staticmethod
    async def get_by_token(token: str) -> PlayerResponse:
        result = await session.execute(select(PlayerModel).where(PlayerModel.token == token))
        return PlayerResponse.model_validate(result.scalars().one())

    @staticmethod
    async def create(player: PlayerCreate) -> PlayerResponse:
        model = PlayerModel(token=str(uuid.uuid4()), nickname=player.nickname)
        await add_commit_refresh(model)
        return PlayerResponse.model_validate(model)