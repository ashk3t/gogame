import {Dispatch} from "redux"
import {GenericAction} from "../types/generic"
import PlayerService from "../services/PlayerService"

const initialState = {}

export default function requestReducer(state = initialState, action: GenericAction) {
  const {} = action.payload || {}
  switch (action.type) {
    default:
      return state
  }
}

export const searchGame = (nickname: string) => async (dispatch: Dispatch<GenericAction>) => {
  const newPlayer = await PlayerService.create(nickname)
  // dispatch({})
}