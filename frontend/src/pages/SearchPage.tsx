import {useNavigate} from "react-router-dom"
import ScaryButton from "../components/buttons/ScaryButton"
import styles from "../styles/base.module.css"
import {useEffect} from "react"
import {useAppSelector} from "../hooks/redux"
import {GAME_PATH, START_PATH} from "../consts/pages"
import NavButton from "../components/buttons/NavButton"
import GameService from "../services/GameService"

export default function SearchPage() {
  const maxPlayers = useAppSelector((state) => state.gameReducer.settings.players)
  const connectedPlayers = useAppSelector((state) => state.playerReducer.players)

  return (
    <main className={`${styles.vcenteringContainer} ${styles.marginEverything}`}>
      <h1>Search...</h1>
      <div className={`${styles.frame} ${styles.vcenteringContainer}`}>
        <h3>
          {connectedPlayers.length}/{maxPlayers}
        </h3>
        <ul className={styles.vcenteringContainer}>
          {connectedPlayers.map((player) => (
            <li>{player.nickname}</li>
          ))}
        </ul>
      </div>
      <NavButton path={START_PATH} callback={GameService.stopSearch} scary={true}>
        Cancel
      </NavButton>
    </main>
  )
}