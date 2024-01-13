import styles from "../styles/Board.module.css"
import {CSSProperties, useEffect, useState} from "react"
import {useActions, useAppSelector} from "../redux/hooks"
import CircleSvg from "../assets/CircleSvg"
import {BoardIntersectionStyler} from "../utils"
import {GameBoard, Stone, splitIJ} from "../lib/gamelogic"
import {hexColors, stoneHexColors} from "../consts/utils"
import {turnColor} from "../utils"

export default function Board(props: {board: GameBoard}) {
  const {board} = props
  const {takeTurn} = useActions()

  const onlineRep = useAppSelector((state) => state.gameReducer.rep)
  const winner = useAppSelector((state) => state.gameReducer.winner)
  const showOccupation = useAppSelector((state) => state.gameReducer.showOccupation)
  const [intersectionStyles, setIntersectionStyles] = useState<CSSProperties[][]>(
    Array.from(Array(board.height), () => new Array(board.width).fill({})),
  )
  const [libertyHints, setLibertyHints] = useState<boolean[][]>(
    Array.from(Array(board.height), () => new Array(board.width).fill(false)),
  )
  const [hintsHere, setHintsHere] = useState(false) // Optimization: do not rerender if point is empty

  useEffect(() => {
    const styler = new BoardIntersectionStyler(board.height, board.width)
    setIntersectionStyles(
      intersectionStyles.map((row, i) =>
        row.map((_, j) =>
          styler.getStyle(
            i,
            j,
            onlineRep ? turnColor(onlineRep) : board.turnColor,
            winner,
            showOccupation ? board.occupationColors[i][j] : null,
          ),
        ),
      ),
    )
  }, [board, winner, showOccupation])

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
    <div className={styles.board} style={{gridTemplateColumns: `repeat(${board.width}, 1fr)`}}>
      {board.stones.map((row: Array<Stone | null>, i: number) =>
        row.map((stone: Stone | null, j: number) => (
          <div
            key={`(${i}, ${j})`}
            className={styles.intersection}
            style={intersectionStyles[i][j]}
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