import styles from "../styles/GameInfo.module.css"
import {capitalize} from "lodash"
import {useAppSelector} from "../redux/hooks"
import {GameBoard, StoneColor} from "../lib/gamelogic"
import {hexColors, stoneHexColors} from "../consts/utils"
import {GameMode} from "../types/game"
import ScoreBoard from "./ScoreBoard"

export default function GameInfo(props: {board: GameBoard}) {
  const {board} = props
  const winner = useAppSelector((state) => state.gameReducer.winner)
  const settings = useAppSelector((state) => state.gameReducer.settings)
  const turnError = useAppSelector((state) => state.gameReducer.error)
  const connectedPlayers = useAppSelector((state) => state.playerReducer.players)

  function getPlayerNameByColor(color: StoneColor) {
    return settings.offline
      ? capitalize(StoneColor[color])
      : connectedPlayers.find((player) => player.color == color)?.nickname
  }

  return (
    <div className={styles.infoContainer}>
      <ScoreBoard board={board} />
      {turnError && (
        <section>
          <h5 style={{color: hexColors.love}}>{turnError}!</h5>
        </section>
      )}
      {winner != null && (
        <section>
          <h4 style={{color: stoneHexColors[winner]}}>Winner: {getPlayerNameByColor(winner)}!</h4>
        </section>
      )}
    </div>
  )
}