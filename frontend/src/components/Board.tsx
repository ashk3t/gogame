import styles from "../styles/Board.module.css"
import {useMemo, useState} from "react"
import {useActions, useAppSelector} from "../hooks/redux"
import CircleSvg from "../assets/CircleSvg"
import {BoardIntersectionStyler} from "../utils"
import {GameBoard, InvalidTurnError, Stone} from "../lib/gamelogic"
import {stoneColors} from "../consts/utils"
import {GameMode} from "../types/game"

export default function Board(props: {board: GameBoard; updater: any; triggerUpdater: () => void}) {
  const {board, triggerUpdater} = props
  const {setGameRep, setTurnError, setGameWinner} = useActions()

  const gameMode = useAppSelector((state) => state.gameReducer.settings.mode)
  const gameWinner = useAppSelector((state) => state.gameReducer.winner)
  const [intersectionStyler] = useState(new BoardIntersectionStyler(board.height, board.width))

  function getIntersectionBackground(x: number, y: number) {
    return useMemo(() => {
      console.log("intersectionStyler.memo")
      return intersectionStyler.getBackground(x, y)
    }, [x, y])
  }

  function takeTurn(i: number, j: number) {
    if (gameWinner) return

    try {
      board.takeTurn(i, j)
    } catch (error) {
      if (error instanceof InvalidTurnError) setTurnError(error.message)
      else throw error
      return
    }
    setTurnError(null)
    if (gameMode == GameMode.ATARI && board.killer) setGameWinner(board.killer)
    setGameRep(board.toRep())

    triggerUpdater()
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