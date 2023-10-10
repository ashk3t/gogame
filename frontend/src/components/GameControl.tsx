import {GAME_LIST_PATH, START_PATH} from "../consts/pages"
import {useActions, useAppSelector} from "../hooks/redux"
import {GameBoard, StoneColor} from "../lib/gamelogic"
import styles from "../styles/GameControl.module.css"
import NavButton from "./buttons/NavButton"
import NiceButton from "./buttons/NiceButton"
import ScaryButton from "./buttons/ScaryButton"

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
  const {setGameRep, endGame, setGameWinner, setTurnError} = useActions()

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
  function finishTurnsTurn() {
    mainBoard.finishTurnsTurn()
    updateGameData(mainBoard)
  }
  function updateGameData(board: GameBoard) {
    setTurnError(null)
    if (board.passCounter >= board.players - board.finishedPlayers.size)
      setGameWinner(board.scores.indexOf(Math.max(...board.scores)))
    setGameRep(board.toRep())
    triggerUpdater()
  }

  return (
    <div className={styles.controlContainer}>
      {winnerColor == null && draftBoard && (
        <>
          <NiceButton onClick={stepBackDraft}>Undo</NiceButton>
          <NiceButton onClick={startDraft}>Reset</NiceButton>
          <NiceButton onClick={finishDraft}>Finish draft</NiceButton>
          <h6></h6>
        </>
      )}
      {winnerColor == null && !draftBoard && (
        <>
          <NiceButton onClick={startDraft}>Draft mode</NiceButton>
          <NiceButton onClick={passTurn}>Pass</NiceButton>
          <h6></h6>
          <ScaryButton onClick={finishTurnsTurn}>Finish turns</ScaryButton>
        </>
      )}
      {(winnerColor != null || isOffline) && (
        <>
          <NavButton path={START_PATH} callback={endGame} scary={true}>
            End game
          </NavButton>
        </>
      )}
    </div>
  )
}