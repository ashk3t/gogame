import styles from "../../styles/base.module.css"
import NavButton from "../buttons/NavButton"
import {GAME_LIST_PATH, SEARCH_PATH} from "../../consts/pages"
import {useActions, useAppSelector} from "../../hooks/redux"

export default function StartButtonBox() {
  const {startGame} = useActions()
  const isOffline = useAppSelector((state) => state.gameReducer.settings.offline)
  const nickname = useAppSelector((state) => state.playerReducer.currentPlayer.nickname)

  if (!nickname && !isOffline) return <></>

  return (
    <div className={styles.centeringContainer}>
      <NavButton path={SEARCH_PATH} callback={startGame}>
        Go!
      </NavButton>
      <NavButton path={GAME_LIST_PATH}>Games?</NavButton>
    </div>
  )
}