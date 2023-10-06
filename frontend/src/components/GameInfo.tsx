import styles from "../styles/Board.module.css"
import {capitalize} from "lodash"
import {useActions, useAppSelector} from "../hooks/redux"
import {GameBoard, StoneColor} from "../lib/gamelogic"
import {colors, stoneColors} from "../consts/utils"
import {getTurnHexColor} from "../utils"
import {GameMode} from "../types/game"
import {useEffect} from "react"

export default function GameInfo(props: {board: GameBoard; updater: any}) {
  const {board, updater} = props
  const {setTurnError} = useActions()
  const turnError = useAppSelector((state) => state.gameReducer.error)
  const gameWinner = useAppSelector((state) => state.gameReducer.winner)

  return (
    <div>
      <div>SCORE:</div>
      {board.scores.map((score, idx) => (
        <div key={idx} style={{color: stoneColors[idx + 1]}}>
          {capitalize(StoneColor[idx + 1])}: {score}
        </div>
      ))}
      <br />
      {!gameWinner && (
        <div style={{color: getTurnHexColor(board)}}>
          TURN: {capitalize(StoneColor[board.turnColor])}
        </div>
      )}
      {turnError && <div style={{color: colors.love}}>ERROR: {turnError}</div>}
      {gameWinner && <div style={{color: colors.gold}}>WINNER: {gameWinner}</div>}
    </div>
  )
}