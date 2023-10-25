import Board from "../components/Board"
import GameInfo from "../components/GameInfo"
import GameControl from "../components/GameControl"
import styles from "../styles/pages/GamePage.module.css"
import {GameBoard} from "../lib/gamelogic"
import {useEffect, useState} from "react"
import {useActions, useAppSelector} from "../redux/hooks"
import {useNavigate} from "react-router-dom"
import useGoBack from "../hooks/useGoBack"

export default function GamePage() {
  const goBack = useGoBack()
  const {tryReconnect, endGame} = useActions()
  const [board, setBoard] = useState<GameBoard | null>(null)
  const rep = useAppSelector((state) => state.gameReducer.rep)
  const draftRep = useAppSelector((state) => state.gameReducer.draftRep)

  useEffect(() => {
    if (!rep) goBack()
    tryReconnect()
  }, [])

  useEffect(() => {
    if (rep) setBoard(GameBoard.fromRep(draftRep || rep))
  }, [rep, draftRep])

  if (!board) return <></>
  return (
    <main className={styles.mainContainer}>
      <GameControl board={board} />
      <Board board={board} />
      <GameInfo board={board} />
    </main>
  )
}