import styles from "../styles/base.module.css"
import {useActions, useAppSelector} from "../redux/hooks"
import {defaultGameSettings} from "../types/game"
import ScaryButton from "../components/buttons/ScaryButton"
import PlayerList from "../components/lists/PlayerList"
import {useEffect} from "react"
import GameService from "../services/GameService"

export default function SearchPage() {
  const settings = useAppSelector((state) => state.gameReducer.settings)
  const connectedPlayers = useAppSelector((state) => state.playerReducer.players)
  const {endGame} = useActions()

  useEffect(() => {
    if (connectedPlayers.length > 0 && !GameService.connection) endGame()
  }, [])

  return (
    <main className={`${styles.vcenteringContainer} ${styles.marginEverything}`}>
      <h1>Search...</h1>
      <div className={`${styles.frame} ${styles.vcenteringContainer}`}>
        <h3>
          {connectedPlayers.length}/
          {settings.custom ? settings.players : defaultGameSettings.players}
        </h3>
        <PlayerList players={connectedPlayers} />
      </div>
      <ScaryButton onClick={endGame}>Cancel</ScaryButton>
    </main>
  )
}