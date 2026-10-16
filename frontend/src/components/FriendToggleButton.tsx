"use client"

import { PersonAddOutlined, PersonRemoveOutlined } from "@mui/icons-material"
import { IconButton, Tooltip, useTheme } from "@mui/material"

type FriendToggleButtonProps = {
  isFriend: boolean
  onClick: () => void
}

/** Add = green, remove = red so the two states are easy to tell apart. */
const FriendToggleButton = ({ isFriend, onClick }: FriendToggleButtonProps) => {
  const theme = useTheme()
  const addBg = theme.palette.success.main
  const removeBg = theme.palette.error.main
  const contrast = theme.palette.getContrastText(isFriend ? removeBg : addBg)

  return (
    <Tooltip title={isFriend ? "Remove friend" : "Add friend"}>
      <IconButton
        onClick={onClick}
        aria-label={isFriend ? "Remove friend" : "Add friend"}
        size="small"
        sx={{
          p: "0.35rem",
          flexShrink: 0,
          color: contrast,
          backgroundColor: isFriend ? removeBg : addBg,
          transition: "background-color 0.15s ease, transform 0.12s ease",
          "&:hover": {
            backgroundColor: isFriend ? theme.palette.error.dark : theme.palette.success.dark,
            color: contrast,
          },
          "&:active": {
            transform: "scale(0.92)",
          },
        }}
      >
        {isFriend ? (
          <PersonRemoveOutlined sx={{ fontSize: "1.05rem" }} />
        ) : (
          <PersonAddOutlined sx={{ fontSize: "1.05rem" }} />
        )}
      </IconButton>
    </Tooltip>
  )
}

export default FriendToggleButton
