import {useState} from "react"
import {useActions, useAppSelector} from "../../redux/hooks"
import styles from "../../styles/base.module.css"
import {getRandomNicknameLabel} from "../../utils"
import {isOffline} from "../../redux/utils"

export default function PlayerForm() {
  const nickname = useAppSelector((state) => state.playerReducer.thisPlayer.nickname)
  const {setNickname} = useActions()
  const settings = useAppSelector((state) => state.gameReducer.settings)
  const [nicknameLabel] = useState(getRandomNicknameLabel())

  if (isOffline(settings)) return <></>

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