from fastapi import APIRouter, Depends, Request, WebSocket
from sqlalchemy.ext.asyncio import AsyncSession

from ..dependencies import get_session
from ..lib.gamelogic import GameBoard, InvalidTurnException
from ..schemas import *
from ..service import *
from ..service.utils import list_model_dump, turn_color


router = APIRouter(prefix="/games")


@router.get("", response_model=list[GameExtendedResponse])
async def get_games(ss: AsyncSession = Depends(get_session)):
    return await GameService.get_all_ext(ss)


@router.websocket("/search")
async def search_game(websocket: WebSocket, ss: AsyncSession = Depends(get_session)):
    async with GameConnectionManager(ss, websocket) as manager:
        gamedata = GameCreateRequest(**(await manager.get_data()))
        settings = GameSettingsCreate(**gamedata.model_dump())

        game = await GameService.find_relevant(ss, settings)
        if not game:
            settings = await GameSettingsService.create(ss, settings)
            game = await GameService.create(ss, GameCreate(settings_id=settings.id))

        player = await game_connect(manager, game, settings, gamedata.nickname)
        await game_loop(manager, game, player)


@router.websocket("/join")
@router.websocket("/spectate")
async def join_game(websocket: WebSocket, ss: AsyncSession = Depends(get_session)):
    async with GameConnectionManager(ss, websocket) as manager:
        gamedata = GameJoinRequest(**(await manager.get_data()))
        game = await GameService.get_ext(ss, gamedata.game_id)

        player = await game_connect(
            manager,
            game,
            game.settings,
            gamedata.nickname,
            "spectate" in websocket.url.path,
        )
        await game_loop(manager, game, player)


@router.websocket("/reconnect")
async def reconnect(websocket: WebSocket, ss: AsyncSession = Depends(get_session)):
    async with GameConnectionManager(ss, websocket) as manager:
        token = (await manager.get_data())["token"]
        player = await PlayerService.get_by_token(ss, token)
        manager.bind_connection(player.game_id, player.id, player.spectator)
        rep = str(player.game.rep)
        board = GameBoard.from_rep(rep)
        winner = check_winner(board, player.game.settings.mode)
        if player.spectator:
            spectators = await PlayerService.get_by_game_id(
                ss, player.game_id, player.spectator
            )
            await manager.send_all(MessageType.RECONNECT, spectators=list_model_dump(spectators))
        else:
            await manager.send_all(MessageType.RECONNECT, player_id=player.id)

        await manager.send_self(MessageType.GAME_CONTINUE, rep=rep, winner=winner)
        await game_loop(manager, player.game, player, winner=winner)


async def game_connect(
    manager: GameConnectionManager,
    game: GameResponse,
    settings: GameSettingsBase,
    nickname: str,
    spectator: bool = False,
) -> PlayerResponse:
    ss = manager.ss
    game_players = await PlayerService.get_by_game_id(ss, game.id)
    player = await PlayerService.create(
        ss,
        PlayerCreate(
            nickname=nickname,
            game_id=game.id,
            color=StoneColor.NONE if spectator else StoneColor(len(game_players)),
            spectator=spectator,
        ),
    )

    manager.bind_connection(game.id, player.id, spectator)
    if spectator:
        game_spectators = await PlayerService.get_by_game_id(ss, game.id, True)
        await manager.send_self(
            MessageType.CONNECT, players=list_model_dump(game_players)
        )
        await manager.send_all(
            MessageType.CONNECT, spectators=list_model_dump(game_spectators)
        )
    else:
        game_players.append(PlayerResponse(**player.model_dump()))
        await manager.send_all(
            MessageType.CONNECT, players=list_model_dump(game_players), notify_back=True
        )
        if len(manager.connections[game.id]) == settings.players:  # last player connect
            game = await GameService.start(ss, game.id)
            await manager.wait()
        while len(manager.connections[game.id]) < settings.players:
            await manager.wait()

    init_rep = GameBoard(settings.height, settings.width, settings.players).to_rep()
    await manager.send_self(
        MessageType.GAME_START, player=player.model_dump(), rep=init_rep
    )
    return player


async def game_loop(
    manager: GameConnectionManager,
    game: GameResponse,
    player: PlayerResponse,
    winner: StoneColor | None = None,
):
    manager.in_game = True
    ss = manager.ss
    settings = await GameSettingsService.get(ss, game.settings_id)
    while True:
        turn = TurnRequest(**(await manager.get_data()))
        if turn.type == TurnType.LEAVE and (winner or player.spectator):
            manager.in_game = False
            return

        game = await GameService.get(ss, game.id)
        if game.rep is None or (
            turn.type in [TurnType.BASIC, TurnType.PASS]
            and turn_color(game.rep) != player.color
        ):
            continue

        board = GameBoard.from_rep(game.rep)
        try:
            match turn.type:
                case TurnType.BASIC:
                    board.take_turn(turn.i, turn.j)
                case TurnType.PASS:
                    board.pass_turn()
                case TurnType.FINISH | TurnType.LEAVE:
                    board.finish_turns_turn(turn.color)
        except InvalidTurnException as error:
            await manager.send_self(MessageType.BAD_TURN, error=str(error))
        else:
            rep = board.to_rep()
            winner = check_winner(board, settings.mode)
            await manager.send_all(MessageType.GOOD_TURN, rep=rep, winner=winner)
            await GameService.update(ss, game.id, GameUpdate(rep=rep))
            if turn.type == TurnType.LEAVE:
                manager.in_game = False
                return


def check_winner(board: GameBoard, game_mode: GameMode) -> StoneColor | None:
    if board.pass_counter >= board.players - len(board.finished_players):
        return StoneColor(board.scores.index(max(board.scores)))
    elif game_mode == GameMode.ATARI and board.killer is not None:
        return board.killer