import {useState} from "react"
import Board from "../components/Board"
import GameInfo from "../components/GameInfo"
import GameControl from "../components/GameControl"
import styles from "../styles/pages/GamePage.module.css"
import {useAppSelector} from "../redux/hooks"
import {GameBoard} from "../lib/gamelogic"
import useUpdater from "../hooks/useUpdater"

export default function GamePage() {
  const gameRep = useAppSelector((state) => state.gameReducer.rep)
  if (!gameRep) return <></>

  const [gameUpdater, triggerGameUpdater] = useUpdater()
  const [mainBoard] = useState(GameBoard.fromRep(gameRep))
  const [draftBoard, setDraftBoard] = useState<GameBoard | null>(null)
  const [draftHistory, setDraftHistory] = useState<string[]>([])

  function updateDraftHistory(board: GameBoard) {
    setDraftHistory([...draftHistory, board.toRep()])
  }

  const board = draftBoard || mainBoard
  const draftMode = draftBoard != null

  return (
    <main className={styles.mainContainer}>
      <GameControl
        mainBoard={mainBoard}
        draftBoard={draftBoard}
        setDraftBoard={setDraftBoard}
        draftHistory={draftHistory}
        setDraftHistory={setDraftHistory}
      />
      <Board
        board={board}
        draftMode={draftMode}
        updateDraftHistory={updateDraftHistory}
      />
      <GameInfo board={board} />
    </main>
  )
}