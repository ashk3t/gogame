import {Dispatch} from "react"
import PlayerService from "../services/PlayerService"
import {GenericAction} from "../types/generic"
import {AppDispatch, RootState} from "../store"
import GameService from "../services/GameService"
import {gameSlice} from "../reducers/game"
import {gameListSlice} from "../reducers/gameList"
import {GameMode} from "../types/game"

export const fetchAllGames = () => async (dispatch: AppDispatch) => {
  dispatch(gameListSlice.actions.setGames(await GameService.getAll()))
}

export const startNewGame = () => async (dispatch: AppDispatch, getState: () => RootState) => {
  const nickname = getState().gameReducer.player.nickname
  const settings = getState().gameReducer.gameSettings
  gameSlice.actions.updateNickname("")
  GameService.startSearch(nickname, settings)
}