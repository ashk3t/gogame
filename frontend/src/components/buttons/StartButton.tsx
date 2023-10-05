import styles from "../../styles/base.module.css"
import {AppDispatch} from "../../store"
import {startOnlineGame} from "../../action-creators/game"
import {useDispatch} from "react-redux"
import {useState} from "react"
import {useActions, useAppSelector} from "../../hooks/redux"
import {useNavigate} from "react-router-dom"

export default function StartButton() {
  const navigate = useNavigate()
  const {startOnlineGame, createBoard} = useActions()
  const isOffline = useAppSelector((state) => state.gameReducer.settings.offline)

  function startGame() {
    if (isOffline) {
      createBoard()
      navigate("/game")
    } else {
      startOnlineGame()
    }
  }

  return (
    <button className={styles.niceButton} onClick={startGame}>
      Go!
    </button>
  )
}