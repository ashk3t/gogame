import {AppDispatch, RootState} from "../store"
import GameService from "../../services/GameService"
import {gameSlice} from "../reducers/game"
import {playerSlice} from "../reducers/player"
import {gameListSlice} from "../reducers/gameList"
import {GameBoard, InvalidTurnError} from "../../lib/gamelogic"
import {GameMode, GameSettingsRequest} from "../../types/game"
import {MessageType, SocketMessage, TurnType} from "../../types/gameApi"
import {camelize} from "../../utils"

export const firstLoadGames = (page: number, filters: any) => async (dispatch: AppDispatch) => {
  const data = await GameService.getAllFull({
    page,
    ...filters,
  })
  dispatch(gameListSlice.actions.setGames(data.map(camelize)))
}

export const updateLoadedGames = (ids: number[]) => async (dispatch: AppDispatch) => {
  const data = await GameService.getAllFullByIds({ids})
  dispatch(gameListSlice.actions.setGames(data.map(camelize)))
}

export const startGame = () => async (dispatch: AppDispatch, getState: () => RootState) => {
  const state = getState()
  const settings = state.gameReducer.settings

  if (settings.offline) {
    const newGameRep = new GameBoard(settings.height, settings.width, settings.players).toRep()
    dispatch(gameSlice.actions.setGameRep(newGameRep))
  } else {
    const nickname = state.playerReducer.thisPlayer.nickname
    const connection = GameService.startGame(nickname, settings)
    bindHandlers(dispatch, getState, connection)
  }
}

export const joinGame =
  (gameId: number) => async (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState()
    const nickname = state.playerReducer.thisPlayer.nickname
    const connection = GameService.join(nickname, gameId)
    bindHandlers(dispatch, getState, connection)
  }

export const takeTurn =
  (i: number, j: number, board: GameBoard) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    const game = getState().gameReducer
    const playerColor = getState().playerReducer.thisPlayer.color
    if (game.winner != null) return

    if (game.settings.offline || game.draftRep) {
      try {
        board.takeTurn(i, j)
      } catch (error) {
        if (error instanceof InvalidTurnError)
          dispatch(gameSlice.actions.setTurnError(error.message))
        else throw error
        return
      }

      if (game.settings.mode == GameMode.ATARI && board.killer != null && !game.draftRep)
        dispatch(gameSlice.actions.setGameWinner(board.killer))
      dispatch(gameSlice.actions.setGameRep(board.toRep()))
    } else if (board.turnColor == playerColor) GameService.doTurn(TurnType.BASIC, {i, j})
  }

export const passTurn =
  (board: GameBoard) => async (dispatch: AppDispatch, getState: () => RootState) => {
    const settings = getState().gameReducer.settings
    const playerColor = getState().playerReducer.thisPlayer.color
    if (settings.offline) {
      board.passTurn()
      updateGameData(dispatch, board)
    } else if (board.turnColor == playerColor) GameService.doTurn(TurnType.PASS)
  }

export const finishTurnsTurn =
  (board: GameBoard) => async (dispatch: AppDispatch, getState: () => RootState) => {
    const settings = getState().gameReducer.settings
    const playerColor = getState().playerReducer.thisPlayer.color
    if (settings.offline) {
      board.finishTurnsTurn()
      updateGameData(dispatch, board)
    } else GameService.doTurn(TurnType.FINISH, {color: playerColor})
  }

export const tryReconnect = () => async (dispatch: AppDispatch, getState: () => RootState) => {
  const state = getState()
  const settings = state.gameReducer.settings
  const token = state.playerReducer.thisPlayer.token
  if (!settings.offline && !GameService.connection && token) {
    const connection = GameService.reconnect(token)
    bindHandlers(dispatch, getState, connection)
  }
}

export const endGame = () => async (dispatch: AppDispatch, getState: () => RootState) => {
  const game = getState().gameReducer
  if (!game.settings.offline && game.rep) {
    const playerColor = getState().playerReducer.thisPlayer.color
    if (GameService.connection != null) GameService.connection.onmessage = null
    GameService.doTurn(TurnType.LEAVE, {color: playerColor})
  } else if (GameService.connection) {
    GameService.disconnect()
  } else {
    dispatch(playerSlice.actions.clearPlayerData())
    dispatch(gameSlice.actions.clearGameData())
  }
}

function bindHandlers(dispatch: AppDispatch, getState: () => RootState, connection: WebSocket) {
  connection.onmessage = (event) => {
    const data: SocketMessage = JSON.parse(event.data)

    switch (data.type) {
      case MessageType.CONNECT:
        if (data.players) dispatch(playerSlice.actions.setPlayers(data.players))
        if (data.spectators) dispatch(playerSlice.actions.setSpectators(data.spectators))
        if (data.notify_back) GameService.notify()
        break
      case MessageType.DISCONNECT:
        if (data.spectator_id) dispatch(playerSlice.actions.removeSpectator(data.spectator_id))
        else if (getState().gameReducer.rep) {
          dispatch(
            playerSlice.actions.setPlayerDisconnected({playerId: data.player_id, value: true}),
          )
        } else dispatch(playerSlice.actions.removePlayer(data.player_id))
        break
      case MessageType.RECONNECT:
        if (data.spectators) dispatch(playerSlice.actions.setSpectators(data.spectators))
        else
          dispatch(
            playerSlice.actions.setPlayerDisconnected({playerId: data.player_id, value: false}),
          )
        break
      case MessageType.GAME_START:
      case MessageType.GAME_CONTINUE:
      case MessageType.GOOD_TURN:
        if (data.player) dispatch(playerSlice.actions.setThisPlayer(data.player))
        dispatch(gameSlice.actions.setMainGameRep(data.rep))
        if (data.winner != null) dispatch(gameSlice.actions.setGameWinner(data.winner))
        break
      case MessageType.BAD_TURN:
        dispatch(gameSlice.actions.setTurnError(data.error))
    }
  }

  connection.onclose = () => {
    dispatch(playerSlice.actions.clearPlayerData())
    dispatch(gameSlice.actions.clearGameData())
    GameService.connection = null
  }
}

function updateGameData(dispatch: AppDispatch, board: GameBoard) {
  if (board.passCounter >= board.players - board.finishedPlayers.size)
    dispatch(gameSlice.actions.setGameWinner(board.scores.indexOf(Math.max(...board.scores))))
  dispatch(gameSlice.actions.setGameRep(board.toRep()))
}