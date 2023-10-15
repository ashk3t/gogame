import {combineReducers} from "redux"
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist"
import storage from "redux-persist/lib/storage"
import playerReducer from "./reducers/player"
import gameReducer from "./reducers/game"
import gameListReducer from "./reducers/gameList"
import {configureStore} from "@reduxjs/toolkit"

const rootReducer = combineReducers({
  playerReducer: persistReducer(
    {key: "playerReducer", storage},
    playerReducer,
  ),
  gameReducer: persistReducer(
    {key: "gameReducer", storage, whitelist: ["settings", "rep", "winner"]},
    gameReducer,
  ),
  gameListReducer,
})

export const store = configureStore({
  reducer: rootReducer,
  devTools: process.env.NODE_ENV == "development",
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
})
export const persistor = persistStore(store)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch