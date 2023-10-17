import {publicConfig} from "../api"
import {WS_API_URL} from "../consts/api"
import {GameSettings} from "../types/game"
import {TurnType} from "../types/gameApi"

export default class GameService {
  static baseUrl = "/games"
  static connection: WebSocket | null = null

  static async getAll() {
    const response = await publicConfig.get(this.baseUrl)
    return response.data
  }

  static notify() {
    GameService.connection?.send("")
  }

  static startGame(nickname: string, settings: GameSettings): WebSocket {
    const socket = new WebSocket(
      WS_API_URL + GameService.baseUrl + (settings.new ? "/new" : "/search"),
    )
    socket.onopen = (_) => {
      socket.send(
        JSON.stringify(
          settings.custom
            ? {
                nickname: nickname,
                height: settings.height,
                width: settings.width,
                players: settings.players,
                mode: settings.mode,
              }
            : {nickname: nickname},
        ),
      )
    }
    GameService.connection = socket
    return socket
  }

  static join(nickname: string, gameId: number): WebSocket {
    const socket = new WebSocket(WS_API_URL + GameService.baseUrl + "/join")
    socket.onopen = (_) => {
      socket.send(JSON.stringify({nickname: nickname, game_id: gameId}))
    }
    GameService.connection = socket
    return socket
  }

  static doTurn(turnType: TurnType, turnData?: any) {
    GameService.connection?.send(JSON.stringify({type: turnType, ...turnData}))
  }

  static reconnect(token: string): WebSocket {
    if (GameService.connection) return GameService.connection
    const socket = new WebSocket(WS_API_URL + GameService.baseUrl + "/reconnect")
    socket.onopen = (_) => {
      socket.send(JSON.stringify({token}))
    }
    GameService.connection = socket
    return socket
  }

  static disconnect() {
    GameService.connection?.close()
    GameService.connection = null
  }
}