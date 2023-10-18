import {PayloadAction, createSlice} from "@reduxjs/toolkit"
import {GameResponse} from "../../types/game"

interface GameListData {
  games: Array<GameResponse>
}

const initialState: GameListData = {
  games: [],
}

export const gameListSlice = createSlice({
  name: "gameList",
  initialState,
  reducers: {
    setGames(state, action: PayloadAction<Array<GameResponse>>) {
      state.games = action.payload
    },
  },
})

export default gameListSlice.reducer