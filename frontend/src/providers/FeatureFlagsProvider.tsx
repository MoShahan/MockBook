"use client"

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"

import { useAppSelector } from "@/app/hooks"
import { api } from "@/lib/api"
import type { FeatureFlagKey } from "@/lib/featureCatalog"
import {
  canUseFeature,
  DEFAULT_FEATURES,
  type FeaturesMap,
  mergeFeatures,
} from "@/lib/features"

type FeaturesResponse = {
  features: FeaturesMap
  updatedAt?: string | null
  updatedBy?: string | null
}

type FeatureFlagsContextValue = {
  features: FeaturesMap
  loading: boolean
  /** Effective flag for the current user (admins always true). */
  enabled: (key: FeatureFlagKey) => boolean
  refresh: () => Promise<void>
  /** Optimistic local update after admin PATCH. */
  setFeaturesLocal: (next: FeaturesMap) => void
}

const FeatureFlagsContext = createContext<FeatureFlagsContextValue | null>(null)

export function useFeatureFlags(): FeatureFlagsContextValue {
  const ctx = useContext(FeatureFlagsContext)
  if (!ctx) {
    throw new Error("useFeatureFlags must be used within FeatureFlagsProvider")
  }
  return ctx
}

/** Soft hook for optional use outside provider (defaults). */
export function useFeatureEnabled(key: FeatureFlagKey): boolean {
  const ctx = useContext(FeatureFlagsContext)
  const role = useAppSelector(s => s.user?.role)
  if (!ctx) return canUseFeature(role, DEFAULT_FEATURES, key)
  return ctx.enabled(key)
}

const FeatureFlagsProvider = ({ children }: { children: ReactNode }) => {
  const accessToken = useAppSelector(s => s.accessToken)
  const role = useAppSelector(s => s.user?.role)
  const [features, setFeatures] = useState<FeaturesMap>(DEFAULT_FEATURES)
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(async () => {
    if (!accessToken) {
      setFeatures(DEFAULT_FEATURES)
      return
    }
    try {
      setLoading(true)
      const { data } = await api.get<FeaturesResponse>("/settings/features")
      setFeatures(mergeFeatures(data.features))
    } catch {
      setFeatures(DEFAULT_FEATURES)
    } finally {
      setLoading(false)
    }
  }, [accessToken])

  useEffect(() => {
    const t = window.setTimeout(() => void refresh(), 0)
    return () => window.clearTimeout(t)
  }, [refresh])

  const enabled = useCallback(
    (key: FeatureFlagKey) => canUseFeature(role, features, key),
    [role, features]
  )

  const setFeaturesLocal = useCallback((next: FeaturesMap) => {
    setFeatures(mergeFeatures(next))
  }, [])

  const value = useMemo(
    () => ({ features, loading, enabled, refresh, setFeaturesLocal }),
    [features, loading, enabled, refresh, setFeaturesLocal]
  )

  return <FeatureFlagsContext.Provider value={value}>{children}</FeatureFlagsContext.Provider>
}

export default FeatureFlagsProvider
