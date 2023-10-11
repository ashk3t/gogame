import {InvalidTurnError, StoneColor} from "../lib/gamelogic";

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
  settings: GameSettings
  rep: string | null,
  error: string | null
  winner: StoneColor | null
}