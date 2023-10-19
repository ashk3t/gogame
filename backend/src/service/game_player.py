from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from .utils import nest
from ..models import *
from ..schemas.player import *
from ..schemas.game_player import *
from .game import GameService
from .player import PlayerService


class GamePlayerService:
    @staticmethod
    async def get_games_full(
        ss: AsyncSession, offset: int = 0, limit: int = 10
    ) -> list[GameExtendedWithPlayers]:
        games = await GameService.get_all_ext(ss, offset, limit)
        players = await PlayerService.get_by_game_ids(
            ss, [game.id for game in games], False
        )
        return nest(games, players, "id", "game_id", GameExtendedWithPlayers)

    @staticmethod
    async def get_games_full_by_ids(
        ss: AsyncSession, ids: list[int]
    ) -> list[GameExtendedWithPlayers]:
        result = await ss.execute(
            select(GameModel)
            .where(GameModel.id.in_(ids))
            .options(selectinload(GameModel.settings))
        )
        games = list(map(GameExtendedResponse.model_validate, result.scalars()))
        players = await PlayerService.get_by_game_ids(ss, ids, False)
        return nest(games, players, "id", "game_id", GameExtendedWithPlayers)