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
  const {setDraftMode, stepBackDraft, endGame, passTurn, finishTurnsTurn} = useActions()
  const winner = useAppSelector((state) => state.gameReducer.winner)
  const settings = useAppSelector((state) => state.gameReducer.settings)
  const draftRep = useAppSelector((state) => state.gameReducer.draftRep)
  const thisPlayer = useAppSelector((state) => state.playerReducer.thisPlayer)

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
          {settings.mode != GameMode.ATARI &&
            (settings.offline || thisPlayer.color == board.turnColor) && (
              <NiceButton onClick={() => passTurn(board)}>Pass</NiceButton>
            )}
          <h6></h6>
          {settings.mode != GameMode.ATARI && (
            <ScaryButton onClick={() => finishTurnsTurn(board)}>Finish turns</ScaryButton>
          )}
        </>
      )}
      <ScaryButton onClick={endGame}>End game</ScaryButton>
    </div>
  )
}
// TODO: Finish + end if online