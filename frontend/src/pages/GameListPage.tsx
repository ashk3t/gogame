import {useEffect} from "react"
import {useActions, useAppSelector} from "../redux/hooks"
import {Game} from "../types/game"
import styles from "../styles/base.module.css"
import {START_PATH} from "../consts/pages"
import NavButton from "../components/buttons/NavButton"
import NiceButton from "../components/buttons/NiceButton"
import StaticBoard from "../components/StaticBoard"
import {GameBoard} from "../lib/gamelogic"

export default function GameListPage() {
  const games = useAppSelector((state) => state.gameListReducer.games)
  const {fetchAllGames, joinGame} = useActions()

  useEffect(() => {
    fetchAllGames()
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAllGames()
    }, 5000)
    return () => clearTimeout(timer)
  }, [games])

  return (
    <main className={`${styles.centeringContainer} ${styles.defaultMargin}`}>
      <NavButton path={START_PATH} scary={true}>
        Back
      </NavButton>
      <div className={styles.vcenteringContainer}>
        {games.map((game: Game, key) => (
          <div key={key} className={`${styles.frame} ${styles.vcenteringContainer}`}>
            <div>
              {game.settings.width}x{game.settings.height}
            </div>
            {game.rep && <StaticBoard board={GameBoard.fromRep(game.rep)}></StaticBoard>}
            <NiceButton onClick={() => joinGame(game.id!)}>Join</NiceButton>
          </div>
        ))}
      </div>
    </main>
  )
}