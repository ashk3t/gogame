from typing import Annotated, Any, Union

from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import APIRouter, Body, Depends

from ..dependencies import get_db
from ..schemas.game import *
from .. import service as srv


router = APIRouter(prefix="/games")


@router.get("/{id}", response_model=GameResponse)
async def get_game(id: int, db: AsyncSession = Depends(get_db)):
    return await srv.get_game(db, id)


# @router.get("", response_model=list[GameResponse])
@router.get("")
async def get_games(db: AsyncSession = Depends(get_db)):
    # return await srv.get_all_games(db)
    return ["game 1", "game 2", "game 3", "game 4", "game 5"]


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