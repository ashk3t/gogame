import {useEffect, useState} from "react"
import {useActions, useAppDispatch, useAppSelector} from "../hooks/redux"
import {fetchAllGames} from "../action-creators/game"

export default function GameListPage() {
  // const {games} = useAppSelector((state) => state.gameReducer)
  const games: any[] = []
  const {fetchAllGames} = useActions()

  useEffect(() => {
    fetchAllGames()
  }, [])

  return (
    <main>
      <section>
        <h3>This page in development:</h3>
        <div>
          {games.map((game: any) => (
            <div>{game.toString()}</div>
          ))}
        </div>
      </section>
    </main>
  )
}