from fastapi import APIRouter, WebSocket
from src.lib.gamelogic import GameBoard, InvalidTurnException

from src.service.utils import list_model_dump, turn_color

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

        game_players = await PlayerService.get_by_game_id(game.id)
        player = await PlayerService.create(
            PlayerCreate(
                nickname=gamedata.nickname,
                game_id=game.id,
                color=StoneColor(len(game_players)),
            )
        )
        game_players.append(PlayerResponse(**player.model_dump()))
        manager.bind_connection(game.id, player.id)

        await manager.send_all("player_connect", players=list_model_dump(game_players))
        if len(manager.connections[game.id]) == settings.players:  # last player connect
            game = await GameService.start(game.id)
            await manager.wait()
        while len(manager.connections[game.id]) < settings.players:
            await manager.wait()

        init_rep = GameBoard(settings.height, settings.width, settings.players).to_rep()
        await manager.send_self("game_start", player=player.model_dump(), rep=init_rep)
        while True:
            i, j = await manager.wait_turn()

            game = await GameService.get(game.id)
            if game.rep is None or turn_color(game.rep) != player.color:
                continue

            board = GameBoard.from_rep(game.rep)
            try:
                board.take_turn(i, j)
            except InvalidTurnException as error:
                await manager.send_all("bad_turn", error=str(error))
            else:
                rep = board.to_rep()
                await manager.send_all("good_turn", rep=rep)
                await GameService.update(game.id, GameUpdate(rep=rep))


@router.websocket("/join")
async def join_game(websocket: WebSocket):
    pass


@router.websocket("/reconnect")
async def reconnect(websocket: WebSocket):
    pass