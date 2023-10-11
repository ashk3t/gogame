import {PayloadAction, createSlice} from "@reduxjs/toolkit"
import {Player, PlayerStatus} from "../types/player"

const initialState: Player = {
  // id: null,
  // token: null,
  nickname: "",
  // status: PlayerStatus.NEW,
}

export const playerSlice = createSlice({
  name: "player",
  initialState,
  reducers: {
    updateNickname(state, action: PayloadAction<string>) {
      state.nickname = action.payload
    },
  },
})

export default playerSlice.reducer