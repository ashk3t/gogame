import uuid
from pydantic import BaseModel as BaseSchema, ConfigDict

from ..lib.gamelogic import StoneColor
from .game import GameResponse


class PlayerBase(BaseSchema):
    nickname: str
    color: StoneColor


class PlayerCreate(PlayerBase):
    game_id: int
    token: str

    def __init__(self, nickname: str, game_id: int, color: StoneColor):
        super().__init__(
            nickname=nickname,
            color=color,
            game_id=game_id,  # pyright: ignore
            token=str(uuid.uuid4()),  # pyright: ignore
        )


class PlayerResponse(PlayerBase):
    id: int
    game_id: int

    model_config = ConfigDict(from_attributes=True)

class PlayerWithTokenResponse(PlayerResponse):
    token: str

class PlayerWithGameResponse(PlayerResponse):
    game: GameResponse