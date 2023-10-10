import styles from "../styles/Board.module.css"
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
      if (!board.surrenderedPlayers.has(index)) {
        passedPlayers[index] = true
        nth--
      }
    }
    return passedPlayers
  })()

  return (
    <div>
      <div>SCORE:</div>
      {board.scores.map((score, idx) => (
        <div key={idx} style={{color: stoneHexColors[idx]}}>
          {capitalize(StoneColor[idx]) + ": "}
          {score.toFixed(1) +
            (board.surrenderedPlayers.has(idx)
              ? " (surrendered)"
              : passedPlayers[idx]
              ? " (passed)"
              : "")}
        </div>
      ))}
      <br />
      {winnerColor == null && (
        <div style={{color: stoneHexColors[board.turnColor]}}>
          TURN: {capitalize(StoneColor[board.turnColor])}
        </div>
      )}
      {turnError && <div style={{color: hexColors.love}}>ERROR: {turnError}</div>}
      {winnerColor != null && (
        <div style={{color: stoneHexColors[winnerColor]}}>WINNER: {StoneColor[winnerColor]}</div>
      )}
    </div>
  )
}