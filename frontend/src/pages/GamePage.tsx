import {useState} from "react"
import Board from "../components/Board"
import GameInfo from "../components/GameInfo"
import {useAppSelector} from "../hooks/redux"
import {GameBoard} from "../lib/gamelogic"
import useUpdater from "../hooks/useUpdater"

export default function GamePage() {
  const settings = useAppSelector((state) => state.gameReducer.settings)
  const [board] = useState(new GameBoard(settings.height, settings.width, settings.players))
  const [gameUpdater, triggerGameUpdater] = useUpdater()

  return (
    <main>
      <section>
        <GameInfo board={board} updater={gameUpdater} />
        <Board board={board} updater={gameUpdater} triggerUpdater={triggerGameUpdater} />
      </section>
    </main>
  )
}