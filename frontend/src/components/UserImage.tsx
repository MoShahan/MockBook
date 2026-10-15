import { Box } from "@mui/material"

import { mediaUrl } from "@/lib/api"

type UserImageProps = { image: string; size?: string }

const UserImage = ({ image, size = "60px" }: UserImageProps) => {
  const src = mediaUrl(image)

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
        bgcolor: "neutral.light",
      }}
    >
      {src ? (
        <Box
          component="img"
          src={src}
          alt="User avatar"
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
      ) : null}
    </Box>
  )
}

export default UserImage
