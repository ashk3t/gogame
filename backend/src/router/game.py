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
from ..service import *


router = APIRouter(prefix="/games")

@router.get("/{id}", response_model=GameResponse)
async def get_game(id: int, db: AsyncSession = Depends(get_db)):
    return await GameService.get(db, id)


@router.get("", response_model=list[GameResponse])
async def get_games(db: AsyncSession = Depends(get_db)):
    return await GameService.get_all(db)


@router.post("/start", response_model=GameResponse)
async def start_game(
    white_player_id: Annotated[int, Body(alias="white_player")],
    black_player_id: Annotated[int, Body(alias="black_player")],
    db: AsyncSession = Depends(get_db),
):
    new_game = GameCreate(
        white_player_id=white_player_id, black_player_id=black_player_id
    )
    return await GameService.create(db, new_game)


@router.put("/make_turn/{game_id}", response_model=GameResponse)
async def make_turn(
    game_id: int,
    next_state: Annotated[str, Body(alias="state")],
    db: AsyncSession = Depends(get_db),
):
    return await GameService.update(db, game_id, GameUpdate(state=next_state))


@router.delete("/finish/{id}")
async def finish_game(
    id: int, next_state: Annotated[str, Body], db: AsyncSession = Depends(get_db)
) -> None:
    game = await GameService.get(db, id)
    await GameService.delete(db, id)
    await PlayerService.delete(db, game.white_player_id)
    await PlayerService.delete(db, game.black_player_id)


@router.websocket("/search")
async def search_game(
    websocket: WebSocket,
    nickname: str,
    db: AsyncSession = Depends(get_db),
):
    async with GameSearchManager(websocket) as manager:
        new_player = PlayerCreate(nickname=nickname)
        db_current_player = await PlayerService.create(db, new_player)
        manager.identify_connection(db_current_player.id)

        new_search_entry = SearchEntryCreate(player_id=db_current_player.id)
        db_paired_search_entry = await SearchService.find_paired(db, new_search_entry)

        if db_paired_search_entry is not None:
            white_player = PlayerUpdate.model_validate(db_paired_search_entry.player)
            black_player = PlayerUpdate.model_validate(db_current_player)
            white_player.status = PlayerStatus.WHITE
            black_player.status = PlayerStatus.BLACK

            await SearchService.delete(db, db_paired_search_entry.id)
            white_player = PlayerResponse.model_validate(await PlayerService.update(db, white_player.id, white_player))
            black_player = PlayerResponse.model_validate(await PlayerService.update(db, black_player.id, black_player))
            await manager.connect_players(white_player, black_player)
        else:
            await SearchService.create(db, new_search_entry)
            await manager.websocket.receive_text()