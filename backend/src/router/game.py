from fastapi import APIRouter, WebSocket

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
        game_settings = await GameSettingsService.create(
            GameSettingsCreate(**gamedata.model_dump())
        )

        relevant_game = await GameService.find_relevant(game_settings)
        game = (
            relevant_game
            if relevant_game is not None
            else await GameService.create(GameCreate(game_settings_id=game_settings.id))
        )

        new_player = await PlayerService.create(
            PlayerCreate(nickname=gamedata.nickname, game_id=game.id)
        )
        manager.bind(game.id, new_player.id)

        if len(manager.connections[game.id]) == game.settings.players:
            pass
            # TODO: notify all players about game start

        await manager.wait()


@router.websocket("/join")
async def join_game(websocket: WebSocket):
    pass