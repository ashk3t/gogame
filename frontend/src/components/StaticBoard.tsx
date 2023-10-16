import styles from "../styles/Board.module.css"
import {useMemo, useState} from "react"
import CircleSvg from "../assets/CircleSvg"
import {BoardIntersectionStyler} from "../utils"
import {GameBoard, Stone} from "../lib/gamelogic"
import {stoneHexColors} from "../consts/utils"

export default function StaticBoard(props: {board: GameBoard}) {
  const {board} = props

  const [intersectionStyler] = useState(new BoardIntersectionStyler(board.height, board.width))

  function getIntersectionBackground(i: number, j: number) {
    return useMemo(() => {
      return intersectionStyler.getBackground(i, j)
    }, [i, j])
  }

  return (
    <div
      className={styles.board}
      style={{
        gridTemplateColumns: `repeat(${board.width}, 1fr)`,
        width: "400px"
      }}
    >
      {board.stones.map((row: Array<Stone | null>, i: number) =>
        row.map((stone: Stone | null, j: number) => (
          <div
            key={`(${i}, ${j})`}
            className={styles.intersection}
            style={getIntersectionBackground(i, j)}
          >
            {stone && (
              <CircleSvg className={styles.stone} style={{color: stoneHexColors[stone.color]}} />
            )}
          </div>
        )),
      )}
    </div>
  )
}