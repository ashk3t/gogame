import {useActions, useAppSelector} from "../redux/hooks"
import {GameBoard} from "../lib/gamelogic"
import styles from "../styles/GameControl.module.css"
import {GameMode} from "../types/game"
import NiceButton from "./buttons/NiceButton"
import ScaryButton from "./buttons/ScaryButton"

export default function GameControl(props: {board: GameBoard}) {
  const {board} = props
  const {setDraftMode, stepBackDraft, endGame, passTurn, finishTurnsTurn} = useActions()
  const game = useAppSelector((state) => state.gameReducer)
  const thisPlayer = useAppSelector((state) => state.playerReducer.thisPlayer)

  return (
    <div className={styles.controlContainer}>
      {game.winner == null && game.draftRep && (
        <>
          <NiceButton onClick={() => stepBackDraft()}>Undo</NiceButton>
          <NiceButton onClick={() => setDraftMode(true)}>Reset</NiceButton>
          <NiceButton onClick={() => setDraftMode(false)}>Finish draft</NiceButton>
          <h6></h6>
        </>
      )}
      {game.winner == null && !game.draftRep && (
        <>
          <NiceButton onClick={() => setDraftMode(true)}>Draft mode</NiceButton>
          {game.settings.mode != GameMode.ATARI &&
            (game.settings.offline || thisPlayer.color == board.turnColor) && (
              <NiceButton onClick={() => passTurn(board)}>Pass</NiceButton>
            )}
          <h6></h6>
          {game.settings.mode != GameMode.ATARI && (
            <ScaryButton onClick={() => finishTurnsTurn(board)}>Finish turns</ScaryButton>
          )}
        </>
      )}
      <ScaryButton onClick={endGame}>Leave game</ScaryButton>
    </div>
  )
}
// TODO: Finish + end if online