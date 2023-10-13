from fastapi import APIRouter, WebSocket

from src.service.utils import list_model_dump

from ..schemas import *
from ..service import *


router = APIRouter(prefix="/games")


@router.get("/{id}", response_model=GameResponse)
async def get_game(id: int):
    return await GameService.get(id)


@router.get("", response_model=list[GameExtendedResponse])
async def get_games():
    return await GameService.get_all_ext()


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

        game_players = await PlayerService.get_by_game_id(game.id)
        await manager.send_all("player_connect", players=list_model_dump(game_players))
        while len(manager.connections[game.id]) < settings.players:
            await manager.wait_message()

        game_rep = await GameService.start(game.id, settings)
        await manager.send_self(
            "game_start", player=player.model_dump(), game_rep=game_rep
        )
        # TODO gamecycle
        # extract draft rep to reducer state


@router.websocket("/join")
async def join_game(websocket: WebSocket):
    pass


@router.websocket("/reconnect")
async def reconnect(websocket: WebSocket):
    pass