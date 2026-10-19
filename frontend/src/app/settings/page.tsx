"use client"

import {
  Alert,
  Box,
  FormControlLabel,
  Switch,
  Typography,
  useTheme,
} from "@mui/material"

import { useAppSelector } from "@/app/hooks"
import AppShell from "@/components/AppShell"
import EmptyState from "@/components/EmptyState"
import { FEATURE_CATALOG_GROUPS } from "@/lib/featureCatalog"

const SettingsPage = () => {
  const theme = useTheme()
  const user = useAppSelector(state => state.user)
  const isAdmin = user?.role === "admin"

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
            Site settings / Features — preview of the admin feature catalog. Saving and API
            enforcement ship with Part 2; toggles below are disabled for now.
          </Typography>
          <Alert severity="info" sx={{ mb: 2.5 }}>
            These switches do not change site behavior yet. Admins will be able to turn features on
            or off for regular users once the settings API is live. Admins always keep full
            capability.
          </Alert>

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
                {group.items.map(item => (
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
                      control={<Switch checked disabled size="small" />}
                      label=""
                      aria-label={`${item.label} (enabled by default; preview only)`}
                      sx={{ m: 0, flexShrink: 0 }}
                    />
                  </Box>
                ))}
              </Box>
            </Box>
          ))}
        </>
      )}
    </AppShell>
  )
}

export default SettingsPage
