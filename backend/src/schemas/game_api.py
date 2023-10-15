from enum import Enum
from pydantic import BaseModel as BaseSchema

from ..lib.gamelogic import StoneColor

from .game import GameSettingsBase


class MessageType(str, Enum):
    SEARCH_CONNECT = "SEARCH_CONNECT"
    DISCONNECT = "DISCONNECT"
    GAME_START = "GAME_START"
    GOOD_TURN = "GOOD_TURN"
    BAD_TURN = "BAD_TURN"
    GAME_RECONNECT = "GAME_RECONNECT"
    GAME_END = "GAME_END"


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
    color: StoneColor = StoneColor.NONE
    leave: bool = False