from fastapi.websockets import WebSocketDisconnect, WebSocketState
from pydantic import ValidationError
from sqlalchemy.exc import NoResultFound
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.sql.functions import count
from websockets.exceptions import ConnectionClosedOK
from fastapi import WebSocket
from sqlalchemy import and_, select
import sqlalchemy as alc
from sqlalchemy.orm import selectinload

from ..lib.gamelogic import GameBoard
from ..service.player import PlayerService
from ..schemas import *
from ..models import GameModel, GameSettingsModel
from .generic import generate_basic_service_methods
from ..service.utils import add_commit_refresh, equal_game_settings


class GameService:
    get, get_all, create, update, delete = generate_basic_service_methods(
        GameModel, GameResponse, GameCreate, GameUpdate
    )

    @staticmethod
    async def get_ext(ss: AsyncSession, id: int) -> GameExtendedResponse:
        result = await ss.execute(
            select(GameModel)
            .options(selectinload(GameModel.settings))
            .where(GameModel.id == id)
        )
        return GameExtendedResponse.model_validate(result.scalars().one())

    @staticmethod
    async def get_all_ext(
        ss: AsyncSession, offset: int = 0, limit: int = 10
    ) -> list[GameExtendedResponse]:
        result = await ss.execute(
            select(GameModel)
            .options(selectinload(GameModel.settings))
            .offset(offset)
            .limit(limit)
        )
        return list(map(GameExtendedResponse.model_validate, result.scalars()))

    @staticmethod
    async def find_relevant(ss: AsyncSession, settings_id: int) -> GameResponse | None:
        try:
            result = await ss.execute(
                select(GameModel)
                .where(
                    and_(
                        GameModel.start_time == None,
                        GameModel.settings_id == settings_id,
                    )
                )
                .order_by(GameModel.search_start_time),
            )
            return GameResponse.model_validate(result.scalars().first())
        except ValidationError:
            return

    @staticmethod
    async def start(ss: AsyncSession, id: int) -> GameResponse:
        settings = (await GameService.get_ext(ss, id)).settings
        rep = GameBoard(settings.height, settings.width, settings.players).to_rep()
        result = await ss.execute(
            alc.update(GameModel)
            .where(GameModel.id == id)
            .values(rep=rep, start_time=datetime.utcnow())
            .returning(GameModel)
        )
        model = result.scalars().one()
        await add_commit_refresh(ss, model)
        return GameResponse.model_validate(model)

    @staticmethod
    async def delete_all(ss: AsyncSession):
        await ss.execute(alc.delete(GameModel))
        await ss.commit()


class GameSettingsService:
    get, get_all, create, _, delete = generate_basic_service_methods(
        GameSettingsModel, GameSettingsResponse, GameSettingsCreate, None
    )

    @staticmethod
    async def find_same(
        ss: AsyncSession, settings: GameSettingsBase
    ) -> GameSettingsResponse | None:
        try:
            result = await ss.execute(
                select(GameSettingsModel).where(equal_game_settings(settings))
            )
            return GameSettingsResponse.model_validate(result.scalars().one())
        except NoResultFound:
            return

    @staticmethod
    async def clear(ss: AsyncSession) -> GameSettingsResponse | None:
        await ss.execute(
            alc.delete(GameSettingsModel).where(
                GameSettingsModel.id.in_(
                    select(GameSettingsModel.id)
                    .outerjoin(GameModel)
                    .group_by(GameSettingsModel.id)
                    .having(count(GameModel.id) == 0)
                )
            )
        )
        await ss.commit()


class LeaveException(Exception):
    pass


class GameConnectionManager:
    # {game_id: {player_id: websocket}}
    connections: dict[int, dict[int, WebSocket]] = {}

    def __init__(self, ss: AsyncSession, websocket: WebSocket):
        self.ss: AsyncSession = ss
        self.websocket: WebSocket = websocket
        self.game_id: int = 0
        self.player_id: int = 0
        self.spectator: bool = False
        self.in_game: bool = False

    async def __aenter__(self):
        await self.websocket.accept()
        return self

    async def __aexit__(self, exc_type, exc_value, exc_tb):
        if self.player_id and self.game_id:
            self.unbind_connection()
            if not self.in_game:
                await self.permanent_disconnect()
            await self.send_all(
                MessageType.DISCONNECT,
                **{"spectator_id" if self.spectator else "player_id": self.player_id}
            )
        if self.websocket.client_state == WebSocketState.CONNECTED:
            await self.websocket.close()

        if not exc_value or exc_type in [
            WebSocketDisconnect,
            ConnectionClosedOK,
            LeaveException,
        ]:
            return True

    def bind_connection(self, game_id: int, player_id: int, spectator: bool):
        self.game_id = game_id
        self.player_id = player_id
        self.spectator = spectator
        if not game_id in self.connections:
            self.connections[game_id] = {}
        self.connections[game_id][player_id] = self.websocket

    def unbind_connection(self):
        self.connections[self.game_id].pop(self.player_id)

    def permanent_exit(self):
        self.in_game = False
        raise LeaveException

    async def permanent_disconnect(self):
        await PlayerService.delete(self.ss, self.player_id)
        game_players = await PlayerService.get_by_game_id(self.ss, self.game_id)
        if len(game_players) == 0:
            self.connections.pop(self.game_id)
            await GameService.delete(self.ss, self.game_id)
            await GameSettingsService.clear(self.ss)

    async def get_data(self):
        return await self.websocket.receive_json()

    async def send_self(self, data_type: MessageType, **data):
        data["type"] = data_type
        await self.websocket.send_json(data)

    async def send_all(self, data_type: str, **data):
        data["type"] = data_type
        if self.game_id in self.connections:
            for connection in self.connections[self.game_id].values():
                await connection.send_json(data)

    async def wait(self):
        await self.websocket.receive_text()