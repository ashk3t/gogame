export interface Player {
  id: number | null
  token: string | null
  nickname: string
  role: PlayerRoles
}

export enum PlayerRoles {
  NEW = "NEW",
  SEARCH = "SEARCH",
  WHITE = "WHITE",
  BLACK = "BLACK",
  SPECTATOR = "SPECTATOR",
}

// export interface Game {
//   id: number
//   token: string
//   nickname: string
//   role: PlayerRoles
// }

export interface GameState {
  whitePlayer: Player,
  blackPlayer: Player,
  gameRep: string,
}