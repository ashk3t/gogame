import {PayloadAction, createSlice} from "@reduxjs/toolkit"

const initialState = {
  games: [],
}

export const gameListSlice = createSlice({
  name: "gameList",
  initialState,
  reducers: {
    setGames(state, action: PayloadAction<[]>) {
      state.games = action.payload
    },
  },
})

export default gameListSlice.reducer