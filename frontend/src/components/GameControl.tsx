import {useAppSelector} from "../hooks/redux"
import styles from "../styles/base.module.css"

export default function GameControl(props: {
  draftMode: boolean
  startDraft: () => void
  stepBackDraft: () => void
  finishDraft: () => void
}) {
  const {draftMode, startDraft, stepBackDraft, finishDraft} = props
  const isOffline = useAppSelector((state) => state.gameReducer.settings.offline)
  const gameWinner = useAppSelector((state) => state.gameReducer.winner)

  return (
    <div>
      {gameWinner ? (
        <>
          <button className={styles.niceButton} onClick={() => {}}>
            New game
          </button>
          <button className={styles.niceButton} onClick={() => {}}>
            Game list
          </button>
        </>
      ) : (
        <>
          {draftMode ? (
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
          ) : (
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
        </>
      )}
    </div>
  )
}