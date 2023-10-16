import styles from "../styles/GameInfo.module.css"
import {capitalize} from "lodash"
import {useAppSelector} from "../redux/hooks"
import {GameBoard, StoneColor} from "../lib/gamelogic"
import {hexColors, stoneHexColors} from "../consts/utils"
import ScoreBoard from "./ScoreBoard"
import SpectatorsSection from "./SpectatorsSection"
import {turnColor} from "../utils"

export default function GameInfo(props: {board: GameBoard}) {
  const {board} = props
  const winner = useAppSelector((state) => state.gameReducer.winner)
  const settings = useAppSelector((state) => state.gameReducer.settings)
  const turnError = useAppSelector((state) => state.gameReducer.error)
  const thisPlayer = useAppSelector((state) => state.playerReducer.thisPlayer)
  const connectedPlayers = useAppSelector((state) => state.playerReducer.players)
  const mainRep = useAppSelector((state) => state.gameReducer.rep)

  function getPlayerNameByColor(color: StoneColor) {
    return settings.offline
      ? capitalize(StoneColor[color])
      : connectedPlayers.find((player) => player.color == color)?.nickname
  }

  return (
    <div className={styles.infoContainer}>
      <section>
        {thisPlayer.color == turnColor(mainRep!) && (
          <h4 style={{color: stoneHexColors[thisPlayer.color], textAlign: "center"}}>Your turn</h4>
        )}
        <ScoreBoard board={board} />
      </section>
      {(winner != null || turnError) && (
        <section>
          {winner != null && (
            <h4 style={{color: stoneHexColors[winner]}}>Winner: {getPlayerNameByColor(winner)}!</h4>
          )}
          {turnError && <h5 style={{color: hexColors.love}}>{turnError}!</h5>}
        </section>
      )}
      <SpectatorsSection />
    </div>
  )
}