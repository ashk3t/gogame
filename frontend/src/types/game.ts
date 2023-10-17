import {GameBoard, InvalidTurnError, StoneColor} from "../lib/gamelogic"

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

export interface Game {
  id: number | null
  settings: GameSettings
  rep: string | null
  error: string | null
  winner: StoneColor | null
  draftRep: string | null
  draftHistory: string[]
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