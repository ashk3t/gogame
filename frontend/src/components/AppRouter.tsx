import {Routes, Route, Navigate} from "react-router-dom"
import {routes, GAME_LIST_PATH} from "../consts/pages"

export default function AppRouter() {
  return (
    <Routes>
      {routes.map(({path, Component}) => (
        <Route key={path} path={path} element={<Component />} />
      ))}
      <Route path="*" element={<Navigate to={GAME_LIST_PATH} />} />
    </Routes>
  )
}