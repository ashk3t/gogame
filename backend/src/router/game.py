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

from src.service.game import GameSettingsService

from ..service.search import GameSearchManager
from ..schemas import *
from ..service import *


router = APIRouter(prefix="/games")

@router.get("/{id}", response_model=GameResponse)
async def get_game(id: int):
    return await GameService.get(id)


@router.get("", response_model=list[GameResponse])
async def get_games():
    return await GameService.get_all()


@router.websocket("/search")
async def search_game(websocket: WebSocket, gamedata: SearchEntryRequest):
    async with GameSearchManager(websocket) as manager:
        game_settings = await GameSettingsService.create(GameSettingsCreate(**gamedata.model_dump()))
        current_player = await PlayerService.create(PlayerCreate(nickname=gamedata.nickname))
        manager.identify_connection(current_player.id)

        new_search_entry = SearchEntryCreate(player_id=current_player.id, game_settings=game_settings)
        paired_search_entry = await SearchService.find_paired(new_search_entry)

        if paired_search_entry is not None:
            white_player = PlayerUpdate.model_validate(paired_search_entry.player)
            black_player = PlayerUpdate.model_validate(current_player)
            white_player.status = PlayerStatus.PLAYING
            black_player.status = PlayerStatus.PLAYING

            await SearchService.delete(paired_search_entry.id)
            white_player = await PlayerService.update(white_player.id, white_player)
            black_player = await PlayerService.update(black_player.id, black_player)
            await manager.connect_players(white_player, black_player)
        else:
            await SearchService.create(new_search_entry)
            await manager.websocket.receive_text()