import PlayerInput from "../components/inputs/PlayerInput"
import NavButton from "../components/buttons/NavButton"
import styles from "../styles/base.module.css"
import {getRandomNicknameLabel} from "../utils"
import GameSettingsForm from "../components/forms/GameSettingsForm"
import {GAME_LIST_PATH, GAME_PATH} from "../consts/pages"
import {useActions, useAppSelector} from "../hooks/redux"

export default function StartPage() {
  const nicknameLabel = getRandomNicknameLabel()
  const {startGame} = useActions()

  return (
    <main className={`${styles.centeringContainer} ${styles.defaultMargin}`}>
      <div className={styles.vcenteringContainer}>
        <div className={styles.vcenteringContainer}>
          <h3>{nicknameLabel}'s name:</h3>
          <PlayerInput />
        </div>
        <div className={styles.centeringContainer}>
          <NavButton path={GAME_PATH} callback={startGame}>Go!</NavButton>
          <NavButton path={GAME_LIST_PATH}>Games?</NavButton>
        </div>
        <br />
        <GameSettingsForm />
      </div>
    </main>
  )
}