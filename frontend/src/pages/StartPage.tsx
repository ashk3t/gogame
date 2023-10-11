import PlayerForm from "../components/forms/PlayerForm"
import NavButton from "../components/buttons/NavButton"
import styles from "../styles/base.module.css"
import {getRandomNicknameLabel} from "../utils"
import GameSettingsForm from "../components/forms/GameSettingsForm"
import {GAME_LIST_PATH, SEARCH_PATH} from "../consts/pages"
import {useActions} from "../hooks/redux"

export default function StartPage() {
  const nicknameLabel = getRandomNicknameLabel()
  const {startGame} = useActions()

  return (
    <main className={`${styles.centeringContainer} ${styles.defaultMargin}`}>
      <div className={styles.vcenteringContainer}>
        <div className={styles.vcenteringContainer}>
          <h3>{nicknameLabel}'s name:</h3>
          <PlayerForm />
        </div>
        <div className={styles.centeringContainer}>
          <NavButton path={SEARCH_PATH} callback={startGame}>Go!</NavButton>
          <NavButton path={GAME_LIST_PATH}>Games?</NavButton>
        </div>
        <GameSettingsForm />
      </div>
    </main>
  )
}