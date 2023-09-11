import {useEffect, useState} from "react"
import {useActions, useAppDispatch, useAppSelector} from "../hooks/redux"
import {fetchAllGames} from "../action-creators/game"

export default function GamesPage() {
  // const [games, setGames] = useState([])
  const {games} = useAppSelector((state) => state.gameReducer)
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