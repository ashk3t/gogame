import {GameBoard, InvalidTurnError, StoneColor} from "../lib/gamelogic"
import {Player} from "./player"

export enum GameMode {
  CLASSIC = "CLASSIC",
  ATARI = "ATARI",
}

export interface GameSettings {
  custom: boolean
  height: number
  width: number
  players: number
  mode: GameMode
  new: boolean
  offline: boolean
}

interface BaseGame {
  settings: GameSettings
  rep: string | null
}

export interface GameState extends BaseGame {
  winner: StoneColor | null
  draftRep: string | null
  draftHistory: string[]
  error: string | null
}

export interface GameResponse extends BaseGame {
  id: number
  searchStartTime: string
  startTime: string | null
  players: Array<Player>
}

export const defaultGameSettings: GameSettings = {
  custom: false,
  height: 19,
  width: 19,
  players: 2,
  mode: GameMode.CLASSIC,
  new: false,
  offline: false,
}