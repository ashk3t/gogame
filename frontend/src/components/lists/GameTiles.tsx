import {capitalize} from "lodash"
import {GameBoard} from "../../lib/gamelogic"
import {GameResponse} from "../../types/game"
import StaticBoard from "../StaticBoard"
import NiceButton from "../buttons/NiceButton"
import CenteringContainer from "../containers/CenteringContainer"
import PlayerList from "./PlayerList"
import {timePassed} from "../../utils"
import {useActions} from "../../redux/hooks"
import styles from "../../styles/lists/GameTiles.module.css"
import Space from "../Space"
import {memo} from "react"

interface GameTilesProps {
  games: GameResponse[]
}

function GameTiles(props: GameTilesProps) {
  const {games} = props
  const {joinGame} = useActions()

  return (
    <div className={styles.gameTilesContainer}>
      {games.map((game: GameResponse) => (
        <CenteringContainer
          key={game.id}
          vertical={true}
          frame={true}
          onClick={() => joinGame(game.id)}
        >
          {game.rep ? (
            <>
              <h6>{timePassed(new Date(game.searchStartTime))}</h6>
              <StaticBoard board={GameBoard.fromRep(game.rep)}></StaticBoard>
              <PlayerList players={game.players} />
            </>
          ) : (
            <>
              <h6>{timePassed(new Date(game.searchStartTime))}</h6>
              <h2>
                {game.settings.height}x{game.settings.width}, {capitalize(game.settings.mode)}
              </h2>
              <Space />
              <h3>
                {game.players.length}/{game.settings.players}
              </h3>
              {game.players.length > 0 && <PlayerList players={game.players} big={true} />}
            </>
          )}
        </CenteringContainer>
      ))}
    </div>
  )
}

function areEqual(prev: GameTilesProps, next: GameTilesProps) {
  return prev.games == next.games
}

export default memo(GameTiles, areEqual)