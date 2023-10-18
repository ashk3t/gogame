from pydantic import BaseModel as BaseSchema, ConfigDict

from .game import GameExtendedResponse
from .player import PlayerResponse


class PlayerExtendedResponse(PlayerResponse):
    game: GameExtendedResponse


class GameExtendedWithPlayers(GameExtendedResponse):
    players: list[PlayerResponse] = []