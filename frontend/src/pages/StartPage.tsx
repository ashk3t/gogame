import PlayerForm from "../components/forms/PlayerForm"
import styles from "../styles/base.module.css"
import GameSettingsForm from "../components/forms/GameSettingsForm"
import StartButtonBox from "../components/buttons/StartButtonBox"

export default function StartPage() {
  return (
    <main className={`${styles.centeringContainer} ${styles.defaultMargin}`}>
      <div className={styles.vcenteringContainer}>
        <PlayerForm />
        <StartButtonBox />
        <GameSettingsForm />
      </div>
    </main>
  )
}