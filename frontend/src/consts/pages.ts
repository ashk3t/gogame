import GamesPage from "../pages/GamesPage"
import StartPage from "../pages/StartPage"

export const GAMES_PATH = "/games"
export const START_PATH = "/start"

export const routes = [
  {path: START_PATH, Component: StartPage, title: "start/"},
  {path: GAMES_PATH, Component: GamesPage, title: "games/"},
]