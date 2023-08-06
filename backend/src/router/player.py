from typing import Union

from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import APIRouter, Depends

from ..dependencies import get_db
from ..schemas.player import *
from .. import service as srv


router = APIRouter(prefix="/players")


@router.get("/{id}", response_model=PlayerResponse)
async def get_player(id: int, db: AsyncSession = Depends(get_db)):
    return srv.get_player(db, id)


@router.get("", response_model=Union[PlayerResponse, list[PlayerResponse]])
async def get_players(token: str | None = None, db: AsyncSession = Depends(get_db)):
    if token:
        return srv.get_player_by_token(db, token)
    return srv.get_all_players(db)


@router.post("")
async def create_player(player: PlayerCreate, db: AsyncSession = Depends(get_db)):
    return srv.create_player(db, player)