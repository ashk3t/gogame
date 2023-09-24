import styles from "../styles/Board.module.css"
import {useEffect, useMemo, useState} from "react"
import {useActions, useAppDispatch, useAppSelector} from "../hooks/redux"
import {fetchAllGames} from "../action-creators/game"
import CircleSvg from "../assets/CircleSvg"
import {BoardIntersectionStyler} from "../utils"

export default function Board() {
  const xSize = 19
  const ySize = 19
  const board = Array.from({length: xSize}, () => new Array(ySize).fill(0))

  const [intersectionStyler] = useState(new BoardIntersectionStyler(xSize, ySize))

  function getIntersectionBackground(x: number, y: number) {
    return useMemo(() => intersectionStyler.getBackground(x, y), [x, y])
  }

  return (
    <div
      className={styles.board}
      style={{
        gridTemplateRows: `repeat(${ySize}, 1fr)`,
      }}
    >
      {board.map((column: any[], x: number) =>
        column.map((intersection: number, y: number) => (
          <div
            key={`(${x}, ${y})`}
            className={styles.intersection}
            style={getIntersectionBackground(x, y)}
          >
            <CircleSvg className={styles.stone} />
          </div>
        )),
      )}
    </div>
  )
}