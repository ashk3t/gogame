import {useDispatch} from "react-redux"
import styles from "../styles/base.module.css"
import "../styles/pages/StartPage.module.css"
import {getRandomNicknameLabel, startsWithVowel} from "../utils"
import {searchGame} from "../reducers/gameReducer"
import React, {useState} from "react"

export default function StartPage() {
  const dispatch = useDispatch()
  const [nickname, setNickname] = useState("")

  const nicknameLabel = getRandomNicknameLabel()

  function updateNickname(e: React.ChangeEvent<HTMLInputElement>) {
    setNickname(e.target.value)
  }

  function startGame() {
    dispatch(searchGame(nickname))
  }

  return (
    <main className={styles.centeringContainer}>
      <div className={styles.vcenteringContainer}>
        <div className={styles.vcenteringContainer}>
          <h3>{nicknameLabel}'s name:</h3>
          <input className={styles.niceInput} value={nickname} onChange={updateNickname}></input>
        </div>
        <button className={styles.niceButton} onClick={startGame}>Go!</button>
        <h5 className={styles.linkLike}>
          Not a{startsWithVowel(nicknameLabel) ? "n" : ""} {nicknameLabel}?
        </h5>
      </div>
    </main>
  )
}