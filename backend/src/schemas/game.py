from datetime import datetime
from enum import Enum
from pydantic import BaseModel as BaseSchema, ConfigDict


class GameMode(str, Enum):
    CLASSIC = "CLASSIC"
    ATATRI = "ATATRI"


class GameSettingsBase(BaseSchema):
    height: int = 19
    width: int = 19
    players: int = 2
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
    rep: str


class GameResponse(GameBase):
    id: int
    settings_id: int
    start_time: datetime | None
    rep: str | None

    model_config = ConfigDict(from_attributes=True)


class GameExtendedResponse(GameResponse):
    settings: GameSettingsResponse


class GameSearchRequest(GameSettingsBase):
    nickname: str


class GameJoinRequest(BaseSchema):
    nickname: str
    game_id: int