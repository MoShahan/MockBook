import { Box, BoxProps } from "@mui/material"

const FlexBetween = ({ children, sx, ...props }: BoxProps) => {
  return (
    <Box
      {...props}
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        ...((sx as object) || {}),
      }}
    >
      {children}
    </Box>
  )
}

export default FlexBetween
