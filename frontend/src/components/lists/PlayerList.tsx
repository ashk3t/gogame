import styles from "../../styles/base.module.css"
import {stoneHexColors} from "../../consts/utils"
import {Player} from "../../types/player"

export default function PlayerList(props: {players: Array<Player>}) {
  const {players} = props

  return (
    <ul className={styles.vcenteringContainer}>
      {players.map((player) => (
        <li key={player.color} style={{color: stoneHexColors[player.color]}}>
          {player.nickname}
        </li>
      ))}
    </ul>
  )
}