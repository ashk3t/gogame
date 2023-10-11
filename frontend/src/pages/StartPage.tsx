import PlayerForm from "../components/forms/PlayerForm"
import styles from "../styles/base.module.css"
import {getRandomNicknameLabel} from "../utils"
import GameSettingsForm from "../components/forms/GameSettingsForm"
import StartButtonBox from "../components/buttons/StartButtonBox"

export default function StartPage() {
  const nicknameLabel = getRandomNicknameLabel()

  return (
    <main className={`${styles.centeringContainer} ${styles.defaultMargin}`}>
      <div className={styles.vcenteringContainer}>
        <div className={styles.vcenteringContainer}>
          <h3>{nicknameLabel}'s name:</h3>
          <PlayerForm />
        </div>
        <StartButtonBox />
        <GameSettingsForm />
      </div>
    </main>
  )
}