import {useEffect} from "react"
import {useActions, useAppSelector} from "../redux/hooks"
import {GameResponse} from "../types/game"
import styles from "../styles/base.module.css"
import {START_PATH} from "../consts/pages"
import NavButton from "../components/buttons/NavButton"
import NiceButton from "../components/buttons/NiceButton"
import StaticBoard from "../components/StaticBoard"
import {GameBoard} from "../lib/gamelogic"
import {capitalize} from "lodash"
import {timePassed} from "../utils"

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
        {games.map((game: GameResponse, key) => (
          <div key={key} className={`${styles.frame} ${styles.vcenteringContainer}`}>
            {game.rep ? (
              <>
                <StaticBoard board={GameBoard.fromRep(game.rep)}></StaticBoard>
                <NiceButton onClick={() => joinGame(game.id!)}>Spectate</NiceButton>
              </>
            ) : (
              <>
                <div>{timePassed(new Date(game.searchStartTime))}</div>
                <div>
                  {game.settings.width}x{game.settings.height}, {capitalize(game.settings.mode)}
                </div>
                <div>
                  {0}/{game.settings.players}:
                </div>
                <NiceButton onClick={() => joinGame(game.id!)}>Join</NiceButton>
              </>
            )}
          </div>
        ))}
      </div>
    </main>
  )
}