from sqlalchemy import and_, select, true
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from ..schemas.player import *
from ..schemas.game_player import *
from ..models import GameModel, PlayerModel
from .utils import add_commit_refresh
from .generic import generate_basic_service_methods


class PlayerService:
    get, get_all, _, _, delete = generate_basic_service_methods(
        PlayerModel, PlayerResponse, PlayerCreate, None
    )

    @staticmethod
    async def get_by_token(ss: AsyncSession, token: str) -> PlayerExtendedResponse:
        result = await ss.execute(
            select(PlayerModel)
            .options(selectinload(PlayerModel.game).selectinload(GameModel.settings))
            .where(PlayerModel.token == token)
        )
        return PlayerExtendedResponse.model_validate(result.scalars().one())

    @staticmethod
    async def get_by_game_id(
        ss: AsyncSession, game_id: int, spectator: bool | None = None
    ) -> list[PlayerResponse]:
        result = await ss.execute(
            select(PlayerModel).where(
                and_(
                    PlayerModel.game_id == game_id,
                    true() if spectator is None else PlayerModel.spectator == spectator,
                )
            )
        )
        return list(map(PlayerResponse.model_validate, result.scalars()))

    @staticmethod
    async def create(ss: AsyncSession, schema: PlayerCreate) -> PlayerWithTokenResponse:
        model = PlayerModel(**schema.model_dump())
        await add_commit_refresh(ss, model)
        return PlayerWithTokenResponse.model_validate(model)