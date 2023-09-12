from enum import Enum
from pydantic import BaseModel, ConfigDict


class PlayerStatus(str, Enum):
    WHITE = "WHITE"
    BLACK = "BLACK"
    SPECTATOR = "SPECTATOR"
    SEARCH = "SEARCH"


class PlayerBase(BaseModel):
    nickname: str


class PlayerCreate(PlayerBase):
    pass


class PlayerUpdate(PlayerBase):
    status: PlayerStatus


class PlayerResponse(PlayerBase):
    id: int
    token: int
    status: PlayerStatus

    model_config = ConfigDict(from_attributes=True)