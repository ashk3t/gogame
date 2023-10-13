import styles from "../../styles/base.module.css"
import NavButton from "../buttons/NavButton"
import {GAME_LIST_PATH} from "../../consts/pages"
import {useActions, useAppSelector} from "../../redux/hooks"
import NiceButton from "./NiceButton"
import {isOffline} from "../../redux/utils"

export default function StartButtonBox() {
  const {startGame} = useActions()
  const settings = useAppSelector((state) => state.gameReducer.settings)
  const nickname = useAppSelector((state) => state.playerReducer.thisPlayer.nickname)

  if (!nickname && !isOffline(settings)) return <></>

  return (
    <div className={styles.centeringContainer}>
      <NiceButton onClick={startGame}>Go!</NiceButton>
      <NavButton path={GAME_LIST_PATH}>Games?</NavButton>
    </div>
  )
}