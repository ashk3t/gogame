import styles from "../styles/Board.module.css"
import {useMemo, useState} from "react"
import {useActions, useAppSelector} from "../hooks/redux"
import CircleSvg from "../assets/CircleSvg"
import {BoardIntersectionStyler} from "../utils"
import {GameBoard, Stone} from "../lib/gamelogic"
import {stoneColors} from "../consts/utils"

export default function Board(props: {
  board: GameBoard
  listener: any,
  updateGameState: () => void
}) {
  const {board, updateGameState} = props
  const {setRep} = useActions()

  const [intersectionStyler] = useState(new BoardIntersectionStyler(board.height, board.width))

  function getIntersectionBackground(x: number, y: number) {
    return useMemo(() => {
      console.log("intersectionStyler.memo")
      return intersectionStyler.getBackground(x, y)
    }, [x, y])
  }

  function takeTurn(i: number, j: number) {
    board.takeTurn(i, j)
    setRep(board.toRep())
    updateGameState()
    console.log(board)
  }

  return (
    <div
      className={styles.board}
      style={{
        gridTemplateColumns: `repeat(${board.width}, 1fr)`,
      }}
    >
      {board.stones.map((row: Array<Stone | null>, i: number) =>
        row.map((stone: Stone | null, j: number) => (
          <div
            key={`(${i}, ${j})`}
            className={styles.intersection}
            style={getIntersectionBackground(i, j)}
            onClick={() => takeTurn(i, j)}
          >
            {stone && (
              <CircleSvg className={styles.stone} style={{color: stoneColors[stone.color]}} />
            )}
          </div>
        )),
      )}
    </div>
  )
}