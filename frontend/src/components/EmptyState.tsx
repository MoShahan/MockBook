"use client"

import { Box, Button, Typography, useTheme } from "@mui/material"

type EmptyStateProps = {
  title: string
  description?: string
  /** Optional primary action (e.g. Add people, Go home). */
  actionLabel?: string
  onAction?: () => void
}

/** Designed empty / quiet state for feeds and lists. */
const EmptyState = ({ title, description, actionLabel, onAction }: EmptyStateProps) => {
  const theme = useTheme()
  const showAction = Boolean(actionLabel && onAction)

  return (
    <Box
      role="status"
      sx={{
        textAlign: "center",
        py: { xs: 2.25, sm: 2.75 },
        px: 1.75,
        borderRadius: 2.5,
        border: `1px dashed ${theme.palette.divider}`,
        bgcolor: theme =>
          theme.palette.mode === "dark" ? "action.hover" : "background.default",
      }}
    >
      <Box
        component="img"
        src="/mockbook-mark.png"
        alt=""
        aria-hidden
        sx={{
          width: 40,
          height: 40,
          objectFit: "contain",
          opacity: theme.palette.mode === "dark" ? 0.45 : 0.55,
          mb: 1.25,
          filter: theme.palette.mode === "dark" ? "grayscale(0.2)" : "none",
        }}
      />
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
      {showAction ? (
        <Button
          variant="outlined"
          size="small"
          onClick={onAction}
          sx={{ mt: 1.5, textTransform: "none", fontWeight: 600 }}
        >
          {actionLabel}
        </Button>
      ) : null}
    </Box>
  )
}

export default EmptyState
