import {StoneColor} from "../lib/gamelogic"

export interface Player {
  id: number | null
  token: string | null
  nickname: string
  color: StoneColor
  disconnected: boolean
}