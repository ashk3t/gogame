import * as requestActionCreators from "./request"
import * as gameActionCreators from "./game"

export default {
  ...requestActionCreators,
  ...gameActionCreators,
}