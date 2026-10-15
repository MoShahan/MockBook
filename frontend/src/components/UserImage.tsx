import { Box } from "@mui/material"

import { assetUrl } from "@/lib/api"

type UserImageProps = { image: string; size?: string }

const UserImage = ({ image, size = "60px" }: UserImageProps) => {
  return (
    <Box sx={{ width: size, height: size }}>
      <img
        src={assetUrl(image)}
        alt={`user - ${image}`}
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
