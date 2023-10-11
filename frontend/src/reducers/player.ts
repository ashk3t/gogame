import {PayloadAction, createSlice} from "@reduxjs/toolkit"
import {Player, PlayerStatus} from "../types/player"

interface PlayersData {
  currentPlayer: Player
  players: Array<Player>
}

const initialState: PlayersData = {
  currentPlayer: {nickname: ""},
  players: [],
}

export const playerSlice = createSlice({
  name: "player",
  initialState,
  reducers: {
    updateNickname(state, action: PayloadAction<string>) {
      state.currentPlayer.nickname = action.payload
    },
    updatePlayerList(state, action: PayloadAction<Array<Player>>) {
      state.players = action.payload
    }
  },
})

export default playerSlice.reducer