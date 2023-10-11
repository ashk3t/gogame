export interface Player {
  // id: number | null
  // token: string | null
  nickname: string
  // status: PlayerStatus
}

export enum PlayerStatus {
  NEW = "NEW",
  SEARCH = "SEARCH",
  WHITE = "WHITE",
  BLACK = "BLACK",
  SPECTATOR = "SPECTATOR",
}
