import {AppDispatch, RootState} from "../store"
import GameService from "../../services/GameService"
import {gameSlice} from "../reducers/game"
import {playerSlice} from "../reducers/player"
import {gameListSlice} from "../reducers/gameList"
import {GameBoard} from "../../lib/gamelogic"
import {isOffline} from "../utils"

export const fetchAllGames = () => async (dispatch: AppDispatch) => {
  const data = await GameService.getAll()
  dispatch(gameListSlice.actions.setGames(data))
}

export const startGame = () => async (dispatch: AppDispatch, getState: () => RootState) => {
  const state = getState()
  const settings = state.gameReducer.settings

  if (isOffline(settings)) {
    const newGameRep = new GameBoard(settings.height, settings.width, settings.players).toRep()
    dispatch(gameSlice.actions.setGameRep(newGameRep))
  } else {
    const nickname = state.playerReducer.thisPlayer.nickname
    const connection = GameService.startSearch(nickname, settings)

    connection.onmessage = (event) => {
      const data = JSON.parse(event.data)

      const handlers = {
        player_connect: () => dispatch(playerSlice.actions.setPlayers(data.players)),
        player_disconnect: () => dispatch(playerSlice.actions.popPlayer(data.player_id)),
        game_start: () => {
          dispatch(playerSlice.actions.setThisPlayer(data.player))
          dispatch(gameSlice.actions.setGameRep(data.game_rep))
        },
      }
      handlers[data.type as keyof typeof handlers]()
    }

    connection.onclose = () => {
      dispatch(playerSlice.actions.setPlayers([]))
    }
  }
}

export const endGame = () => async (dispatch: AppDispatch) => {
  GameService.endGame()
  dispatch(gameSlice.actions.clearGamedata())
}