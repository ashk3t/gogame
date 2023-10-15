import {capitalize} from "lodash"
import {GameBoard, StoneColor} from "../lib/gamelogic"
import {useAppSelector} from "../redux/hooks"
import {stoneHexColors} from "../consts/utils"

export default function ScoreBoard(props: {board: GameBoard}) {
  const {board} = props
  const connectedPlayers = useAppSelector((state) => state.playerReducer.players)

  const passedPlayers: boolean[] = (() => {
    const passedPlayers = Array(board.players).fill(false)
    for (let i = 1, nth = board.passCounter; nth > 0; i++) {
      const index = (board.turnColor + board.players - i) % board.players
      if (!board.finishedPlayers.has(index)) {
        passedPlayers[index] = true
        nth--
      }
    }
    return passedPlayers
  })()

  const maxNicknameLength =
    Math.max(...connectedPlayers.map((player) => player.nickname.length)) + 2

  function wrapActivePlayer(name: string, color: StoneColor) {
    if (color == board.turnColor) return `>${name}<`
    return name
  }

  return (
    <section>
      {connectedPlayers.length > 0
        ? connectedPlayers.map((player, idx) => (
            <h5 key={idx} style={{color: stoneHexColors[player.color]}}>
              {wrapActivePlayer(player.nickname, player.color).padStart(maxNicknameLength)}
              {": " +
                board.scores[player.color].toFixed(0).padEnd(4) +
                (board.finishedPlayers.has(idx)
                  ? " finished"
                  : passedPlayers[idx]
                  ? " passed"
                  : "") +
                (player.disconnected ? " disconnected" : "")}
            </h5>
          ))
        : board.scores.map((score, idx) => (
            <h5 key={idx} style={{color: stoneHexColors[idx]}}>
              {wrapActivePlayer(capitalize(StoneColor[idx]), idx).padStart(8)}
              {": " +
                score.toFixed(0).padEnd(4) +
                (board.finishedPlayers.has(idx)
                  ? " finished"
                  : passedPlayers[idx]
                  ? " passed"
                  : "")}
            </h5>
          ))}
    </section>
  )
}