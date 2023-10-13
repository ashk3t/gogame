from fastapi.websockets import WebSocketDisconnect
from fastapi import WebSocket
import sqlalchemy as alc
from sqlalchemy import and_, delete, desc, select
from sqlalchemy.orm import selectinload

from ..lib.gamelogic import GameBoard
from ..service.player import PlayerService
from ..dependencies import session
from ..schemas import *
from ..models import GameModel, GameSettingsModel
from .generic import generate_basic_service_methods
from ..service.utils import equal_game_settings


class GameService:
    get, get_all, create, update, delete = generate_basic_service_methods(
        GameModel, GameResponse, GameCreate, GameUpdate
    )

    @staticmethod
    async def get_all_ext(skip: int = 0, limit: int = 10) -> list[GameExtendedResponse]:
        result = await session.execute(
            select(GameModel)
            .options(selectinload(GameModel.settings))
            .offset(skip)
            .limit(limit)
        )
        return list(map(GameExtendedResponse.model_validate, result.scalars().all()))

    @staticmethod
    async def find_relevant(settings: GameSettingsBase) -> GameResponse | None:
        try:
            result = await session.execute(
                select(GameModel)
                # .options(selectinload(GameModel.settings))
                .where(
                    and_(
                        GameModel.start_time == None,
                        GameModel.settings.has(equal_game_settings(settings)),
                    )
                ).order_by(desc(GameModel.search_start_time)),
            )
            return GameResponse.model_validate(result.scalars().one())
        except:
            return

    @staticmethod
    async def start(id: int, settings: GameSettingsBase):
        result = await session.execute(
            alc.update(GameModel)
            .where(GameModel.id == id)
            .values(
                rep=GameBoard(
                    settings.height, settings.width, settings.players
                ).to_rep(),
                start_time=datetime.utcnow(),
            )
            .returning(GameModel)
        )
        return GameResponse.model_validate(result.scalars().one())

    @staticmethod
    async def delete_all():
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
        self.game_id = 0
        self.player_id = 0

    async def __aenter__(self):
        await self.websocket.accept()
        return self

    async def __aexit__(self, exc_type, exc_value, exc_tb):
        await self.unbind_connection()
        if not exc_value or exc_type is WebSocketDisconnect:
            return True

    def bind_connection(self, game_id: int, player_id: int):
        self.game_id = game_id
        self.player_id = player_id
        if not game_id in self.connections:
            self.connections[game_id] = {}
        self.connections[game_id][player_id] = self.websocket

    async def unbind_connection(self):
        if self.game_id and self.player_id:
            self.connections[self.game_id].pop(self.player_id)
            await PlayerService.delete(self.player_id)
            await self.send_all("player_disconnect", player_id=self.player_id)
            if len(self.connections[self.game_id]) == 0:
                self.connections.pop(self.game_id)
                await GameService.delete(self.game_id)

    async def get_gamedata(self):
        data = await self.websocket.receive_json()
        return GameSearchRequest(**data)

    async def send_self(self, data_type: str, **data):
        data["type"] = data_type
        await self.websocket.send_json(data)

    async def send_all(self, data_type: str, **data):
        data["type"] = data_type
        for connection in self.connections[self.game_id].values():
            await connection.send_json(data)

    async def wait_message(self) -> dict:
        return await self.websocket.receive_json()