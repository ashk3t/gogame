import styles from "../styles/base.module.css"
import {useActions, useAppSelector} from "../redux/hooks"
import {START_PATH} from "../consts/pages"
import NavButton from "../components/buttons/NavButton"
import GameService from "../services/GameService"
import {defaultGameSettings} from "../types/game"
import ScaryButton from "../components/buttons/ScaryButton"
import {stoneHexColors} from "../consts/utils"

export default function SearchPage() {
  const settings = useAppSelector((state) => state.gameReducer.settings)
  const connectedPlayers = useAppSelector((state) => state.playerReducer.players)
  const {endGame} = useActions()

  return (
    <main className={`${styles.vcenteringContainer} ${styles.marginEverything}`}>
      <h1>Search...</h1>
      <div className={`${styles.frame} ${styles.vcenteringContainer}`}>
        <h3>
          {connectedPlayers.length}/
          {settings.custom ? settings.players : defaultGameSettings.players}
        </h3>
        <ul className={styles.vcenteringContainer}>
          {connectedPlayers.map((player, key) => (
            <li key={key} style={{color: stoneHexColors[player.color]}}>
              {player.nickname}
            </li>
          ))}
        </ul>
      </div>
      <ScaryButton onClick={endGame}>Cancel</ScaryButton>
    </main>
  )
}