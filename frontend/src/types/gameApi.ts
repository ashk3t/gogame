export interface SocketMessage {
  type: MessageType
  [rest: string]: any
}

export enum MessageType {
  SEARCH_CONNECT = "SEARCH_CONNECT",
  DISCONNECT = "DISCONNECT",
  GAME_START = "GAME_START",
  GOOD_TURN = "GOOD_TURN",
  BAD_TURN = "BAD_TURN",
  GAME_RECONNECT = "GAME_RECONNECT",
}

export enum TurnType {
  BASIC = "BASIC",
  PASS = "PASS",
  FINISH = "FINISH",
}