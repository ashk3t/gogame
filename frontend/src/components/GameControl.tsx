import {useActions, useAppSelector} from "../redux/hooks"
import {GameBoard, StoneColor} from "../lib/gamelogic"
import styles from "../styles/GameControl.module.css"
import {GameMode} from "../types/game"
import NiceButton from "./buttons/NiceButton"
import ScaryButton from "./buttons/ScaryButton"
import Space from "./Space"
import useGoBack from "../hooks/useGoBack"

export default function GameControl(props: {board: GameBoard}) {
  const goBack = useGoBack()
  const {board} = props
  const {setDraftMode, stepBackDraft, passTurn, finishTurnsTurn} = useActions()
  const game = useAppSelector((state) => state.gameReducer)
  const thisPlayer = useAppSelector((state) => state.playerReducer.thisPlayer)

  return (
    <div className={styles.controlContainer}>
      {game.winner == null && game.draftRep && (
        <>
          <NiceButton onClick={() => stepBackDraft()}>Undo</NiceButton>
          <NiceButton onClick={() => setDraftMode(true)}>Reset</NiceButton>
          <NiceButton onClick={() => setDraftMode(false)}>Finish draft</NiceButton>
          <Space />
        </>
      )}
      {game.winner == null && !game.draftRep && (
        <>
          <NiceButton onClick={() => setDraftMode(true)}>Draft mode</NiceButton>
          {game.settings.mode != GameMode.ATARI &&
            (game.settings.offline || thisPlayer.color == board.turnColor) && (
              <NiceButton onClick={() => passTurn(board)}>Pass</NiceButton>
            )}
          <Space />
          {game.settings.mode != GameMode.ATARI &&
            (game.settings.offline ||
              (thisPlayer.color != StoneColor.NONE &&
                !board.finishedPlayers.has(thisPlayer.color))) && (
              <ScaryButton onClick={() => finishTurnsTurn(board)}>Finish turns</ScaryButton>
            )}
        </>
      )}
      <ScaryButton onClick={goBack}>Leave</ScaryButton>
    </div>
  )
}