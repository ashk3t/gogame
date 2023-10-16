from enum import Enum
from pydantic import BaseModel as BaseSchema

from ..lib.gamelogic import StoneColor

from .game import GameSettingsBase


class MessageType(str, Enum):
    CONNECT = "CONNECT"
    DISCONNECT = "DISCONNECT"
    RECONNECT = "RECONNECT"
    GAME_START = "GAME_START"
    GAME_CONTINUE = "GAME_CONTINUE"
    GOOD_TURN = "GOOD_TURN"
    BAD_TURN = "BAD_TURN"


class TurnType(str, Enum):
    BASIC = "BASIC"
    PASS = "PASS"
    FINISH = "FINISH"
    LEAVE = "LEAVE"


class GameCreateRequest(GameSettingsBase):
    nickname: str


class GameJoinRequest(BaseSchema):
    nickname: str
    game_id: int


class TurnRequest(BaseSchema):
    type: TurnType
    i: int = -1
    j: int = -1
    color: StoneColor = StoneColor.NONE