import PlayerInput from "../components/inputs/PlayerInput"
import StartButton from "../components/buttons/StartButton"
import styles from "../styles/base.module.css"
import {getRandomNicknameLabel, startsWithVowel} from "../utils"

export default function StartPage() {
  const nicknameLabel = getRandomNicknameLabel()

  return (
    <main className={`${styles.centeringContainer} ${styles.defaultMargin}`}>
      <div className={styles.vcenteringContainer}>
        <div className={styles.vcenteringContainer}>
          <h3>{nicknameLabel}'s name:</h3>
          <PlayerInput />
        </div>
        <StartButton/>
        <h5 className={styles.linkLike}>
          Not a{startsWithVowel(nicknameLabel) ? "n" : ""} {nicknameLabel}?
        </h5>
      </div>
    </main>
  )
}