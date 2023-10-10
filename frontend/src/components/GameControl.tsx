import {GAME_LIST_PATH, START_PATH} from "../consts/pages"
import {useActions, useAppSelector} from "../hooks/redux"
import {GameBoard, StoneColor} from "../lib/gamelogic"
import styles from "../styles/base.module.css"
import NavButton from "./buttons/NavButton"

export default function GameControl(props: {
  mainBoard: GameBoard
  draftBoard: GameBoard | null
  setDraftBoard: (value: GameBoard | null) => void
  draftHistory: string[]
  setDraftHistory: (value: string[]) => void
  triggerUpdater: () => void
}) {
  const {mainBoard, draftBoard, setDraftBoard, draftHistory, setDraftHistory, triggerUpdater} =
    props
  const {setGameRep, endGame, setGameWinner} = useActions()

  const isOffline = useAppSelector((state) => state.gameReducer.settings.offline)
  const winnerColor = useAppSelector((state) => state.gameReducer.winner)

  function startDraft() {
    if (mainBoard) setDraftBoard(GameBoard.fromRep(mainBoard.toRep()))
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
  function passTurn() {
    mainBoard.passTurn()
    updateGameData(mainBoard)
  }
  function surrenderTurn() {
    mainBoard.surrenderTurn()
    updateGameData(mainBoard)
  }
  function updateGameData(board: GameBoard) {
    if (board.passCounter >= board.players - board.surrenderedPlayers.size)
      setGameWinner(board.scores.indexOf(Math.max(...board.scores)))
    setGameRep(board.toRep())
    triggerUpdater()
  }

  return (
    <div>
      {winnerColor == null && draftBoard && (
        <>
          <button className={styles.niceButton} onClick={stepBackDraft}>
            Undo
          </button>
          <button className={styles.niceButton} onClick={startDraft}>
            Reset
          </button>
          <button className={styles.niceButton} onClick={finishDraft}>
            Finish draft
          </button>
        </>
      )}
      {winnerColor == null && !draftBoard && (
        <>
          <button className={styles.niceButton} onClick={startDraft}>
            Draft mode
          </button>
          <button className={styles.niceButton} onClick={passTurn}>
            Pass
          </button>
          <button className={styles.niceButton} onClick={surrenderTurn}>
            Surrender
          </button>
        </>
      )}
      {(winnerColor != null || isOffline) && (
        <NavButton path={START_PATH} callback={endGame}>
          End game
        </NavButton>
      )}
    </div>
  )
}