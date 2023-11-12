from fastapi import APIRouter, Depends, WebSocket
from sqlalchemy.ext.asyncio import AsyncSession

from ..config import settings
from ..dependencies import get_session
from ..lib.gamelogic import GameBoard, InvalidTurnException
from ..schemas import *
from ..service import *
from ..service.utils import list_model_dump, turn_color


router = APIRouter(prefix="/games")


# Full > Extended > common response: by payload size and model nesting level
@router.get("/full", response_model=list[GameExtendedWithPlayers])
async def get_games_full(
    page: int,
    limit: int = settings.default_limit,
    nickname: str | None = None,
    searching: bool = False,
    height: int | None = None,
    width: int | None = None,
    players: int | None = None,
    mode: GameMode | None = None,
    ss: AsyncSession = Depends(get_session),
):
    return await GamePlayerService.get_games_full(
        ss,
        offset=(page - 1) * limit,
        limit=limit,
        nickname=nickname,
        searching=searching,
        settings=GameSettingsOptional(
            height=height, width=width, players=players, mode=mode
        ),
    )


@router.post("/full_by_ids", response_model=list[GameExtendedWithPlayers])
async def get_games_full_by_ids(
    ids: list[int], ss: AsyncSession = Depends(get_session)
):
    return await GamePlayerService.get_games_full_by_ids(ss, ids)


@router.get("/count", response_model=int)
async def game_count(
    nickname: str | None = None,
    searching: bool = False,
    height: int | None = None,
    width: int | None = None,
    players: int | None = None,
    mode: GameMode | None = None,
    ss: AsyncSession = Depends(get_session),
):
    return await GamePlayerService.count_games(
        ss,
        nickname=nickname,
        searching=searching,
        settings=GameSettingsOptional(
            height=height, width=width, players=players, mode=mode
        ),
    )


@router.websocket("/new")
@router.websocket("/search")
async def search_game(websocket: WebSocket, ss: AsyncSession = Depends(get_session)):
    async with GameConnectionManager(ss, websocket) as manager:
        gamedata = GameCreateRequest(**(await manager.get_data()))
        settings = GameSettingsCreate(**gamedata.model_dump())
        settings = (
            found_settings
            if (found_settings := await GameSettingsService.find_same(ss, settings))
            else await GameSettingsService.create(ss, settings)
        )

        game = None
        if "/search" in websocket.url.path:
            game = await GameService.find_relevant(ss, settings.id)
        if not game:
            game = await GameService.create(ss, GameCreate(settings_id=settings.id))

        player = await game_connect(manager, game, settings, gamedata.nickname)
        await game_loop(manager, game, player)


@router.websocket("/join")
async def join_game(websocket: WebSocket, ss: AsyncSession = Depends(get_session)):
    async with GameConnectionManager(ss, websocket) as manager:
        gamedata = GameJoinRequest(**(await manager.get_data()))
        game = await GameService.get_ext(ss, gamedata.game_id)

        player = await game_connect(manager, game, game.settings, gamedata.nickname)
        await game_loop(manager, game, player)


@router.websocket("/reconnect")
async def reconnect(websocket: WebSocket, ss: AsyncSession = Depends(get_session)):
    async with GameConnectionManager(ss, websocket) as manager:
        token = (await manager.get_data())["token"]
        player = await PlayerService.get_by_token(ss, token)
        await manager.bind_connection(player.game_id, player.id, player.spectator)
        rep = str(player.game.rep)
        board = GameBoard.from_rep(rep)
        winner = check_winner(board, player.game.settings.mode)
        if player.spectator:
            spectators = await PlayerService.get_by_game_id(
                ss, player.game_id, player.spectator
            )
            await manager.send_all(
                MessageType.RECONNECT, spectators=list_model_dump(spectators)
            )
        else:
            await manager.send_all(MessageType.RECONNECT, player_id=player.id)

        await manager.send_self(MessageType.GAME_CONTINUE, rep=rep, winner=winner)
        await game_loop(manager, player.game, player, winner=winner)


async def game_connect(
    manager: GameConnectionManager,
    game: GameResponse,
    settings: GameSettingsBase,
    nickname: str,
) -> PlayerResponse:
    ss = manager.ss
    game_players = await PlayerService.get_by_game_id(ss, game.id, spectator=False)
    spectator = game.start_time is not None
    player = await PlayerService.create(
        ss,
        PlayerCreate(
            nickname=nickname,
            game_id=game.id,
            color=StoneColor.NONE
            if spectator
            else StoneColor(
                min(set(range(settings.players)) - set(p.color for p in game_players))
            ),
        ),
    )

    await manager.bind_connection(game.id, player.id, spectator)
    if spectator:
        game_spectators = await PlayerService.get_by_game_id(
            ss, game.id, spectator=True
        )
        await manager.send_self(
            MessageType.CONNECT, players=list_model_dump(game_players)
        )
        await manager.send_all(
            MessageType.CONNECT, spectators=list_model_dump(game_spectators)
        )
        await manager.send_self(
            MessageType.GAME_CONTINUE,
            player=player.model_dump(),
            rep=game.rep,
            winner=check_winner(GameBoard.from_rep(game.rep), settings.mode)
            if game.rep
            else None,
        )
    else:
        game_players.append(PlayerResponse(**player.model_dump()))
        await manager.send_all(
            MessageType.CONNECT, players=list_model_dump(game_players), notify_back=True
        )
        if await manager.count_connections() == settings.players:  # last player connect
            game = await GameService.start(ss, game.id)
            await manager.wait()
        while await manager.count_connections() < settings.players:
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
        if winner or player.spectator:
            if turn.type == TurnType.LEAVE:
                manager.permanent_exit()
            continue

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
                manager.permanent_exit()


def check_winner(board: GameBoard, game_mode: GameMode) -> StoneColor | None:
    if board.pass_counter >= board.players - len(board.finished_players):
        return StoneColor(board.scores.index(max(board.scores)))
    elif game_mode == GameMode.ATARI and board.killer is not None:
        return board.killer