import {PayloadAction, createSlice} from "@reduxjs/toolkit"
import {GameMode, GameSettings, GameState, Player, PlayerStatus} from "../types/game"

const initialPlayer: Player = {
  id: null,
  token: null,
  nickname: "",
  status: PlayerStatus.NEW,
}

const initialGameSettings: GameSettings = {
  xSize: 19,
  ySize: 19,
  players: 2,
  mode: GameMode.CLASSIC,
  offline: false,
}

const initialState: GameState = {
  player: {...initialPlayer},
  opponents: [],
  gameRep: "",
  gameSettings: initialGameSettings,
}

export const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    updateNickname(state, action: PayloadAction<string>) {
      state.player.nickname = action.payload
    },
    updatePlayerStatus(state, action: PayloadAction<PlayerStatus>) {
      state.player.status = action.payload
    },
    updateGameSettings(state, action: PayloadAction<GameSettings>) {
      state.gameSettings = action.payload
    },
  },
})

export default gameSlice.reducer