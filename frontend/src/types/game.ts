import {InvalidTurnError} from "../lib/gamelogic";

export interface Player {
  id: number | null
  token: string | null
  nickname: string
  status: PlayerStatus
}

export enum PlayerStatus {
  NEW = "NEW",
  SEARCH = "SEARCH",
  WHITE = "WHITE",
  BLACK = "BLACK",
  SPECTATOR = "SPECTATOR",
}

export enum GameMode {
  CLASSIC = "CLASSIC",
  ATARI = "ATARI",
}

export interface GameSettings {
  height: number;
  width: number;
  players: number;
  mode: GameMode;
  offline: boolean;
}

export interface GameState {
  player: Player,
  opponents: Player[],
  settings: GameSettings
  rep: string | null,
  error: string | null
  winner: string | null
}