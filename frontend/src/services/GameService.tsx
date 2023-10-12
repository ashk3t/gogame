import {publicConfig} from "../api"
import {WS_API_URL} from "../consts/api"
import {GameSettings} from "../types/game"

export default class GameService {
  static baseUrl = "/games"
  static socket: WebSocket | null = null

  static async getAll() {
    const response = await publicConfig.get(this.baseUrl)
    return response.data
  }

  static startSearch(nickname: string, settings: GameSettings): WebSocket {
    const socket = new WebSocket(WS_API_URL + GameService.baseUrl + "/search")
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
    GameService.socket = socket
    return socket
  }

  static endGame() {
    GameService.socket?.close()
  }
}