from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class SearchEntryBase(BaseModel):
    player_id: int
    mode: str = "default"


class SearchEntryCreate(SearchEntryBase):
    pass


class SearchEntryResponse(SearchEntryBase):
    id: int
    start_time: datetime = Field(default_factory=datetime.utcnow)

    model_config = ConfigDict(from_attributes=True)