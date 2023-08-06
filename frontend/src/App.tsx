import {BrowserRouter} from "react-router-dom"
import Header from "./components/Header"
import AppRouter from "./components/AppRouter"
// import "index.css"

export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <AppRouter />
    </BrowserRouter>
  )
}