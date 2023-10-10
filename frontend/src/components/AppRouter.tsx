import {Routes, Route, Navigate} from "react-router-dom"
import {GAME_PATH, defaultRoutes, inGameRoutes, START_PATH} from "../consts/pages"
import {useAppSelector} from "../hooks/redux"
import {useEffect, useState} from "react"

export default function AppRouter() {
  const gameRep = useAppSelector((state) => state.gameReducer.rep)
  const [routes, setRoutes] = useState(defaultRoutes)
  const [defaultPath, setDefaultPath] = useState(START_PATH)

  useEffect(() => {
    setRoutes(gameRep ? inGameRoutes : defaultRoutes)
    setDefaultPath(gameRep ? GAME_PATH : START_PATH)
  }, [gameRep])

  return (
    <Routes>
      {routes.map(({path, Component}) => (
        <Route key={path} path={path} element={<Component />} />
      ))}
      <Route path="*" element={<Navigate to={defaultPath} />} />
    </Routes>
  )
}