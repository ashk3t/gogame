from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..dependencies import session
from ..schemas.player import *
from ..models import PlayerModel
from .utils import add_commit_refresh
from .generic import generate_basic_service_methods


class PlayerService:
    get, get_all, create, update, delete = generate_basic_service_methods(
        PlayerModel, PlayerResponse, PlayerCreate, PlayerUpdate
    )

    @staticmethod
    async def get_by_token(token: str) -> PlayerResponse | None:
        result = await session.execute(
            select(PlayerModel).where(PlayerModel.token == token)
        )
        return PlayerResponse.model_validate(result.scalars().one())

    @staticmethod
    async def get_by_game_id(game_id: int) -> list[PlayerResponse]:
        result = await session.execute(
            select(PlayerModel).where(PlayerModel.game_id == game_id)
        )
        return [
            PlayerResponse.model_validate(model)
            for model in list(result.scalars().all())
        ]