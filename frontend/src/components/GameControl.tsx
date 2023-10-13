import {START_PATH} from "../consts/pages"
import {useActions, useAppSelector} from "../redux/hooks"
import {GameBoard} from "../lib/gamelogic"
import styles from "../styles/GameControl.module.css"
import {GameMode} from "../types/game"
import NavButton from "./buttons/NavButton"
import NiceButton from "./buttons/NiceButton"
import ScaryButton from "./buttons/ScaryButton"

export default function GameControl(props: {board: GameBoard}) {
  const {board} = props
  const {setDraftMode, stepBackDraft, setTurnError, setGameRep, setGameWinner, endGame} =
    useActions()
  const winner = useAppSelector((state) => state.gameReducer.winner)
  const settings = useAppSelector((state) => state.gameReducer.settings)
  const draftRep = useAppSelector((state) => state.gameReducer.draftRep)

  function passTurn() {
    board.passTurn()
    updateGameData(board)
  }
  function finishTurnsTurn() {
    board.finishTurnsTurn()
    updateGameData(board)
  }
  function updateGameData(board: GameBoard) {
    setTurnError(null)
    if (board.passCounter >= board.players - board.finishedPlayers.size)
      setGameWinner(board.scores.indexOf(Math.max(...board.scores)))
    setGameRep(board.toRep())
  }

  return (
    <div className={styles.controlContainer}>
      {winner == null && draftRep && (
        <>
          <NiceButton onClick={() => stepBackDraft()}>Undo</NiceButton>
          <NiceButton onClick={() => setDraftMode(true)}>Reset</NiceButton>
          <NiceButton onClick={() => setDraftMode(false)}>Finish draft</NiceButton>
          <h6></h6>
        </>
      )}
      {winner == null && !draftRep && (
        <>
          <NiceButton onClick={() => setDraftMode(true)}>Draft mode</NiceButton>
          {settings.mode != GameMode.ATARI && <NiceButton onClick={passTurn}>Pass</NiceButton>}
          <h6></h6>
          {settings.mode != GameMode.ATARI && (
            <ScaryButton onClick={finishTurnsTurn}>Finish turns</ScaryButton>
          )}
        </>
      )}
      <NavButton path={START_PATH} callback={endGame} scary={true}>
        End game
      </NavButton>
    </div>
  )
}
// TODO: endGame or Finish + end if online