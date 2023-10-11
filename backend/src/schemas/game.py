from datetime import datetime
from enum import Enum
from pydantic import BaseModel as BaseSchema, ConfigDict, Field

from ..schemas.player import PlayerBase


class GameMode(str, Enum):
    CLASSIC = "CLASSIC"
    ATATRI = "ATATRI"


class GameSettingsBase(BaseSchema):
    height: int
    width: int
    players: int
    mode: str = GameMode.CLASSIC


class GameSettingsCreate(GameSettingsBase):
    pass


class GameSettingsResponse(GameSettingsBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


class GameBase(BaseSchema):
    pass


class GameCreate(GameBase):
    settings_id: int


class GameUpdate(GameBase):
    rep: str | None


class GameResponse(GameBase):
    id: int
    settings_id: int
    start_time: datetime | None
    rep: str | None

    model_config = ConfigDict(from_attributes=True)


class GameSearchRequest(GameSettingsBase, PlayerBase):
    pass