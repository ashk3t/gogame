import {useEffect, useState} from "react"
import {useActions, useAppDispatch, useAppSelector} from "../redux/hooks"
import {Game} from "../types/game"

export default function GameListPage() {
  const games = useAppSelector((state) => state.gameListReducer.games)
  const {fetchAllGames} = useActions()

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAllGames()
    }, 3000)
    return () => clearTimeout(timer)
  }, [games])

  return (
    <main>
      <h3>This page in development:</h3>
      <div>
        {games.map((game: Game, key) => (
          <div key={key}>
            {game.settings.width}x{game.settings.height}
          </div>
        ))}
      </div>
    </main>
  )
}