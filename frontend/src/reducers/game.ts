import {PayloadAction, createSlice} from "@reduxjs/toolkit"
import {GameState, Player, PlayerStatus} from "../types/game"

const initialPlayer: Player = {
  id: null,
  token: null,
  nickname: "",
  status: PlayerStatus.NEW
}

const initialState: GameState = {
  whitePlayer: {...initialPlayer},
  blackPlayer: {...initialPlayer},
  gameRep: "",
}

export const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    updateNickname(state, action: PayloadAction<string>) {
      state.whitePlayer.nickname = action.payload
    },
  },
})

export default gameSlice.reducer