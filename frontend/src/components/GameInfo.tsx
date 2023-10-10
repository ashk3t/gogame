import styles from "../styles/GameInfo.module.css"
import {capitalize} from "lodash"
import {useAppSelector} from "../hooks/redux"
import {GameBoard, StoneColor} from "../lib/gamelogic"
import {hexColors, stoneHexColors} from "../consts/utils"

export default function GameInfo(props: {board: GameBoard; updater: any}) {
  const {board} = props
  const turnError = useAppSelector((state) => state.gameReducer.error)
  const winnerColor = useAppSelector((state) => state.gameReducer.winner)

  const passedPlayers: boolean[] = (() => {
    const passedPlayers = Array(board.players).fill(false)
    for (let i = 1, nth = board.passCounter; nth > 0; i++) {
      const index = (board.turnColor + board.players - i) % board.players
      if (!board.finishedPlayers.has(index)) {
        passedPlayers[index] = true
        nth--
      }
    }
    return passedPlayers
  })()

  return (
    <div className={styles.infoContainer}>
      {winnerColor == null && (
        <section>
          <h4 style={{color: stoneHexColors[board.turnColor]}}>
            Turn: {capitalize(StoneColor[board.turnColor])}
          </h4>
          {turnError && <div style={{color: hexColors.love}}>{turnError}!</div>}
        </section>
      )}
      <section>
        <h4>Score:</h4>
        {board.scores.map((score, idx) => (
          <div key={idx} style={{color: stoneHexColors[idx]}}>
            {capitalize(StoneColor[idx]).padStart(6) + ": "}
            {score.toFixed(0).padEnd(4) +
              (board.finishedPlayers.has(idx)
                ? " (finished)"
                : passedPlayers[idx]
                ? " (passed)"
                : "")}
          </div>
        ))}
      </section>
      {winnerColor != null && (
        <section>
          <h4 style={{color: stoneHexColors[winnerColor]}}>
            Winner: {capitalize(StoneColor[winnerColor])}!
          </h4>
        </section>
      )}
    </div>
  )
}