import {GAME_LIST_PATH, START_PATH} from "../consts/pages"
import {useActions, useAppSelector} from "../hooks/redux"
import styles from "../styles/base.module.css"
import NavButton from "./buttons/NavButton"

export default function GameControl(props: {
  draftMode: boolean
  startDraft: () => void
  stepBackDraft: () => void
  finishDraft: () => void
}) {
  const {draftMode, startDraft, stepBackDraft, finishDraft} = props
  const isOffline = useAppSelector((state) => state.gameReducer.settings.offline)
  const gameWinner = useAppSelector((state) => state.gameReducer.winner)
  const {endGame} = useActions()

  return (
    <div>
      {!gameWinner && draftMode && (
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
      {!gameWinner && !draftMode && (
        <>
          <button className={styles.niceButton} onClick={startDraft}>
            Draft mode
          </button>
          <button className={styles.niceButton} onClick={() => {}}>
            Pass
          </button>
          {!isOffline && (
            <button className={styles.niceButton} onClick={() => {}}>
              Surrender
            </button>
          )}
        </>
      )}
      {(gameWinner || isOffline) && (
        <NavButton path={START_PATH} callback={endGame}>
          End game
        </NavButton>
      )}
    </div>
  )
}