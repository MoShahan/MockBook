"use client"

import React, { ReactNode } from "react"
import { Provider } from "react-redux"
import { PersistGate } from "redux-persist/integration/react"

import { persistor, store } from "@/state/store"

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

export type { AppDispatch, RootState } from "@/state/store"
