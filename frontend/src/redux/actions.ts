import * as gameThunks from "./thunks/game"
import {gameSlice} from "./reducers/game"
import {playerSlice} from "./reducers/player"
import {navigationSlice} from "./reducers/navigation"

export default {
  ...playerSlice.actions,
  ...gameSlice.actions,
  ...navigationSlice.actions,
  ...gameThunks,
}