import {PayloadAction, createSlice} from "@reduxjs/toolkit"
import {GameMode, GameSettings, GameState, Player, PlayerStatus} from "../types/game"
import {GameBoard} from "../lib/gamelogic"

const initialPlayer: Player = {
  id: null,
  token: null,
  nickname: "",
  status: PlayerStatus.NEW,
}

const initialGameSettings: GameSettings = {
  height: 19,
  width: 19,
  players: 2,
  mode: GameMode.CLASSIC,
  offline: false,
}

const initialState: GameState = {
  player: {...initialPlayer},
  opponents: [],
  settings: initialGameSettings,
  rep: "",
}

export const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    updateNickname(state, action: PayloadAction<string>) {
      state.player.nickname = action.payload
    },
    updateGameSettings(state, action: PayloadAction<GameSettings>) {
      state.settings = action.payload
    },
    setRep(state, action: PayloadAction<string>) {
      state.rep = action.payload
    },
  },
})

export default gameSlice.reducer