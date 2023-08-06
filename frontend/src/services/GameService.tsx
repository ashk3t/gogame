import {publicConfig} from "../api"

export default class GameService {
  static baseUrl = "/games"

  static async getAll() {
    const response = await publicConfig.get(this.baseUrl)
    return response.data
  }
}