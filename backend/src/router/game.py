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
        settings = GameSettingsCreate(**gamedata.model_dump())

        game = await GameService.find_relevant(settings)
        if not game:
            settings = await GameSettingsService.create(settings)
            game = await GameService.create(GameCreate(settings_id=settings.id))

        player = await PlayerService.create(
            PlayerCreate(nickname=gamedata.nickname, game_id=game.id)
        )
        manager.bind_connection(game.id, player.id)

        await manager.send_all("player_connect", nickname=player.nickname)
        while len(manager.connections[game.id]) < settings.players:
            await manager.wait_message()
        await manager.send_self("game_start", player=player.model_dump())


@router.websocket("/join")
async def join_game(websocket: WebSocket):
    pass


@router.websocket("/reconnect")
async def reconnect(websocket: WebSocket):
    pass