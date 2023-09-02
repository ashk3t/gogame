import {publicConfig} from "../api"
import {Player} from "../types/player"

export default class PlayerService {
  static baseUrl = "/players"

  static async getAll() {
    const response = await publicConfig.get(this.baseUrl)
    return response.data
  }

  static async create(nickname: string): Promise<Player> {
    const response = await publicConfig.post(this.baseUrl, {nickname: nickname})
    return response.data
  }
}