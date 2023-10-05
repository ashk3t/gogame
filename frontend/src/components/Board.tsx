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
  const settings = {xSize: 5, ySize: 5}

  const [board] = useState(new GameBoard(settings.xSize, settings.ySize))
  const [stones, setStones] = useState(board.stones)
  const [intersectionStyler] = useState(new BoardIntersectionStyler(settings.xSize, settings.ySize))

  function getIntersectionBackground(x: number, y: number) {
    return useMemo(() => intersectionStyler.getBackground(x, y), [x, y])
  }

  function takeTurn(x: number, y: number) {
    board.takeTurn(x, y)
    setRep(board.toRep())
    setStones([...board.stones])
    console.log(board)
  }

  return (
    <div
      className={styles.board}
      style={{
        gridTemplateRows: `repeat(${board.ySize}, 1fr)`,
      }}
    >
      {stones.map((column: Array<Stone | null>, x: number) =>
        column.map((stone: Stone | null, y: number) => (
          <div
            key={`(${x}, ${y})`}
            className={styles.intersection}
            style={getIntersectionBackground(x, y)}
            onClick={() => takeTurn(x, y)}
          >
            {stone && <CircleSvg className={styles.stone} style={{color: stoneColors[stone.color]}}/>}
          </div>
        )),
      )}
    </div>
  )
}