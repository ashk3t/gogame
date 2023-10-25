import {useEffect} from "react"
import {useLocation} from "react-router-dom"
import {GAME_LIST_PATH, START_PATH} from "../consts/pages"
import {useActions, useAppSelector} from "../redux/hooks"
import GameService from "../services/GameService"

export default function RouterStateManager() {
  const location = useLocation()
  const {endGame} = useActions()
  const rep = useAppSelector((state) => state.gameReducer.rep)

  useEffect(() => {
    if ([START_PATH, GAME_LIST_PATH].includes(location.pathname)) {
      endGame()
      if (!rep) GameService.disconnect()
    }
  }, [location])

  return <></>
}