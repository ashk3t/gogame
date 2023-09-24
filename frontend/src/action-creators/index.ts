import * as requestActionCreators from "./request"
import * as gameActionCreators from "./game"
import {requestSlice} from "../reducers/request"
import {gameSlice} from "../reducers/game"

export default {
  ...requestSlice.actions,
  ...gameSlice.actions,
  ...requestActionCreators,
  ...gameActionCreators,
}