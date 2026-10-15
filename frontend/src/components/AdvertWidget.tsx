"use client"

import React from "react"
import { Typography, useTheme } from "@mui/material"

import FlexBetween from "./FlexBetween"
import WidgetWrapper from "./WidgetWrapper"

const AdvertWidget = () => {
  const theme = useTheme()
  const dark = theme.palette.neutral.dark
  const main = theme.palette.neutral.main
  const medium = theme.palette.neutral.medium

  return (
    <WidgetWrapper>
      <FlexBetween>
        <Typography variant="h5" sx={{ color: dark, fontWeight: "500" }}>
          Sponsored
        </Typography>
        <Typography sx={{ color: medium }}>Create Ad</Typography>
      </FlexBetween>
      <FlexBetween sx={{ mt: "0.75rem" }}>
        <Typography sx={{ color: main }}>DC Comics</Typography>
        <Typography sx={{ color: medium }}>www.dccomics.com</Typography>
      </FlexBetween>
      <Typography sx={{ color: medium, m: "0.5rem 0" }}>The best comicbook universe out there</Typography>
    </WidgetWrapper>
  )
}

export default AdvertWidget
