from typing import Union

from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import APIRouter, Depends

from ..schemas.player import *
from ..service import PlayerService


router = APIRouter(prefix="/players")


@router.get("/{id}", response_model=PlayerResponse)
async def get_player(id: int):
    return PlayerService.get(id)


@router.get("", response_model=Union[PlayerResponse, list[PlayerResponse]])
async def get_players(token: str | None = None):
    if token:
        return PlayerService.get_by_token(token)
    return PlayerService.get_all()


@router.post("")
async def create_player(player: PlayerCreate):
    return PlayerService.create(player)