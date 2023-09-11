import {applyMiddleware, combineReducers, createStore} from "redux"
import thunk from "redux-thunk"
import {composeWithDevTools} from "@redux-devtools/extension"
import {persistStore, persistReducer} from "redux-persist"
// import storage from "redux-persist/lib/storage"
import requestReducer from "./reducers/request"
import gameReducer from "./reducers/game"
import gameListReducer from "./reducers/gameList"
import {configureStore} from "@reduxjs/toolkit"

const middlewares = [thunk]

const rootReducer = combineReducers({
  // authReducer: persistReducer({key: "authReducer", storage}, authReducer),
  requestReducer,
  gameReducer,
  gameListReducer,
})

export const setupStore = () =>
  configureStore({
    reducer: rootReducer,
  })

export type RootState = ReturnType<typeof rootReducer>
export type AppStore = ReturnType<typeof setupStore>
export type AppDispatch = AppStore["dispatch"]

// export const store = createStore(rootReducer, composeWithDevTools(applyMiddleware(...middlewares)))
// export const persistor = persistStore(store)