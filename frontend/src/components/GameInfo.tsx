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
  const game = useAppSelector((state) => state.gameReducer)
  const thisPlayer = useAppSelector((state) => state.playerReducer.thisPlayer)
  const connectedPlayers = useAppSelector((state) => state.playerReducer.players)

  function getPlayerNameByColor(color: StoneColor) {
    return connectedPlayers.length > 0
      ? connectedPlayers.find((player) => player.color == color)?.nickname
      : capitalize(StoneColor[color])
  }

  return (
    <div className={styles.infoContainer}>
      <section>
        {game.rep && thisPlayer.color == turnColor(game.rep) && (
          <h4 style={{color: stoneHexColors[thisPlayer.color], textAlign: "center"}}>Your turn</h4>
        )}
        <ScoreBoard board={board} />
      </section>
      {(game.winner != null || game.error) && (
        <section>
          {game.winner != null && (
            <h4 style={{color: stoneHexColors[game.winner]}}>
              Winner: {getPlayerNameByColor(game.winner)}!
            </h4>
          )}
          {game.error && <h5 style={{color: hexColors.love}}>{game.error}!</h5>}
        </section>
      )}
      <SpectatorsSection />
    </div>
  )
}