from enum import Enum
from pydantic import BaseModel as BaseSchema, ConfigDict

from .game import GameSettingsBase


class MessageType(str, Enum):
    SEARCH_CONNECT = "SEARCH_CONNECT"
    SEARCH_DISCONNECT = "SEARCH_DISCONNECT"
    GAME_START = "GAME_START"
    GOOD_TURN = "GOOD_TURN"
    BAD_TURN = "BAD_TURN"
    GAME_RECONNECT = "GAME_RECONNECT"


class TurnType(str, Enum):
    BASIC = "BASIC"
    PASS = "PASS"
    FINISH = "FINISH"


class GameSearchRequest(GameSettingsBase):
    nickname: str


class GameJoinRequest(BaseSchema):
    nickname: str
    game_id: int


class TurnRequest(BaseSchema):
    type: TurnType
    i: int = -1
    j: int = -1