import {PayloadAction, createSlice} from "@reduxjs/toolkit"
import {Game} from "../../types/game"

interface GameListData {
  games: Array<Game>
}

const initialState: GameListData = {
  games: [],
}

export const gameListSlice = createSlice({
  name: "gameList",
  initialState,
  reducers: {
    setGames(state, action: PayloadAction<Array<Game>>) {
      state.games = action.payload
    },
  },
})

export default gameListSlice.reducer