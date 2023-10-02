import {publicConfig} from "../api"
import {WS_API_URL} from "../consts/api"
import {GameSettings} from "../types/game"

export default class GameService {
  static baseUrl = "/games"

  static async getAll() {
    const response = await publicConfig.get(this.baseUrl)
    return response.data
  }

  static async startSearch(nickname: string, settings: GameSettings) {
    const socket = new WebSocket(WS_API_URL + "/games/search")
    socket.onopen = (_) => {
      socket.send(
        JSON.stringify({
          nickname: nickname,
          x_size: settings.xSize,
          y_size: settings.ySize,
          players: settings.players,
          mode: settings.mode,
        }),
      )
    }
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data)
      alert("Игра найдена, ваш цвет: " + data.status + "!")
      socket.close()
    }
  }
}