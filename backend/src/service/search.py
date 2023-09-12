from fastapi import BackgroundTasks, WebSocket
from sqlalchemy import desc

from ..models import *
from ..schemas import *
from .generic import *


get_search_entry = get_query_factory(SearchEntryModel)
get_all_search_entries = get_all_query_factory(SearchEntryModel)
create_search_entry = create_query_factory(SearchEntryModel, SearchEntryCreate)
delete_search_entry = delete_query_factory(SearchEntryModel)


async def find_paired_search_entry(
    db: AsyncSession, search_entry: SearchEntryCreate
) -> SearchEntryModel | None:
    try:
        result = await db.execute(
            select(SearchEntryModel)
            .where(SearchEntryModel.mode == search_entry.mode)
            .order_by(desc(SearchEntryModel.start_time)),
        )
        return result.scalars().one()
    except:
        return


async def clear_search_entries(db: AsyncSession):
    await db.execute(delete(SearchEntryModel))
    await db.commit()


class GameSearchManager:
    connections: dict[int, WebSocket] = {}

    def __init__(self, websocket: WebSocket):
        self.websocket = websocket

    async def __aenter__(self):
        await self.websocket.accept()
        return self

    async def __aexit__(self, exc_type, exc_value, exc_tb):
        await self.disconnect()
        return True

    async def disconnect(self, player_id: int | None = None):
        websocket = self.connections.pop(player_id if player_id else self.player_id, None)

    def identify_connection(self, player_id: int):
        self.player_id = player_id
        self.connections[player_id] = self.websocket

    async def get_nickname(self):
        return await self.websocket.receive_text()

    async def connect_players(self, white_player_id: int, black_player_id: int):
        for player_id, color in (
            (white_player_id, PlayerStatus.WHITE),
            (black_player_id, PlayerStatus.BLACK),
        ):
            websocket = self.connections[player_id]
            await websocket.send_json({"color": color})