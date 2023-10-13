export interface Player {
  id: number | null
  token: string | null
  nickname: string
  status: PlayerStatus
}

export enum PlayerStatus {
  PLAYING = "PLAYING",
  SEARCH = "SEARCH",
  SPECTATOR = "SPECTATOR",
}