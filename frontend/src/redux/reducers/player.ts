import {PayloadAction, createSlice} from "@reduxjs/toolkit"
import {ConnectedPlayer, Player} from "../../types/player"
import {StoneColor} from "../../lib/gamelogic"

interface PlayersData {
  thisPlayer: Player
  players: Array<ConnectedPlayer>
  spectators: Array<Player>
}

const initialPlayer: Player = {
  id: null,
  token: null,
  nickname: "",
  color: StoneColor.NONE,
}

const initialState: PlayersData = {
  thisPlayer: initialPlayer,
  players: [],
  spectators: [],
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
    setPlayers(state, action: PayloadAction<Array<ConnectedPlayer>>) {
      state.players = action.payload.sort((p, n) => p.color - n.color)
    },
    setSpectators(state, action: PayloadAction<Array<Player>>) {
      state.spectators = action.payload
    },
    removePlayer(state, action: PayloadAction<number>) {
      state.players = state.players.filter((player) => player.id != action.payload)
    },
    removeSpectator(state, action: PayloadAction<number>) {
      state.spectators = state.spectators.filter((spectator) => spectator.id != action.payload)
    },
    setPlayerDisconnected(state, action: PayloadAction<{playerId: number; value: boolean}>) {
      state.players = state.players.map((player) =>
        player.id == action.payload.playerId
          ? {...player, disconnected: action.payload.value}
          : player,
      )
    },
    clearPlayerData(state) {
      return {thisPlayer: {...initialPlayer, nickname: state.thisPlayer.nickname}, players: [], spectators: []}
    },
  },
})

export default playerSlice.reducer