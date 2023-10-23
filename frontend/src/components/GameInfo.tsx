import styles from "../styles/GameInfo.module.css"
import {capitalize} from "lodash"
import {useAppSelector} from "../redux/hooks"
import {GameBoard, StoneColor} from "../lib/gamelogic"
import {hexColors, stoneHexColors} from "../consts/utils"
import ScoreBoard from "./ScoreBoard"
import SpectatorsSection from "./SpectatorsSection"

export default function GameInfo(props: {board: GameBoard}) {
  const {board} = props
  const winner = useAppSelector((state) => state.gameReducer.winner)
  const gameError = useAppSelector((state) => state.gameReducer.error)
  const connectedPlayers = useAppSelector((state) => state.playerReducer.players)

  function getPlayerNameByColor(color: StoneColor) {
    const name = connectedPlayers.find((player) => player.color == color)?.nickname
    return name || capitalize(StoneColor[color])
  }

  return (
    <div className={styles.infoContainer}>
      <section>
        <ScoreBoard board={board} />
      </section>
      {(winner != null || gameError) && (
        <section>
          {winner != null && (
            <h4 style={{color: stoneHexColors[winner]}}>Winner: {getPlayerNameByColor(winner)}!</h4>
          )}
          {gameError && <h5 style={{color: hexColors.love}}>{gameError}!</h5>}
        </section>
      )}
      <SpectatorsSection />
    </div>
  )
}