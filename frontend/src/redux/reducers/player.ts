import {PayloadAction, createSlice} from "@reduxjs/toolkit"
import {Player} from "../../types/player"
import {StoneColor} from "../../lib/gamelogic"

interface PlayersData {
  thisPlayer: Player
  players: Array<Player>
}

const initialState: PlayersData = {
  thisPlayer: {id: null, token: null, nickname: "", color: StoneColor.NONE},
  players: [],
}

export const playerSlice = createSlice({
  name: "player",
  initialState,
  reducers: {
    setNickname(state, action: PayloadAction<string>) {
      state.thisPlayer.nickname = action.payload
    },
    setThisPlayer(state, action: PayloadAction<Player>) {
      state.thisPlayer = action.payload
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