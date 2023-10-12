import {useEffect, useState} from "react"
import {useActions, useAppDispatch, useAppSelector} from "../redux/hooks"

export default function GameListPage() {
  // const {games} = useAppSelector((state) => state.gameReducer)
  const games: any[] = []
  const {fetchAllGames} = useActions()

  useEffect(() => {
    fetchAllGames()
  }, [])

  return (
    <main>
      <h3>This page in development:</h3>
      <div>
        {games.map((game: any) => (
          <div>{game.toString()}</div>
        ))}
      </div>
    </main>
  )
}