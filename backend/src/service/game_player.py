from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession


from ..models import *
from ..schemas.player import *
from ..schemas.game_player import *
from .game import GameService
from .player import PlayerService


class GamePlayerService:
    @staticmethod
    async def get_all_ext_with_players(
        ss: AsyncSession, skip: int = 0, limit: int = 10
    ) -> list[GameExtendedWithPlayers]:
        games = await GameService.get_all_ext(ss)
        result = await ss.execute(
            select(PlayerModel).where(PlayerModel.game_id.in_(g.id for g in games))
        )
        players = list(map(PlayerResponse.model_validate, result.all()))

        games_by_id = {
            game.id: GameExtendedWithPlayers(**game.model_dump()) for game in games
        }
        for player in players:
            games_by_id[player.game_id].players.append(player)
        return list(games_by_id.values())
