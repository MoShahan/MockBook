"use client"

import { useState } from "react"
import { Box, Typography } from "@mui/material"

import { mediaUrl } from "@/lib/api"

type UserImageProps = {
  image: string
  /** Full name or "First Last" — used for initials when there is no photo. */
  name?: string
  size?: string
}

export function getInitials(name?: string): string {
  if (!name?.trim()) return "?"
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase()
  }
  const first = parts[0][0] ?? ""
  const last = parts[parts.length - 1][0] ?? ""
  return `${first}${last}`.toUpperCase()
}

const UserImage = ({ image, name, size = "60px" }: UserImageProps) => {
  const src = mediaUrl(image)
  const [imgFailed, setImgFailed] = useState(false)
  const showImage = Boolean(src) && !imgFailed
  const initials = getInitials(name)

  const fontSize = `calc(${size} * 0.36)`

  return (
    <Box
      sx={{
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
        flexShrink: 0,
        borderRadius: "50%",
        overflow: "hidden",
        bgcolor: "primary.main",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      aria-label={name ? `${name} avatar` : "User avatar"}
    >
      {showImage ? (
        <Box
          component="img"
          src={src}
          alt={name ? `${name} avatar` : "User avatar"}
          onError={() => setImgFailed(true)}
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
      ) : (
        <Typography
          component="span"
          sx={{
            color: "primary.contrastText",
            fontWeight: 700,
            fontSize,
            lineHeight: 1,
            userSelect: "none",
          }}
        >
          {initials}
        </Typography>
      )}
    </Box>
  )
}

export default UserImage
