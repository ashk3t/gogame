from enum import Enum
from pydantic import BaseModel, ConfigDict


class PlayerRoles(str, Enum):
    WHITE = "WHITE"
    BLACK = "BLACK"
    SPECTATOR = "SPECTATOR"
    SEARCH = "SEARCH"


class PlayerBase(BaseModel):
    nickname: str


class PlayerCreate(PlayerBase):
    pass


class PlayerUpdate(PlayerBase):
    role: PlayerRoles


class PlayerResponse(PlayerBase):
    id: int
    token: int
    role: PlayerRoles

    model_config = ConfigDict(from_attributes=True)