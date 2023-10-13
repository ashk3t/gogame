import uuid
from enum import Enum
from pydantic import BaseModel as BaseSchema, ConfigDict, ValidationError


class PlayerStatus(str, Enum):
    PLAYING = "PLAYING"
    SPECTATOR = "SPECTATOR"
    SEARCH = "SEARCH"


class PlayerBase(BaseSchema):
    nickname: str


class PlayerCreate(PlayerBase):
    game_id: int
    token: str

    def __init__(self, nickname: str, game_id: int):
        super().__init__(
            nickname=nickname,
            game_id=game_id,  # pyright: ignore
            token=str(uuid.uuid4()),  # pyright: ignore
        )


class PlayerUpdate(PlayerBase):
    status: PlayerStatus

    model_config = ConfigDict(from_attributes=True)


class PlayerResponse(PlayerUpdate):
    id: int

class PlayerWithTokenResponse(PlayerResponse):
    token: str