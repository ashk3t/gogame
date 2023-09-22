import styles from "../styles/Board.module.css"
import {useEffect, useState} from "react"
import {useActions, useAppDispatch, useAppSelector} from "../hooks/redux"
import {fetchAllGames} from "../action-creators/game"
import CircleSvg from "../assets/CircleSvg"

export default function Board() {
  const board = Array.from({length: 19}, () => new Array(19).fill(0))

  return (
    <div className={styles.board}>
      {board.map((row: any[]) =>
        row.map((cell: number) => (
          <div className={styles.boardCell}>
            <CircleSvg className={styles.stone} />
          </div>
        )),
      )}
    </div>
  )
}