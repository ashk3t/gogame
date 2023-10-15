export interface SocketMessage {
  type: MessageType
  [rest: string]: any
}

export enum MessageType {
  CONNECT = "CONNECT",
  DISCONNECT = "DISCONNECT",
  RECONNECT = "RECONNECT",
  GAME_START = "GAME_START",
  GAME_CONTINUE = "GAME_CONTINUE",
  GOOD_TURN = "GOOD_TURN",
  BAD_TURN = "BAD_TURN",
}

export enum TurnType {
  BASIC = "BASIC",
  PASS = "PASS",
  FINISH = "FINISH",
  LEAVE = "LEAVE",
}