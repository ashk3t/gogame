import styles from "../styles/Board.module.css"
import {useEffect, useMemo, useState} from "react"
import {useActions, useAppDispatch, useAppSelector} from "../hooks/redux"
import {fetchAllGames} from "../action-creators/game"
import CircleSvg from "../assets/CircleSvg"
import {BoardIntersectionStyler} from "../utils"
import {GameBoard, Stone} from "../lib/gamelogic"
import {stoneColors} from "../consts/utils"

export default function Board() {
  const {setRep} = useActions()

  // const settings = useAppSelector((state) => state.gameReducer.settings)
  const settings = {height: 3, width: 5}

  const [board] = useState(new GameBoard(settings.height, settings.width))
  const [stones, setStones] = useState(board.stones)
  const [intersectionStyler] = useState(new BoardIntersectionStyler(settings.height, settings.width))

  function getIntersectionBackground(x: number, y: number) {
    return useMemo(() => intersectionStyler.getBackground(x, y), [x, y])
  }

  function takeTurn(i: number, j: number) {
    board.takeTurn(i, j)
    setRep(board.toRep())
    setStones([...board.stones])
    console.log(board)
  }

  return (
    <div
      className={styles.board}
      style={{
        gridTemplateColumns: `repeat(${board.width}, 1fr)`,
      }}
    >
      {stones.map((row: Array<Stone | null>, i: number) =>
        row.map((stone: Stone | null, j: number) => (
          <div
            key={`(${i}, ${j})`}
            className={styles.intersection}
            style={getIntersectionBackground(i, j)}
            onClick={() => takeTurn(i, j)}
          >
            {stone && <CircleSvg className={styles.stone} style={{color: stoneColors[stone.color]}}/>}
          </div>
        )),
      )}
    </div>
  )
}