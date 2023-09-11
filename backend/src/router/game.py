import asyncio
from typing import Annotated, Any, Union
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import (
    APIRouter,
    BackgroundTasks,
    Body,
    Depends,
    WebSocket,
    WebSocketDisconnect,
)

from ..service.search import GameSearchManager
from ..dependencies import get_db
from ..schemas import *
from .. import service as srv


router = APIRouter(prefix="/games")


@router.get("/{id}", response_model=GameResponse)
async def get_game(id: int, db: AsyncSession = Depends(get_db)):
    return await srv.get_game(db, id)


@router.get("", response_model=list[GameResponse])
async def get_games(db: AsyncSession = Depends(get_db)):
    return await srv.get_all_games(db)


@router.post("/start", response_model=GameResponse)
async def start_game(
    white_player_id: Annotated[int, Body(alias="white_player")],
    black_player_id: Annotated[int, Body(alias="black_player")],
    db: AsyncSession = Depends(get_db),
):
    new_game = GameCreate(
        white_player_id=white_player_id, black_player_id=black_player_id
    )
    return await srv.create_game(db, new_game)


@router.put("/make_turn/{game_id}", response_model=GameResponse)
async def make_turn(
    game_id: int,
    next_state: Annotated[str, Body(alias="state")],
    db: AsyncSession = Depends(get_db),
):
    return await srv.update_game(db, game_id, GameUpdate(state=next_state))


@router.delete("/finish/{id}")
async def finish_game(
    id: int, next_state: Annotated[str, Body], db: AsyncSession = Depends(get_db)
) -> None:
    game = await srv.get_game(db, id)
    await srv.delete_game(db, id)
    await srv.delete_player(db, game.white_player_id)
    await srv.delete_player(db, game.black_player_id)


@router.websocket("/search")
async def search_game(
    websocket: WebSocket,
    nickname: str,
    bg: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    async with GameSearchManager(websocket) as manager:
        new_player = PlayerCreate(nickname=nickname)
        db_player = await srv.create_player(db, new_player)
        manager.identify_connection(db_player.id)

        new_search_entry = SearchEntryCreate(player_id=db_player.id)
        paired_search_entry = await srv.find_paired_search_entry(db, new_search_entry)
        if paired_search_entry is not None:
            await srv.delete_search_entry(db, paired_search_entry.id)
            await manager.connect_players(paired_search_entry.player_id, db_player.id)
            await srv.delete_player(db, paired_search_entry.player_id)
            await srv.delete_player(db, db_player.id)
            # FIX: implement another db session creating system instead of dependency injections
            # asyncio.create_task(srv.delete_player(db, paired_search_entry.player_id))
            # asyncio.create_task(srv.delete_player(db, db_player.id))
        else:
            db_search_entry = await srv.create_search_entry(db, new_search_entry)
            await manager.websocket.receive_text()