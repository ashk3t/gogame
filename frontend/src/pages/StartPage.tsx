import PlayerInput from "../components/inputs/PlayerInput"
import StartButton from "../components/buttons/StartButton"
import NavButton from "../components/buttons/NavButton"
import styles from "../styles/base.module.css"
import {getRandomNicknameLabel, startsWithVowel} from "../utils"
import GameSettingsForm from "../components/forms/GameSettingsForm"
import {useState} from "react"

export default function StartPage() {
  const nicknameLabel = getRandomNicknameLabel()

  return (
    <main className={`${styles.centeringContainer} ${styles.defaultMargin}`}>
      <div className={styles.vcenteringContainer}>
        <div className={styles.vcenteringContainer}>
          <h3>{nicknameLabel}'s name:</h3>
          <PlayerInput />
        </div>
        <div className={styles.centeringContainer}>
          <StartButton />
          <NavButton path="game_list">Games?</NavButton>
        </div>
        <GameSettingsForm />
      </div>
    </main>
  )
}