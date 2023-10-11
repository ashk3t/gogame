import {AppDispatch, RootState} from "../store"
import GameService from "../services/GameService"
import {gameSlice} from "../reducers/game"
import {playerSlice} from "../reducers/player"
import {gameListSlice} from "../reducers/gameList"
import {GameBoard} from "../lib/gamelogic"

export const fetchAllGames = () => async (dispatch: AppDispatch) => {
  dispatch(gameListSlice.actions.setGames(await GameService.getAll()))
}

export const startGame = () => async (dispatch: AppDispatch, getState: () => RootState) => {
  const state = getState()
  const settings = state.gameReducer.settings

  if (settings.offline) {
    const newGameRep = new GameBoard(settings.height, settings.width, settings.players).toRep()
    dispatch(gameSlice.actions.setGameRep(newGameRep))
  } else {
    const nickname = state.playerReducer.currentPlayer.nickname
    // dispatch(playerSlice.actions.updateNickname(""))
    GameService.startSearch(nickname, settings)
  }
}