from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


INITIAL_GAME_STATE = "INITIAL"


class GameBase(BaseModel):
    pass


class GameCreate(GameBase):
    white_player_id: int
    black_player_id: int


class GameUpdate(GameBase):
    state: str


class GameResponse(GameBase):
    id: int
    white_player_id: int
    black_player_id: int
    start_time: datetime = Field(default_factory=datetime.utcnow)
    state: str = INITIAL_GAME_STATE

    model_config = ConfigDict(from_attributes=True)