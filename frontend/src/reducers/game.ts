import {PayloadAction, createSlice} from "@reduxjs/toolkit"

const initialState = {
  games: []
}

export const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    setGames(state, action: PayloadAction<[]>) {
      state.games = action.payload
    },
  },
})

export default gameSlice.reducer