from datetime import datetime
from pydantic import BaseModel as BaseSchema, ConfigDict, Field


INITIAL_GAME_STATE = "INITIAL"
DEFAULT_GAME_MODE = "CLASSIC"


class GameSettingsBase(BaseSchema):
    x_size: int
    y_size: int
    players: int
    mode: str = DEFAULT_GAME_MODE


class GameSettingsCreate(GameSettingsBase):
    pass


class GameSettingsResponse(GameSettingsCreate):
    id: int

    model_config = ConfigDict(from_attributes=True)


class GameBase(BaseSchema):
    pass


class GameCreate(GameBase):
    game_settings_id: int


class GameUpdate(GameBase):
    state: str


class GameResponse(GameBase):
    id: int
    game_settings_id: int
    start_time: datetime = Field(default_factory=datetime.utcnow)
    state: str = INITIAL_GAME_STATE

    model_config = ConfigDict(from_attributes=True)