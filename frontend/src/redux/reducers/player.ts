import {PayloadAction, createSlice} from "@reduxjs/toolkit"
import {Player} from "../../types/player"
import {StoneColor} from "../../lib/gamelogic"

interface PlayersData {
  thisPlayer: Player
  players: Array<Player>
}

const initialPlayer: Player = {
  id: null,
  token: null,
  nickname: "",
  color: StoneColor.NONE,
  disconnected: false,
}

const initialState: PlayersData = {
  thisPlayer: initialPlayer,
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
      state.players = action.payload.sort((p, n) => p.color - n.color)
    },
    popPlayer(state, action: PayloadAction<number>) {
      state.players = state.players.filter((player) => player.id != action.payload)
    },
    setPlayerDisconnected(state, action: PayloadAction<{playerId: number; value: boolean}>) {
      state.players = state.players.map((player) =>
        player.id == action.payload.playerId
          ? {...player, disconnected: action.payload.value}
          : player,
      )
    },
    clearPlayerData(state) {
      return {thisPlayer: {...initialPlayer, nickname: state.thisPlayer.nickname}, players: []}
    },
  },
})

export default playerSlice.reducer