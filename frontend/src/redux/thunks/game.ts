import {AppDispatch, RootState} from "../store"
import GameService from "../../services/GameService"
import {gameSlice} from "../reducers/game"
import {playerSlice} from "../reducers/player"
import {gameListSlice} from "../reducers/gameList"
import {GameBoard, InvalidTurnError} from "../../lib/gamelogic"
import {GameMode} from "../../types/game"
import {MessageType, SocketMessage, TurnType} from "../../types/gameApi"

export const fetchAllGames = () => async (dispatch: AppDispatch) => {
  const data = await GameService.getAll()
  dispatch(gameListSlice.actions.setGames(data))
}

export const startGame = () => async (dispatch: AppDispatch, getState: () => RootState) => {
  const state = getState()
  const settings = state.gameReducer.settings

  if (settings.offline) {
    const newGameRep = new GameBoard(settings.height, settings.width, settings.players).toRep()
    dispatch(gameSlice.actions.setGameRep(newGameRep))
  } else {
    const nickname = state.playerReducer.thisPlayer.nickname
    const connection = GameService.startSearch(nickname, settings)
    bindHandlers(dispatch, connection)
  }
}

export const takeTurn =
  (i: number, j: number, board: GameBoard) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    const game = getState().gameReducer
    const playerColor = getState().playerReducer.thisPlayer.color
    if (game.winner != null) return

    if (game.settings.offline) {
      try {
        board.takeTurn(i, j)
      } catch (error) {
        if (error instanceof InvalidTurnError)
          dispatch(gameSlice.actions.setTurnError(error.message))
        else throw error
        return
      }
      dispatch(gameSlice.actions.setTurnError(null))

      if (game.settings.mode == GameMode.ATARI && board.killer && !game.draftRep)
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
    bindHandlers(dispatch, connection)
  }
}

export const endGame = () => async (dispatch: AppDispatch, getState: () => RootState) => {
  const game = getState().gameReducer
  if (!game.settings.offline) {
    const playerColor = getState().playerReducer.thisPlayer.color
    if (game.rep) GameService.doTurn(TurnType.FINISH, {color: playerColor, leave: true})
    GameService.disconnect()
  }
  dispatch(playerSlice.actions.clearPlayerData())
  dispatch(gameSlice.actions.clearGameData())
}

function bindHandlers(dispatch: AppDispatch, connection: WebSocket) {
  connection.onmessage = (event) => {
    const data: SocketMessage = JSON.parse(event.data)

    switch (data.type) {
      case MessageType.SEARCH_CONNECT:
        dispatch(playerSlice.actions.setPlayers(data.players))
        GameService.notify()
        break
      case MessageType.DISCONNECT:
        dispatch(playerSlice.actions.popPlayer(data.player_id))
        break
      case MessageType.GAME_START:
        dispatch(playerSlice.actions.setThisPlayer(data.player))
        dispatch(gameSlice.actions.setGameRep(data.rep))
        break
      case MessageType.GOOD_TURN:
      case MessageType.GAME_RECONNECT:
        dispatch(gameSlice.actions.setTurnError(null))
        dispatch(gameSlice.actions.setGameRep(data.rep))
        if (data.winner) dispatch(gameSlice.actions.setGameWinner(data.winner))
        break
      case MessageType.BAD_TURN:
        dispatch(gameSlice.actions.setTurnError(data.error))
    }
  }
}

function updateGameData(dispatch: AppDispatch, board: GameBoard) {
  dispatch(gameSlice.actions.setTurnError(null))
  if (board.passCounter >= board.players - board.finishedPlayers.size)
    dispatch(gameSlice.actions.setGameWinner(board.scores.indexOf(Math.max(...board.scores))))
  dispatch(gameSlice.actions.setGameRep(board.toRep()))
}