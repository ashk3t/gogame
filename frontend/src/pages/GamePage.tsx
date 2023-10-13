import Board from "../components/Board"
import GameInfo from "../components/GameInfo"
import GameControl from "../components/GameControl"
import styles from "../styles/pages/GamePage.module.css"
import {GameBoard} from "../lib/gamelogic"
import {useEffect, useState} from "react"
import {useAppSelector} from "../redux/hooks"

export default function GamePage() {
  const [board, setBoard] = useState<GameBoard | null>(null)
  const rep = useAppSelector((state) => state.gameReducer.rep)
  const draftRep = useAppSelector((state) => state.gameReducer.draftRep)

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