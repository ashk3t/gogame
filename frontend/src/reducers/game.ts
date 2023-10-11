import {PayloadAction, createSlice} from "@reduxjs/toolkit"
import {GameMode, GameSettings, GameState} from "../types/game"
import {StoneColor} from "../lib/gamelogic"

const initialGameSettings: GameSettings = {
  height: 19,
  width: 19,
  players: 2,
  mode: GameMode.CLASSIC,
  offline: false,
  hidden: false,
}

const initialState: GameState = {
  settings: initialGameSettings,
  rep: null,
  error: null,
  winner: null,
}

export const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    updateGameSettings(state, action: PayloadAction<GameSettings>) {
      state.settings = action.payload
    },
    setGameRep(state, action: PayloadAction<string>) {
      state.rep = action.payload
    },
    setTurnError(state, action: PayloadAction<string | null>) {
      state.error = action.payload
    },
    setGameWinner(state, action: PayloadAction<StoneColor>) {
      state.winner = action.payload
    },
    endGame: () => initialState,
  },
})

export default gameSlice.reducer