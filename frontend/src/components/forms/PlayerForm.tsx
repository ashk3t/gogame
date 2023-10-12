import {useActions, useAppSelector} from "../../redux/hooks"
import styles from "../../styles/base.module.css"

export default function PlayerForm() {
  const nickname = useAppSelector((state) => state.playerReducer.thisPlayer.nickname)
  const {setNickname} = useActions()

  return (
    <input
      className={styles.niceInput}
      value={nickname}
      onChange={(e) => setNickname(e.target.value)}
    ></input>
  )
}