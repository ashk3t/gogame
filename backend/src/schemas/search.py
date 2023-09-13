from datetime import datetime
from pydantic import BaseModel as BaseSchema, ConfigDict, Field


class SearchEntryBase(BaseSchema):
    player_id: int
    mode: str = "default"


class SearchEntryCreate(SearchEntryBase):
    pass


class SearchEntryUpdate(SearchEntryBase):
    pass


class SearchEntryResponse(SearchEntryBase):
    id: int
    start_time: datetime = Field(default_factory=datetime.utcnow)

    model_config = ConfigDict(from_attributes=True)