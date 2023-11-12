from asyncio.tasks import Task
from fastapi.websockets import WebSocketDisconnect, WebSocketState
from sqlalchemy.ext.asyncio import AsyncSession
import asyncio
from websockets.exceptions import ConnectionClosedOK
from fastapi import WebSocket
import json

from ..database import connect_redis
from .utils import nest, reuse_event_loop
from ..models import *
from ..schemas import *
from .game import *
from .player import PlayerService


class GamePlayerService:
    @staticmethod
    async def get_games_full(
        ss: AsyncSession, nickname: str | None = None, **kwargs
    ) -> list[GameExtendedWithPlayers]:
        if nickname:
            players = await PlayerService.get_by_nickname(ss, nickname)
            games = await GameService.get_all_ext(
                ss, **kwargs, game_ids=[p.game_id for p in players]
            )
        else:
            games = await GameService.get_all_ext(ss, **kwargs)
        players = await PlayerService.get_by_game_ids(
            ss, [game.id for game in games], False
        )
        return nest(games, players, "id", "game_id", GameExtendedWithPlayers)

    @staticmethod
    async def get_games_full_by_ids(
        ss: AsyncSession, ids: list[int]
    ) -> list[GameExtendedWithPlayers]:
        games = await GameService.get_many_ext(ss, ids=ids)
        players = await PlayerService.get_by_game_ids(ss, ids, False)
        return nest(games, players, "id", "game_id", GameExtendedWithPlayers)

    @staticmethod
    async def count_games(
        ss: AsyncSession,
        nickname: str | None = None,
        **kwargs,
    ) -> int:
        if nickname:
            players = await PlayerService.get_by_nickname(ss, nickname)
            kwargs["game_ids"] = [p.game_id for p in players]
        return await GameService.count(ss, **kwargs)


class LeaveException(Exception):
    pass


class GameConnectionManager:
    def __init__(self, ss: AsyncSession, websocket: WebSocket):
        self.ss: AsyncSession = ss
        self.websocket: WebSocket = websocket
        self.game_id: int = 0
        self.player_id: int = 0
        self.spectator: bool = False
        self.in_game: bool = False

    async def __aenter__(self):
        self.redis = connect_redis()
        self.pubsub = self.redis.pubsub()
        self.pubsub_broadcasting: Task | None = None
        await self.websocket.accept()
        return self

    async def __aexit__(self, exc_type, exc_value, exc_tb):
        if self.player_id and self.game_id:
            if not self.in_game:
                await self.permanent_disconnect()
            await self.send_all(
                MessageType.DISCONNECT,
                **{"spectator_id" if self.spectator else "player_id": self.player_id},
            )

        if self.pubsub_broadcasting is not None:
            self.pubsub_broadcasting.cancel()
        await self.pubsub.close()
        if self.websocket.client_state == WebSocketState.CONNECTED:
            await self.websocket.close()

        if not exc_value or exc_type in [
            WebSocketDisconnect,
            ConnectionClosedOK,
            LeaveException,
        ]:
            return True

    async def __broadcast_pubsub(self):
        while True:
            message = await self.pubsub.get_message(True, timeout=None)
            if message and message["type"] == "message":
                data = json.loads(message["data"])
                await self.websocket.send_json(data)

    @property
    def channel(self):
        return str(self.game_id)

    async def bind_connection(self, game_id: int, player_id: int, spectator: bool):
        self.game_id = game_id
        self.player_id = player_id
        self.spectator = spectator
        await self.pubsub.subscribe(self.channel)
        self.pubsub_broadcasting = asyncio.create_task(self.__broadcast_pubsub())

    async def count_connections(self) -> int:
        return (await self.redis.pubsub_numsub(self.channel))[0][1]

    def permanent_exit(self):
        self.in_game = False
        raise LeaveException

    async def permanent_disconnect(self):
        await PlayerService.delete(self.ss, self.player_id)
        game_players = await PlayerService.get_by_game_id(self.ss, self.game_id)
        if len(game_players) == 0:
            await GameService.delete(self.ss, self.game_id)
            await GameSettingsService.clear(self.ss)

    async def get_data(self):
        return await self.websocket.receive_json()

    async def send_self(self, data_type: MessageType, **data):
        data["type"] = data_type
        await self.websocket.send_json(data)

    async def send_all(self, data_type: str, **data):
        data["type"] = data_type
        await self.redis.publish(self.channel, json.dumps(data))

    async def wait(self):
        await self.websocket.receive_text()