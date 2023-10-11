import GameListPage from "../pages/GameListPage"
import GamePage from "../pages/GamePage"
import SearchPage from "../pages/SearchPage"
import StartPage from "../pages/StartPage"

export const START_PATH = "/start"
export const SEARCH_PATH = "/search"
export const GAME_LIST_PATH = "/game_list"
export const GAME_PATH = "/game"

export const defaultRoutes = [
  {path: START_PATH, Component: StartPage},
  {path: SEARCH_PATH, Component: SearchPage},
  {path: GAME_LIST_PATH, Component: GameListPage},
]

export const inGameRoutes = [
  {path: GAME_PATH, Component: GamePage},
]