import {BrowserRouter} from "react-router-dom"
import AppRouter from "./components/AppRouter"
import RouterStateManager from "./components/StateManager"
// import "index.css"

export default function App() {
  return (
    <BrowserRouter>
      <RouterStateManager />
      <AppRouter />
    </BrowserRouter>
  )
}