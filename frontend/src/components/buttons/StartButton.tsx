import styles from "../../styles/base.module.css"
import {AppDispatch} from "../../store"
import {startNewGame} from "../../action-creators/game"
import {useDispatch} from "react-redux"
import {useState} from "react"
import {useActions} from "../../hooks/redux"

export default function StartButton() {
  const {startNewGame} = useActions()
  return (
    <button className={styles.niceButton} onClick={startNewGame}>
      Go!
    </button>
  )
}