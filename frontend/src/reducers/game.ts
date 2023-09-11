import {PayloadAction, createSlice} from "@reduxjs/toolkit"
import {GameState, Player, PlayerRoles} from "../types/game"

const initialPlayer = {
  id: null,
  token: null,
  nickname: "",
  role: PlayerRoles.NEW
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