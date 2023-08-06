import {applyMiddleware, combineReducers, createStore} from "redux"
import thunk from "redux-thunk"
import {composeWithDevTools} from "@redux-devtools/extension"
import {persistStore, persistReducer} from "redux-persist"
// import storage from "redux-persist/lib/storage"
import requestReducer from "./reducers/requestReducer"

const middlewares = [thunk]

const rootReducer = combineReducers({
  // authReducer: persistReducer({key: "authReducer", storage}, authReducer),
  requestReducer,
})

export const store = createStore(
  rootReducer,
  composeWithDevTools(applyMiddleware(...middlewares))
)
export const persistor = persistStore(store)