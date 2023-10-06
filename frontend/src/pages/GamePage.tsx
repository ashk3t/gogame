import {useState} from "react"
import Board from "../components/Board"
import GameInfo from "../components/GameInfo"
import GameControl from "../components/GameControl"
import {useAppSelector} from "../hooks/redux"
import {GameBoard} from "../lib/gamelogic"
import useUpdater from "../hooks/useUpdater"

export default function GamePage() {
  const gameRep = useAppSelector((state) => state.gameReducer.rep)
  if (!gameRep) return

  const [gameUpdater, triggerGameUpdater] = useUpdater()
  const [board] = useState(GameBoard.fromRep(gameRep))
  const [draftBoard, setDraftBoard] = useState<GameBoard | null>(null)
  const [draftHistory, setDraftHistory] = useState<string[]>([])

  function startDraft() {
    if (board) setDraftBoard(GameBoard.fromRep(board.toRep()))
    if (draftHistory.length > 0) setDraftHistory([])
  }
  function stepBackDraft() {
    const prevRep = draftHistory.at(-1)
    if (!prevRep) return
    setDraftBoard(GameBoard.fromRep(prevRep))
    setDraftHistory(draftHistory.slice(0, -1))
  }
  function finishDraft() {
    setDraftBoard(null)
    setDraftHistory([])
  }
  function updateDraftHistory(board: GameBoard) {
    setDraftHistory([...draftHistory, board.toRep()])
  }

  const actualBoard = draftBoard || board
  const draftMode = draftBoard != null

  return (
    <main>
      <section>
        <GameInfo board={actualBoard} updater={gameUpdater} />
        <Board
          board={actualBoard}
          updater={gameUpdater}
          triggerUpdater={triggerGameUpdater}
          draftMode={draftMode}
          updateDraftHistory={updateDraftHistory}
        />
        <GameControl
          draftMode={draftMode}
          startDraft={startDraft}
          stepBackDraft={stepBackDraft}
          finishDraft={finishDraft}
        />
      </section>
    </main>
  )
}