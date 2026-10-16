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
        py: { xs: 2, sm: 2.5 },
        px: 1.5,
        borderRadius: 2,
        border: `1px dashed ${theme.palette.divider}`,
        bgcolor: "action.hover",
      }}
    >
      <Typography
        variant="subtitle1"
        sx={{
          color: theme.palette.neutral.dark,
          fontWeight: 600,
          mb: description ? 0.5 : 0,
        }}
      >
        {title}
      </Typography>
      {description ? (
        <Typography
          variant="body2"
          sx={{ color: theme.palette.neutral.medium, maxWidth: 320, mx: "auto" }}
        >
          {description}
        </Typography>
      ) : null}
    </Box>
  )
}

export default EmptyState
