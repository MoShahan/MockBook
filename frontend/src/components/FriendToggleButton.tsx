"use client"

import { PeopleOutlined, PersonAddOutlined } from "@mui/icons-material"
import { alpha, Button, Tooltip, useTheme } from "@mui/material"

type FriendToggleButtonProps = {
  isFriend: boolean
  onClick: () => void
  /**
   * When true, use a frosted light chip so the control stays readable on dark
   * profile covers (e.g. ink/black banners).
   */
  onCover?: boolean
}

/** Soft brand-tinted chips for add / friends states. */
const FriendToggleButton = ({ isFriend, onClick, onCover = false }: FriendToggleButtonProps) => {
  const theme = useTheme()
  const brand = theme.palette.primary.main
  const dark = theme.palette.neutral.dark

  const coverSx = onCover
    ? {
        color: isFriend ? brand : dark,
        bgcolor: alpha(theme.palette.common.white, theme.palette.mode === "dark" ? 0.92 : 0.94),
        border: `1px solid ${alpha(theme.palette.common.black, 0.08)}`,
        boxShadow: `0 1px 2px ${alpha(theme.palette.common.black, 0.18)}`,
        "&:hover": {
          bgcolor: theme.palette.common.white,
          borderColor: alpha(brand, 0.35),
          color: brand,
          boxShadow: `0 2px 6px ${alpha(theme.palette.common.black, 0.2)}`,
        },
      }
    : {
        color: isFriend ? brand : dark,
        bgcolor: isFriend ? alpha(brand, theme.palette.mode === "dark" ? 0.16 : 0.1) : "transparent",
        border: `1px solid ${isFriend ? alpha(brand, 0.35) : theme.palette.divider}`,
        "&:hover": {
          bgcolor: isFriend
            ? alpha(brand, theme.palette.mode === "dark" ? 0.22 : 0.14)
            : alpha(brand, theme.palette.mode === "dark" ? 0.1 : 0.06),
          borderColor: alpha(brand, 0.45),
          color: brand,
        },
      }

  return (
    <Tooltip title={isFriend ? "Remove friend" : "Add friend"}>
      <Button
        onClick={onClick}
        aria-label={isFriend ? "Remove friend" : "Add friend"}
        size="small"
        startIcon={
          isFriend ? (
            <PeopleOutlined sx={{ fontSize: "1rem !important" }} />
          ) : (
            <PersonAddOutlined sx={{ fontSize: "1rem !important" }} />
          )
        }
        sx={{
          flexShrink: 0,
          textTransform: "none",
          fontWeight: 600,
          fontSize: "0.75rem",
          lineHeight: 1.2,
          minHeight: 28,
          px: 1.1,
          py: 0.35,
          borderRadius: 2,
          transition: "background-color 0.15s ease, border-color 0.15s ease, transform 0.12s ease, box-shadow 0.15s ease",
          "&:active": {
            transform: "scale(0.96)",
          },
          ...coverSx,
        }}
      >
        {isFriend ? "Friends" : "Add"}
      </Button>
    </Tooltip>
  )
}

export default FriendToggleButton
