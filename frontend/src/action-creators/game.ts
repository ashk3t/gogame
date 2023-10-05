import {Dispatch} from "react"
import PlayerService from "../services/PlayerService"
import {GenericAction} from "../types/generic"
import {AppDispatch, RootState} from "../store"
import GameService from "../services/GameService"
import {gameSlice} from "../reducers/game"
import {gameListSlice} from "../reducers/gameList"
import {GameMode, PlayerStatus} from "../types/game"

export const fetchAllGames = () => async (dispatch: AppDispatch) => {
  dispatch(gameListSlice.actions.setGames(await GameService.getAll()))
}

export const startOnlineGame = () => async (dispatch: AppDispatch, getState: () => RootState) => {
  const nickname = getState().gameReducer.player.nickname
  const settings = getState().gameReducer.settings
  gameSlice.actions.updateNickname("")
  GameService.startSearch(nickname, settings)
}