import asyncio
from typing import Annotated, Any, Union
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import (
    APIRouter,
    WebSocket,
)

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
async def search_game(websocket: WebSocket):
    async with GameSearchManager(websocket) as manager:
        gamedata = await manager.get_gamedata()
        game_settings = await GameSettingsService.create(GameSettingsCreate(**gamedata.model_dump()))
        current_player = await PlayerService.create(PlayerCreate(nickname=gamedata.nickname))
        manager.identify_connection(current_player.id)

        new_search_entry = SearchEntryCreate(player_id=current_player.id, game_settings_id=game_settings.id)
        paired_search_entry = await SearchService.find_paired(game_settings)

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
        await manager.wait()