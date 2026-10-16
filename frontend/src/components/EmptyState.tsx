"use client"

import { Box, Typography, useTheme } from "@mui/material"

type EmptyStateProps = {
  title: string
  description?: string
}

/** Designed empty / quiet state for feeds and lists. */
const EmptyState = ({ title, description }: EmptyStateProps) => {
  const theme = useTheme()

  return (
    <Box
      role="status"
      sx={{
        textAlign: "center",
        py: { xs: 3, sm: 4 },
        px: 2,
        borderRadius: 2,
        border: `1px dashed ${theme.palette.divider}`,
        bgcolor:
          theme.palette.mode === "dark"
            ? "rgba(255,255,255,0.02)"
            : "rgba(28, 25, 23, 0.02)",
      }}
    >
      <Typography
        variant="h6"
        sx={{
          color: theme.palette.neutral.dark,
          fontWeight: 600,
          mb: description ? 0.75 : 0,
        }}
      >
        {title}
      </Typography>
      {description ? (
        <Typography sx={{ color: theme.palette.neutral.medium, maxWidth: 360, mx: "auto" }}>
          {description}
        </Typography>
      ) : null}
    </Box>
  )
}

export default EmptyState
