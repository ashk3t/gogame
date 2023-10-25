import styles from "../../styles/base.module.css"
import {GAME_LIST_PATH} from "../../consts/pages"
import {useActions, useAppSelector} from "../../redux/hooks"
import NiceButton from "./NiceButton"
import {useNavigate} from "react-router-dom"

export default function StartButtonBox() {
  const navigate = useNavigate()
  const {startGame} = useActions()
  const settings = useAppSelector((state) => state.gameReducer.settings)
  const nickname = useAppSelector((state) => state.playerReducer.thisPlayer.nickname)

  if (!nickname && !settings.offline) return <></>

  return (
    <div className={styles.centeringContainer}>
      <NiceButton onClick={startGame}>Go!</NiceButton>
      {!settings.offline && (
        <NiceButton onClick={() => navigate(GAME_LIST_PATH)}>Games?</NiceButton>
      )}
    </div>
  )
}