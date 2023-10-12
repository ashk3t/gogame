import {PayloadAction, createSlice} from "@reduxjs/toolkit"
import {Player, PlayerStatus} from "../../types/player"

interface PlayersData {
  thisPlayer: Player
  players: Array<Player>
}

const initialState: PlayersData = {
  thisPlayer: {id: null, nickname: ""},
  players: [],
}

export const playerSlice = createSlice({
  name: "player",
  initialState,
  reducers: {
    setNickname(state, action: PayloadAction<string>) {
      state.thisPlayer.nickname = action.payload
    },
    setPlayers(state, action: PayloadAction<Array<Player>>) {
      state.players = action.payload
    },
    popPlayer(state, action: PayloadAction<number>) {
      state.players = state.players.filter((player) => player.id != action.payload)
    },
  },
})

export default playerSlice.reducer