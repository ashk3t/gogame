from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..dependencies import session
from ..schemas.player import *
from ..models import PlayerModel
from .utils import add_commit_refresh
from .generic import generate_basic_service_methods


class PlayerService:
    get, get_all, _, _, delete = generate_basic_service_methods(
        PlayerModel, PlayerResponse, PlayerCreate, None
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
        return list(map(PlayerResponse.model_validate, result.scalars().all()))


    @staticmethod
    async def create(schema: PlayerCreate) -> PlayerWithTokenResponse:
        model = PlayerModel(**schema.model_dump())
        await add_commit_refresh(model)
        return PlayerWithTokenResponse.model_validate(model)