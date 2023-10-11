import * as gameActionCreators from "./game"
import {gameSlice} from "../reducers/game"
import {playerSlice} from "../reducers/player"

export default {
  ...playerSlice.actions,
  ...gameSlice.actions,
  ...gameActionCreators,
}