import GameListPage from "../pages/GameListPage"
import GamePage from "../pages/GamePage"
import SearchPage from "../pages/SearchPage"
import StartPage from "../pages/StartPage"

const PATH_PREFIX = import.meta.env.MODE == "production" ? "/gogame" : ""
export const START_PATH = PATH_PREFIX + "/start"
export const SEARCH_PATH = PATH_PREFIX + "/search"
export const GAME_LIST_PATH = PATH_PREFIX + "/game_list"
export const GAME_PATH = PATH_PREFIX + "/game"

export const routes = [
  {path: START_PATH, Component: StartPage},
  {path: SEARCH_PATH, Component: SearchPage},
  {path: GAME_PATH, Component: GamePage},
  {path: GAME_LIST_PATH, Component: GameListPage},
]