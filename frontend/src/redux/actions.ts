import * as gameThunks from "./thunks/game"
import {gameSlice} from "./reducers/game"
import {playerSlice} from "./reducers/player"

export default {
  ...playerSlice.actions,
  ...gameSlice.actions,
  ...gameThunks,
}