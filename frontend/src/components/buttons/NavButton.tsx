import styles from "../../styles/base.module.css"
import {AppDispatch} from "../../store"
import {startNewGame} from "../../action-creators/game"
import {useDispatch} from "react-redux"
import {useState} from "react"
import {useActions} from "../../hooks/redux"
import {useNavigate} from "react-router-dom"

export default function NavButton(props: {path: string, children: any}) {
  const navigate = useNavigate()

  return (
    <button className={styles.niceButton} onClick={() => navigate(props.path)}>
      {props.children}
    </button>
  )
}