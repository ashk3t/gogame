import {Routes, Route, Navigate} from "react-router-dom"
import {
  GAME_PATH,
  defaultRoutes,
  inGameRoutes,
  inSearchRoutes,
  SEARCH_PATH,
  START_PATH,
} from "../consts/pages"
import {useAppSelector} from "../redux/hooks"
import {useMemo} from "react"

export default function AppRouter() {
  const gameRep = useAppSelector((state) => state.gameReducer.rep)
  const connectedPlayers = useAppSelector((state) => state.playerReducer.players)
  const outGamePath = useAppSelector((state) => state.navigationReducer.outGameLastPath)

  const [routes, defaultPath] = useMemo(() => {
    return [
      gameRep ? inGameRoutes : connectedPlayers.length > 0 ? inSearchRoutes : defaultRoutes,
      gameRep ? GAME_PATH : connectedPlayers.length > 0 ? SEARCH_PATH : outGamePath || START_PATH,
    ]
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