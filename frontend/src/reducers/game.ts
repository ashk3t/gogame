import {PayloadAction, createSlice} from "@reduxjs/toolkit"
import {GameMode, GameSettings, GameState, Player, PlayerStatus} from "../types/game"
import {GameBoard, InvalidTurnError, StoneColor} from "../lib/gamelogic"

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
  rep: null,
  error: null,
  winner: null,
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
    setGameRep(state, action: PayloadAction<string>) {
      state.rep = action.payload
    },
    setTurnError(state, action: PayloadAction<string | null>) {
      state.error = action.payload
    },
    setGameWinner(state, action: PayloadAction<StoneColor>) {
      state.winner = action.payload
    },
    endGame: () => initialState
  },
})

export default gameSlice.reducer