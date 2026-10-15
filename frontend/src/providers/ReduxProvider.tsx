"use client"

import React, { ReactNode } from "react"
import { configureStore } from "@reduxjs/toolkit"
import { Provider } from "react-redux"
import { FLUSH, PAUSE, PERSIST, persistReducer, persistStore, PURGE, REGISTER, REHYDRATE } from "redux-persist"
import { PersistGate } from "redux-persist/integration/react"
import storage from "redux-persist/lib/storage"

import authReducer from "@/state"

const persistConfig = { key: "root", storage, version: 1 }
const persistedReducer = persistReducer(persistConfig, authReducer)
const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: { ignoredActions: [FLUSH, PURGE, REGISTER, REHYDRATE, PAUSE, PERSIST] },
    }),
})

const persistor = persistStore(store)

// redux-persist types lag React 19; cast keeps PersistGate usable
const Gate = PersistGate as unknown as React.ComponentType<{
  loading: ReactNode
  persistor: typeof persistor
  children: ReactNode
}>

const ReduxProvider = ({ children }: { children: ReactNode }) => {
  return (
    <Provider store={store}>
      <Gate loading={null} persistor={persistor}>
        {children}
      </Gate>
    </Provider>
  )
}

export default ReduxProvider

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
