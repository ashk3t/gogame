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

  static startSearch(nickname: string, settings: GameSettings) {
    const socket = new WebSocket(WS_API_URL + "/games/search")
    GameService.socket = socket
    socket.onopen = (_) => {
      socket.send(
        JSON.stringify({
          nickname: nickname,
          height: settings.height,
          width: settings.width,
          players: settings.players,
          mode: settings.mode,
        }),
      )
    }
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data)

      // switch (data.type) {
      //   case:
      // }
    }
  }

  static stopSearch() {
    if (GameService.socket != null) GameService.socket.close()
  }
}