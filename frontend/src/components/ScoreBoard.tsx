import {capitalize} from "lodash"
import {GameBoard, StoneColor} from "../lib/gamelogic"
import {useAppSelector} from "../redux/hooks"
import {stoneHexColors} from "../consts/utils"

export default function ScoreBoard(props: {board: GameBoard}) {
  const {board} = props
  const connectedPlayers = useAppSelector((state) => state.playerReducer.players)
  const winner = useAppSelector((state) => state.gameReducer.winner)

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
    Math.max(...connectedPlayers.map((player) => player.nickname.length), 6) +
    (winner == null ? 2 : 0)

  function wrapActivePlayer(name: string, color: StoneColor) {
    if (color == board.turnColor && winner == null) return `>${name}<`
    return name
  }

  return board.scores.map((_, color) => {
    const player = connectedPlayers.find((p) => p.color == color)
    const name = player?.nickname ?? capitalize(StoneColor[color])
    const disconnected = player?.disconnected ?? false
    return (
      <h5 key={color} style={{color: stoneHexColors[color]}}>
        {wrapActivePlayer(name, color).padStart(maxNicknameLength)}
        {": " +
          board.scores[color].toFixed(0).padEnd(4) +
          (board.finishedPlayers.has(color) ? " finished" : passedPlayers[color] ? " passed" : "") +
          (disconnected ? " disconnected" : "")}
      </h5>
    )
  })
}