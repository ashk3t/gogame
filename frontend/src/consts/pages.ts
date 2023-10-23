import GameListPage from "../pages/GameListPage"
import GamePage from "../pages/GamePage"
import SearchPage from "../pages/SearchPage"
import StartPage from "../pages/StartPage"

const PATH_PREFIX = import.meta.env.MODE == "production" ? "/gogame" : ""
export const START_PATH = PATH_PREFIX + "/start"
export const SEARCH_PATH = PATH_PREFIX + "/search"
export const GAME_LIST_PATH = PATH_PREFIX + "/game_list"
export const GAME_PATH = PATH_PREFIX + "/game"

export const defaultRoutes = [
  {path: START_PATH, Component: StartPage},
  {path: GAME_LIST_PATH, Component: GameListPage},
]

export const inSearchRoutes = [
  {path: SEARCH_PATH, Component: SearchPage},
]

export const inGameRoutes = [
  {path: GAME_PATH, Component: GamePage},
]