import { Box, BoxProps } from "@mui/material"

const WidgetWrapper = ({ children, sx, ...props }: BoxProps) => {
  return (
    <Box
      {...props}
      sx={{
        padding: "1.5rem 1.5rem 0.75rem 1.5rem",
        backgroundColor: "background.alt",
        borderRadius: "0.75rem",
        ...((sx as object) || {}),
      }}
    >
      {children}
    </Box>
  )
}

export default WidgetWrapper
