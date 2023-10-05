import {useState} from "react"
import Board from "../components/Board"
import GameInfo from "../components/GameInfo"
import {useAppSelector} from "../hooks/redux"
import {GameBoard} from "../lib/gamelogic"

export default function GamePage() {
  const settings = useAppSelector((state) => state.gameReducer.settings)
  const [board] = useState(new GameBoard(settings.height, settings.width, settings.players))
  const [gameStateListener, setGameState] = useState(0)

  function updateGameState() {
    setGameState(gameStateListener + 1)
  }

  return (
    <main>
      <section>
        <GameInfo board={board} listener={gameStateListener} />
        <Board board={board} listener={gameStateListener} updateGameState={updateGameState} />
      </section>
    </main>
  )
}