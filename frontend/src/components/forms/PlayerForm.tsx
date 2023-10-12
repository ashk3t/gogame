import {useState} from "react"
import {useActions, useAppSelector} from "../../redux/hooks"
import styles from "../../styles/base.module.css"
import {getRandomNicknameLabel} from "../../utils"

export default function PlayerForm() {
  const nickname = useAppSelector((state) => state.playerReducer.thisPlayer.nickname)
  const {setNickname} = useActions()
  const isCustom = useAppSelector((state) => state.gameReducer.settings.custom)
  const isOffline = useAppSelector((state) => state.gameReducer.settings.offline)
  const [nicknameLabel] = useState(getRandomNicknameLabel())

  if (isCustom && isOffline) return <></>

  return (
    <div className={styles.vcenteringContainer}>
      <h3>{nicknameLabel}'s name:</h3>
      <input
        className={styles.niceInput}
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
      ></input>
    </div>
  )
}