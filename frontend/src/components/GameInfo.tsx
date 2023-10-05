import styles from "../styles/Board.module.css"
import {capitalize} from "lodash"
import {useAppSelector} from "../hooks/redux"
import {GameBoard, StoneColor} from "../lib/gamelogic"
import {stoneColors} from "../consts/utils"
import {getTurnHexColor} from "../utils"

export default function GameInfo(props: {board: GameBoard, listener: any}) {
  const {board} = props

  return (
    <div>
      <div>SCORE:</div>
      {board.scores.map((score, idx) => (
        <div key={idx} style={{color: stoneColors[idx + 1]}}>
          {capitalize(StoneColor[idx + 1])}: {score}
        </div>
      ))}
      <br />
      <div style={{color: getTurnHexColor(board)}}>TURN: {capitalize(StoneColor[board.turnColor])}</div>
    </div>
  )
}