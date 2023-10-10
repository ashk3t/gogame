import {BrowserRouter} from "react-router-dom"
import AppRouter from "./components/AppRouter"
// import "index.css"

export default function App() {
  return (
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  )
}