import {PayloadAction, createSlice} from "@reduxjs/toolkit"
import {GameMode, GameSettings, Game, defaultGameSettings} from "../../types/game"
import {StoneColor} from "../../lib/gamelogic"
import GameService from "../../services/GameService"

const initialState: Game = {
  settings: defaultGameSettings,
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
    clearGamedata(state) {
      return {...initialState, settings: state.settings}
    }
  },
})

export default gameSlice.reducer