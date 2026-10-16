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
        sx={{
          p: "0.5rem",
          flexShrink: 0,
          color: contrast,
          backgroundColor: isFriend ? removeBg : addBg,
          "&:hover": {
            backgroundColor: isFriend ? theme.palette.error.dark : theme.palette.success.dark,
            color: contrast,
          },
        }}
      >
        {isFriend ? <PersonRemoveOutlined /> : <PersonAddOutlined />}
      </IconButton>
    </Tooltip>
  )
}

export default FriendToggleButton
