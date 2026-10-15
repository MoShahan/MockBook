import { Box } from "@mui/material"

import { mediaUrl } from "@/lib/api"

type UserImageProps = { image: string; size?: string }

const UserImage = ({ image, size = "60px" }: UserImageProps) => {
  const src = mediaUrl(image)
  if (!src) {
    return <Box sx={{ width: size, height: size, borderRadius: "50%", bgcolor: "neutral.light" }} />
  }

  return (
    <Box sx={{ width: size, height: size }}>
      <img
        src={src}
        alt="User avatar"
        style={{
          objectFit: "cover",
          borderRadius: "50%",
        }}
        width={size}
        height={size}
      />
    </Box>
  )
}

export default UserImage
