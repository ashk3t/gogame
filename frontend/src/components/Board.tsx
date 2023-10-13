import styles from "../styles/Board.module.css"
import {useMemo, useState} from "react"
import {useActions} from "../redux/hooks"
import CircleSvg from "../assets/CircleSvg"
import {BoardIntersectionStyler} from "../utils"
import {GameBoard, Stone, splitIJ} from "../lib/gamelogic"
import {hexColors, stoneHexColors} from "../consts/utils"

export default function Board(props: {board: GameBoard}) {
  const {board} = props
  const {takeTurn} = useActions()

  const [intersectionStyler] = useState(new BoardIntersectionStyler(board.height, board.width))
  const [libertyHints, setLibertyHints] = useState<Array<Array<boolean>>>(
    Array.from(Array(board.height), () => new Array(board.width).fill(false)),
  )
  const [hintsHere, setHintsHere] = useState(false) // Optimization: do not rerender if point is empty

  function getIntersectionBackground(i: number, j: number) {
    return useMemo(() => {
      return intersectionStyler.getBackground(i, j)
    }, [i, j])
  }

  function updateHints(i: number, j: number) {
    if (hintsHere) setLibertyHints(libertyHints.map((row) => row.fill(false)))
    const stone = board.stones[i][j]
    setHintsHere(stone instanceof Stone)

    if (stone) {
      for (const ij of stone.group.liberties) {
        const [i, j] = splitIJ(ij)
        libertyHints[i][j] = true
        setLibertyHints([...libertyHints])
      }
    }
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
            onClick={() => takeTurn(i, j, board)}
            onMouseOver={() => updateHints(i, j)}
          >
            {stone && (
              <CircleSvg className={styles.stone} style={{color: stoneHexColors[stone.color]}} />
            )}
            {libertyHints[i][j] && (
              <CircleSvg className={styles.stone} style={{color: hexColors.highlightHighAlpha}} />
            )}
          </div>
        )),
      )}
    </div>
  )
}