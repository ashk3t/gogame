import {useEffect, useState} from "react"
import {useActions, useAppDispatch, useAppSelector} from "../hooks/redux"
import {fetchAllGames} from "../action-creators/game"
// import styles from "../../styles/base.module.css"
import styles from "../styles/Board.module.css"

// function Cell() {
// }

export default function Board() {
  const board = Array.from({length: 19}, () => new Array(19).fill(0))

  return (
    <div>
      {board.map((row: any[]) => (
        <div className={styles.boardRow}>
          {row.map((cell: number) => (
            <div className={styles.boardCell}></div>
          ))}
        </div>
      ))}
    </div>
  )
}