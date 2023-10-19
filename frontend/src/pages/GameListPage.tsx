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
import PlayerList from "../components/lists/PlayerList"

export default function GameListPage() {
  const games = useAppSelector((state) => state.gameListReducer.games)
  const {loadGames, joinGame} = useActions()

  useEffect(() => {
    loadGames()
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      loadGames()
    }, 5000)
    return () => clearTimeout(timer)
  }, [games])

  return (
    <main className={`${styles.centeringContainer} ${styles.defaultMargin}`}>
      <div className={styles.vcenteringContainer}>
        {games.map((game: GameResponse) => (
          <div key={game.id} className={`${styles.frame} ${styles.vcenteringContainer}`}>
            {game.rep ? (
              <>
                <StaticBoard board={GameBoard.fromRep(game.rep)}></StaticBoard>
                <NiceButton onClick={() => joinGame(game.id!)}>Spectate</NiceButton>
              </>
            ) : (
              <>
                <div>{timePassed(new Date(game.searchStartTime))}</div>
                <div>
                  {game.settings.height}x{game.settings.width}, {capitalize(game.settings.mode)}
                </div>
                <div>
                  {0}/{game.settings.players}:
                </div>
                <PlayerList players={game.players} />
                <NiceButton onClick={() => joinGame(game.id!)}>Join</NiceButton>
              </>
            )}
          </div>
        ))}
      <NavButton path={START_PATH} scary={true}>
        Back
      </NavButton>
      </div>
    </main>
  )
}