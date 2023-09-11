import {publicConfig} from "../api"
import {WS_API_URL} from "../consts/api"

export default class GameService {
  static baseUrl = "/games"

  static async getAll() {
    const response = await publicConfig.get(this.baseUrl)
    return response.data
  }

  static async startSearch(nickname: string) {
    // const socket = new WebSocket(WS_API_URL + "/games/search")
    const socket = new WebSocket(WS_API_URL + "/games/search?nickname=" + nickname)
    socket.onopen = (_) => {} // socket.send(nickname)
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data)
      alert("Игра найдена, ваш цвет: " + data.color + "!")
      socket.close()
    }
  }
}