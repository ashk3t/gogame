import {Dispatch} from "react"
import PlayerService from "../services/PlayerService"
import {GenericAction} from "../types/generic"
import {AppDispatch} from "../store"
import GameService from "../services/GameService"
import {gameSlice} from "../reducers/game"

export const fetchAllGames = () => async (dispatch: AppDispatch) => {
  dispatch(gameSlice.actions.setGames(await GameService.getAll()))
}

export const startNewGame = (nickname: string) => async (dispatch: AppDispatch) => {
  const newPlayer = await PlayerService.create(nickname)
}