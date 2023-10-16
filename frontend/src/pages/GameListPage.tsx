import {useEffect, useState} from "react"
import {useActions, useAppDispatch, useAppSelector} from "../redux/hooks"
import {Game} from "../types/game"
import styles from "../styles/base.module.css"
import {START_PATH} from "../consts/pages"
import NavButton from "../components/buttons/NavButton"
import NiceButton from "../components/buttons/NiceButton"

export default function GameListPage() {
  const games = useAppSelector((state) => state.gameListReducer.games)
  const {fetchAllGames, joinGame} = useActions()

  useEffect(() => {
    fetchAllGames()
  })

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAllGames()
    }, 3000)
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
            <NiceButton onClick={() => joinGame(game.id!)}>Join</NiceButton>
          </div>
        ))}
      </div>
    </main>
  )
}