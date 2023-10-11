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

    def __init__(self, nickname: str, game_id: int) -> None:
        super().__init__(nickname=nickname)
        self.game_id = game_id
        self.token = str(uuid.uuid4())


class PlayerUpdate(PlayerBase):
    id: int
    status: PlayerStatus

    model_config = ConfigDict(from_attributes=True)


class PlayerResponse(PlayerUpdate):
    id: int
    token: str