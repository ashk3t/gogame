from typing import Union

from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import APIRouter, Depends

from ..dependencies import get_session
from ..schemas.player import *
from ..service import PlayerService


router = APIRouter(prefix="/players")


@router.get("/{id}", response_model=PlayerResponse)
async def get_player(id: int, ss: AsyncSession = Depends(get_session)):
    return PlayerService.get(ss, id)


@router.get("", response_model=Union[PlayerResponse, list[PlayerResponse]])
async def get_players(ss: AsyncSession = Depends(get_session)):
    return PlayerService.get_all(ss)