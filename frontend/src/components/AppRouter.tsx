import {Routes, Route, Navigate} from "react-router-dom"
import {
  GAME_PATH,
  defaultRoutes,
  inGameRoutes,
  START_PATH,
  inSearchRoutes,
  SEARCH_PATH,
} from "../consts/pages"
import {useAppSelector} from "../redux/hooks"
import {useEffect, useState} from "react"

export default function AppRouter() {
  const gameRep = useAppSelector((state) => state.gameReducer.rep)
  const connectedPlayers = useAppSelector((state) => state.playerReducer.players)
  const [routes, setRoutes] = useState(defaultRoutes)
  const [defaultPath, setDefaultPath] = useState(START_PATH)

  useEffect(() => {
    setRoutes(gameRep ? inGameRoutes : connectedPlayers.length > 0 ? inSearchRoutes : defaultRoutes)
    setDefaultPath(gameRep ? GAME_PATH : connectedPlayers.length > 0 ? SEARCH_PATH : START_PATH)
  }, [gameRep, connectedPlayers])

  return (
    <Routes>
      {routes.map(({path, Component}) => (
        <Route key={path} path={path} element={<Component />} />
      ))}
      <Route path="*" element={<Navigate to={defaultPath} />} />
    </Routes>
  )
}