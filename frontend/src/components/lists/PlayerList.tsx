import styles from "../../styles/base.module.css"
import {stoneHexColors} from "../../consts/utils"
import {Player} from "../../types/player"

function PlayerList(props: {players: Array<Player>; big: boolean}) {
  const {big, players} = props

  return (
    <ul className={styles.vcenteringContainer}>
      {players.map((player) => (
        <li
          key={player.color}
          className={big ? styles.big : ""}
          style={{color: stoneHexColors[player.color]}}
        >
          {player.nickname}
        </li>
      ))}
    </ul>
  )
}

PlayerList.defaultProps = {
  big: false,
}

export default PlayerList