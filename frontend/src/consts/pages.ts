import GameListPage from "../pages/GameListPage"
import GamePage from "../pages/GamePage"
import StartPage from "../pages/StartPage"

export const GAME_LIST_PATH = "/game_list"
export const START_PATH = "/start"
export const GAME_PATH = "/game"

export const routes = [
  {path: GAME_LIST_PATH, Component: GameListPage, title: "game_list/"},
  {path: START_PATH, Component: StartPage, title: "start/"},
  {path: GAME_PATH, Component: GamePage, title: "game/"},
]