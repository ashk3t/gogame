from sqlalchemy.ext.asyncio import AsyncSession
from fastapi.websockets import WebSocketDisconnect
from fastapi import WebSocket
from sqlalchemy import and_, delete, desc, select
from sqlalchemy.orm import selectinload

from ..dependencies import session
from ..schemas.game import *
from ..schemas.player import *
from ..models import GameModel, GameSettingsModel
from .generic import generate_basic_service_methods
from ..service.utils import equal_game_settings


class GameService:
    get, get_all, create, update, delete = generate_basic_service_methods(
        GameModel, GameResponse, GameCreate, GameUpdate
    )

    @staticmethod
    async def find_relevant(game_settings: GameSettingsBase) -> GameResponse | None:
        try:
            result = await session.execute(
                select(GameModel)
                .options(selectinload(GameModel.settings))
                .where(
                    GameModel.settings.has(equal_game_settings(game_settings))
                ).order_by(desc(GameModel.search_start_time)),
            )
            return GameResponse.model_validate(result.scalars().one())
        except:
            return

    @classmethod
    async def delete_all(cls):
        await session.execute(delete(GameModel))
        await session.commit()


class GameSettingsService:
    get, get_all, create, _, delete = generate_basic_service_methods(
        GameSettingsModel, GameSettingsResponse, GameSettingsCreate, None
    )


class GameSearchManager:
    # {game_id: [player_id: websocket]}
    connections: dict[int, dict[int, WebSocket]] = {}

    def __init__(self, websocket: WebSocket):
        self.websocket = websocket
        self.game_id = None
        self.player_id = None

    async def __aenter__(self):
        await self.websocket.accept()
        return self

    async def __aexit__(self, exc_type, exc_value, exc_tb):
        await self.unbind()
        if not exc_value or exc_type is WebSocketDisconnect:
            return True

    def bind(self, game_id: int, player_id: int):
        self.game_id = game_id
        self.player_id = player_id
        self.connections[game_id][player_id] = self.websocket

    async def unbind(self):
        if self.game_id and self.player_id:
            self.connections[self.game_id].pop(self.player_id)
            if len(self.connections[self.game_id]) == 0:
                self.connections.pop(self.game_id)

    async def get_gamedata(self):
        data: dict = await self.websocket.receive_json()
        return GameSearchRequest(**data)

    # async def connect_players(
    #     self, white_player: PlayerResponse, black_player: PlayerResponse
    # ):
    #     for player in (white_player, black_player):
    #         websocket = self.connections[player.id]
    #         await websocket.send_json(player.model_dump())

    async def wait(self):
        await self.websocket.receive_bytes()