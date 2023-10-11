import {useNavigate} from "react-router-dom"
import ScaryButton from "../components/buttons/ScaryButton"
import styles from "../styles/base.module.css"
import {useEffect} from "react"
import {useAppSelector} from "../hooks/redux"
import {GAME_PATH, START_PATH} from "../consts/pages"
import NavButton from "../components/buttons/NavButton"
import GameService from "../services/GameService"

export default function SearchPage() {
  return (
    <main className={`${styles.vcenteringContainer} ${styles.marginEverything}`}>
      <h1>Search...</h1>
      <div className={`${styles.frame} ${styles.vcenteringContainer}`}>
        <h3>3/5</h3>
        <ul className={styles.vcenteringContainer}>
          <li>Shk3t</li>
          <li>ashket</li>
          <li>Phantazumu</li>
        </ul>
      </div>
      <NavButton path={START_PATH} callback={GameService.stopSearch} scary={true}>
        Cancel
      </NavButton>
    </main>
  )
}