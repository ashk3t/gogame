import {PayloadAction, createSlice} from "@reduxjs/toolkit"
import {GameSettings, Game, defaultGameSettings} from "../../types/game"
import {StoneColor} from "../../lib/gamelogic"

const initialState: Game = {
  settings: defaultGameSettings,
  rep: null,
  error: null,
  winner: null,
  draftRep: null,
  draftHistory: [],
}

export const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    setGameSettings(state, action: PayloadAction<GameSettings>) {
      if (action.payload.custom) state.settings = action.payload
      else state.settings = defaultGameSettings
    },
    setGameRep(state, action: PayloadAction<string>) {
      if (state.draftRep) {
        state.draftHistory.push(state.draftRep)
        state.draftRep = action.payload
      } else {
        state.rep = action.payload
      }
    },
    setDraftMode(state, action: PayloadAction<boolean>) {
      if (action.payload) {
        state.draftRep = state.rep
      } else {
        state.draftRep = null
        state.draftHistory = []
      }
    },
    stepBackDraft(state) {
      state.draftRep = state.draftHistory.pop() || state.draftRep
    },
    setTurnError(state, action: PayloadAction<string | null>) {
      state.error = action.payload
    },
    setGameWinner(state, action: PayloadAction<StoneColor>) {
      state.winner = action.payload
    },
    clearGameData(state) {
      return {...initialState, settings: state.settings}
    },
  },
})

export default gameSlice.reducer