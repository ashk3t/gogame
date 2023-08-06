import GamesPage from "./pages/GamesPage"
import StartPage from "./pages/StartPage"

export const GAMES_PATH = "/games"
export const START_PATH = "/start"

export const routes = [
  {path: START_PATH, Component: StartPage, title: "start/"},
  {path: GAMES_PATH, Component: GamesPage, title: "games/"},
]

export const API_URL = "http://127.0.0.1:8000"

export const colors = {
  base: {color: "#191724"},
  surface: {color: "#1f1d2e"},
  overlay: {color: "#26233a"},
  muted: {color: "#6e6a86"},
  subtle: {color: "#908caa"},
  text: {color: "#e0def4"},
  love: {color: "#eb6f92"},
  gold: {color: "#f6c177"},
  rose: {color: "#ebbcba"},
  pine: {color: "#31748f"},
  foam: {color: "#9ccfd8"},
  iris: {color: "#c4a7e7"},
  highlightLow: {color: "#21202e"},
  highlightLowAlpha: {color: "#6e6a861a"},
  highlightMed: {color: "#403d52"},
  highlightMedAlpha: {color: "#6e6a8633"},
  highlightHigh: {color: "#524f67"},
  highlightHighAlpha: {color: "#6e6a8666"},
}

export const nicknameLabels: string[] = [
  "Fighter",
  "Warrior",
  "Berserk",
  "Gigachad",
  "Knight",
  "Hero",
  "Sage",
  "Thinker",
  "Conqueror",
  "Champion",
  "Gladiator",
  "Annihilator",
  "Destroyer",
  "Intelligence",
  "Legend",
  "Strategist",
  "Dominator",
]
