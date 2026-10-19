"use client"

import { useState } from "react"
import {
  Alert,
  Box,
  CircularProgress,
  FormControlLabel,
  Switch,
  Typography,
  useTheme,
} from "@mui/material"

import { useAppSelector } from "@/app/hooks"
import AppShell from "@/components/AppShell"
import EmptyState from "@/components/EmptyState"
import { api } from "@/lib/api"
import { getErrorMessage } from "@/lib/errors"
import { FEATURE_CATALOG_GROUPS, type FeatureFlagKey } from "@/lib/featureCatalog"
import type { FeaturesMap } from "@/lib/features"
import { useFeatureFlags } from "@/providers/FeatureFlagsProvider"
import { useToast } from "@/providers/ToastProvider"

const SettingsPage = () => {
  const theme = useTheme()
  const user = useAppSelector(state => state.user)
  const isAdmin = user?.role === "admin"
  const { features, loading, setFeaturesLocal, refresh } = useFeatureFlags()
  const { success, error: toastError } = useToast()
  const [busyKey, setBusyKey] = useState<FeatureFlagKey | null>(null)

  const handleToggle = async (key: FeatureFlagKey, next: boolean) => {
    const prev = features
    const optimistic = { ...features, [key]: next }
    setFeaturesLocal(optimistic)
    setBusyKey(key)
    try {
      const { data } = await api.patch<{ features: FeaturesMap }>("/settings/features", {
        features: { [key]: next },
      })
      setFeaturesLocal(data.features)
      success(next ? "Feature enabled for users" : "Feature disabled for users")
    } catch (err: unknown) {
      setFeaturesLocal(prev)
      toastError(getErrorMessage(err, "Could not update feature"))
      void refresh()
    } finally {
      setBusyKey(null)
    }
  }

  return (
    <AppShell narrow>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
        Settings
      </Typography>

      {!isAdmin ? (
        <>
          <Typography sx={{ color: "text.secondary", mb: 2, lineHeight: 1.5 }}>
            Personal settings for your account.
          </Typography>
          <EmptyState
            title="Coming soon"
            description="Personal settings are not available yet. Preferences like privacy and notification options will land in a later update."
          />
        </>
      ) : (
        <>
          <Typography sx={{ color: "text.secondary", mb: 2, lineHeight: 1.5 }}>
            Site settings / Features — toggles apply to users with role <strong>user</strong> only.
            Admins always keep full capability. Changes save immediately.
          </Typography>
          <Alert severity="info" sx={{ mb: 2.5 }}>
            Turning a feature off hides related controls for regular users and rejects those API
            writes with 403. The feed and existing content stay readable unless you also disable
            comments or likes.
          </Alert>

          {loading && !Object.values(features).some(v => v === false) ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }} role="status">
              <CircularProgress size={32} />
            </Box>
          ) : null}

          {FEATURE_CATALOG_GROUPS.map(group => (
            <Box
              key={group.id}
              sx={{
                mb: 2.5,
                p: 2,
                borderRadius: 2,
                border: `1px solid ${theme.palette.divider}`,
                bgcolor: "background.alt",
              }}
            >
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 700, mb: 1.25, color: theme.palette.neutral.dark }}
              >
                {group.title}
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                {group.items.map(item => {
                  const checked = features[item.key] !== false
                  return (
                    <Box
                      key={item.key}
                      sx={{
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        gap: 2,
                        py: 0.75,
                        borderBottom: `1px solid ${theme.palette.divider}`,
                        "&:last-child": { borderBottom: 0 },
                      }}
                    >
                      <Box sx={{ minWidth: 0, pr: 1 }}>
                        <Typography sx={{ fontWeight: 600, fontSize: "0.925rem" }}>
                          {item.label}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: "text.secondary", mt: 0.25, lineHeight: 1.45 }}
                        >
                          {item.description}
                        </Typography>
                      </Box>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={checked}
                            disabled={busyKey === item.key}
                            size="small"
                            onChange={(_, value) => void handleToggle(item.key, value)}
                          />
                        }
                        label=""
                        aria-label={`${item.label} (${checked ? "enabled" : "disabled"} for users)`}
                        sx={{ m: 0, flexShrink: 0 }}
                      />
                    </Box>
                  )
                })}
              </Box>
            </Box>
          ))}
        </>
      )}
    </AppShell>
  )
}

export default SettingsPage
