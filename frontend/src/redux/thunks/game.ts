import {AppDispatch, RootState} from "../store"
import GameService from "../../services/GameService"
import {gameSlice} from "../reducers/game"
import {playerSlice} from "../reducers/player"
import {gameListSlice} from "../reducers/gameList"
import {GameBoard, InvalidTurnError} from "../../lib/gamelogic"
import {GameMode} from "../../types/game"

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

    connection.onmessage = (event) => {
      const data = JSON.parse(event.data)

      switch (data.type) {
        case "player_connect":
          dispatch(playerSlice.actions.setPlayers(data.players))
          GameService.notify()
          break
        case "player_disconnect":
          dispatch(playerSlice.actions.popPlayer(data.player_id))
          break
        case "game_start":
          dispatch(playerSlice.actions.setThisPlayer(data.player))
          dispatch(gameSlice.actions.setGameRep(data.rep))
          break
        case "good_turn":
          dispatch(gameSlice.actions.setGameRep(data.rep))
          break
        case "bad_turn":
          dispatch(gameSlice.actions.setTurnError(data.error))
      }
    }

    connection.onclose = () => {
      dispatch(playerSlice.actions.setPlayers([]))
    }
  }
}

export const takeTurn =
  (i: number, j: number, board: GameBoard) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState()
    const game = state.gameReducer
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
    } else {
      if (board.turnColor != state.playerReducer.thisPlayer.color) return
      GameService.takeTurn(i, j)
    }
  }

export const endGame = () => async (dispatch: AppDispatch) => {
  GameService.endGame()
  dispatch(gameSlice.actions.clearGamedata())
}