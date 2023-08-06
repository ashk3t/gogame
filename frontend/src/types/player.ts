export interface Player {
  id: number
  token: string
  nickname: string
  role: PlayerRoles
}

export enum PlayerRoles {
  WHITE = "WHITE",
  BLACK = "BLACK",
  SPECTATOR = "SPECTATOR",
  SEARCH = "SEARCH",
}