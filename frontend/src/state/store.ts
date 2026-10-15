import { configureStore } from "@reduxjs/toolkit"
import { FLUSH, PAUSE, PERSIST, persistReducer, persistStore, PURGE, REGISTER, REHYDRATE } from "redux-persist"
import storage from "redux-persist/lib/storage"

import authReducer from "@/state"

const persistConfig = {
  key: "root",
  storage,
  // v2: refreshToken added; rehydrate may leave refreshToken null until next login
  version: 2,
  migrate: async (state: unknown) => {
    if (!state || typeof state !== "object") return state as never
    const s = state as Record<string, unknown>
    return {
      ...s,
      refreshToken: (s.refreshToken as string | null | undefined) ?? null,
    } as never
  },
}

const persistedReducer = persistReducer(persistConfig, authReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: { ignoredActions: [FLUSH, PURGE, REGISTER, REHYDRATE, PAUSE, PERSIST] },
    }),
})

export const persistor = persistStore(store)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
