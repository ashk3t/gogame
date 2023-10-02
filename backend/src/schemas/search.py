from datetime import datetime
from pydantic import BaseModel as BaseSchema, ConfigDict, Field

from .game import GameSettingsBase
from .player import PlayerBase


class SearchEntryRequest(GameSettingsBase, PlayerBase):
    pass


class SearchEntryBase(BaseSchema):
    pass


class SearchEntryCreate(SearchEntryBase):
    player_id: int
    game_settings: GameSettingsBase


class SearchEntryResponse(SearchEntryBase):
    id: int
    player_id: int
    start_time: datetime = Field(default_factory=datetime.utcnow)

    model_config = ConfigDict(from_attributes=True)