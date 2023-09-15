from fastapi import BackgroundTasks, WebSocket
from sqlalchemy import desc
from sqlalchemy.orm import selectinload

from ..models import *
from ..schemas import *
from .generic import *


class SearchService:
    _get, get, get_all, create, update, delete = generate_basic_service_methods(
        SearchEntryModel, SearchEntryResponse, SearchEntryCreate, SearchEntryUpdate
    )

    @staticmethod
    async def find_paired(
        db: AsyncSession, search_entry: SearchEntryCreate
    ) -> SearchEntryModel | None:
        try:
            result = await db.execute(
                select(SearchEntryModel)
                .options(selectinload(SearchEntryModel.player))
                .where(SearchEntryModel.mode == search_entry.mode)
                .order_by(desc(SearchEntryModel.start_time)),
            )
            return result.scalars().one()
        except:
            return

    @classmethod
    async def delete_all(cls, db: AsyncSession):
        await db.execute(delete(SearchEntryModel))
        await db.commit()


class GameSearchManager:
    connections: dict[int, WebSocket] = {}

    def __init__(self, websocket: WebSocket):
        self.websocket = websocket
        self.player_id = None

    async def __aenter__(self):
        await self.websocket.accept()
        return self

    async def __aexit__(self, exc_type, exc_value, exc_tb):
        if exc_value:
            return
        await self.disconnect()
        return True

    async def disconnect(self, player_id: int | None = None):
        conn_key = player_id or self.player_id or -1
        websocket = self.connections.pop(conn_key, None)

    def identify_connection(self, player_id: int):
        self.player_id = player_id
        self.connections[player_id] = self.websocket

    async def get_nickname(self):
        return await self.websocket.receive_text()

    async def connect_players(
        self, white_player: PlayerResponse, black_player: PlayerResponse
    ):
        for player in (white_player, black_player):
            websocket = self.connections[player.id]
            await websocket.send_json(player.model_dump())