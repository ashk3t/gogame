import {StoneColor} from "../lib/gamelogic"

export interface Player {
  id: number | null
  token: string | null
  nickname: string
  color: StoneColor
}

export interface ConnectedPlayer extends Player {
  disconnected: boolean
}