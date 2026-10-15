"use client"

import React, { useEffect, useState } from "react"
import { EditOutlined, LocationOnOutlined, ManageAccountsOutlined, WorkOutlineOutlined } from "@mui/icons-material"
import { Box, Divider, Typography, useTheme } from "@mui/material"
import { useRouter } from "next/navigation"

import { useAppSelector } from "@/app/hooks"

import FlexBetween from "./FlexBetween"
import UserImage from "./UserImage"
import WidgetWrapper from "./WidgetWrapper"

type UserWidgetProps = { userId: string; url: string }

const UserWidget = ({ userId, url }: UserWidgetProps) => {
  const router = useRouter()
  const { palette }: any = useTheme()
  const dark = palette.neutral.dark
  const medium = palette.neutral.medium
  const main = palette.neutral.main
  const accessToken = useAppSelector(state => state.accessToken)

  const [user, setUser] = useState<UserType>(null)

  const getUser = async () => {
    const response = await fetch(`http://localhost:5000/users/${userId}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    const res = await response.json()
    setUser(res)
  }

  useEffect(() => {
    getUser()
  }, [])

  const handleGoToProfile = () => {
    router.push("/profile")
  }

  if (!user) {
    return null
  }

  return (
    <WidgetWrapper>
      <FlexBetween onClick={handleGoToProfile} sx={{ gap: "0.5rem", pb: "1.1rem" }}>
        <FlexBetween sx={{ gap: "1rem" }}>
          <UserImage image={url}></UserImage>
          <Box>
            <Typography
              variant="h4"
              sx={{
                color: dark,
                fontWeight: "500",
                "&:hover": {
                  cursor: "pointer",
                  color: palette.primary.light,
                },
              }}
            >
              {user?.firstName} {user?.lastName}
            </Typography>
            <Typography sx={{ color: medium }}>{user?.friends?.length || 0} friends</Typography>
          </Box>
        </FlexBetween>
        <ManageAccountsOutlined />
      </FlexBetween>

      <Divider />

      <Box sx={{ p: "1rem 0" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: "1rem", mb: "0.5rem" }}>
          <LocationOnOutlined sx={{ fontSize: "large", color: main }} />
          <Typography sx={{ color: medium }}>{user?.location}</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <WorkOutlineOutlined sx={{ fontSize: "large", color: main }} />
          <Typography sx={{ color: medium }}>{user?.occupation}</Typography>
        </Box>
      </Box>

      <Divider />

      <Box sx={{ p: "1rem 0" }}>
        <FlexBetween sx={{ mb: "0.5rem" }}>
          <Typography sx={{ color: medium }}>Number of profile visits</Typography>
          <Typography sx={{ color: main, fontWeight: "500" }}>{user?.viewedProfile || 0}</Typography>
        </FlexBetween>
        <FlexBetween>
          <Typography sx={{ color: medium }}>Impressions</Typography>
          <Typography sx={{ color: main, fontWeight: "500" }}>{user?.impressions || 0}</Typography>
        </FlexBetween>
      </Box>

      <Divider />

      <Box sx={{ p: "1rem 0" }}>
        <Typography sx={{ color: main, mb: "1rem", fontSize: "1rem", fontWeight: "500" }}>Social Profiles</Typography>
        <FlexBetween sx={{ gap: "1rem", mb: "0.5rem" }}>
          <FlexBetween sx={{ gap: "1rem" }}>
            <img src="../assets/twitter.png" alt="twitter" />
            <Box>
              <Typography sx={{ color: main, fontWeight: "500" }}>Twitter</Typography>
              <Typography sx={{ color: medium, fontWeight: "500" }}>Social Network</Typography>
            </Box>
          </FlexBetween>
          <EditOutlined sx={{ color: main }} />
        </FlexBetween>
        <FlexBetween sx={{ gap: "1rem" }}>
          <FlexBetween sx={{ gap: "1rem" }}>
            <img src="../assets/linkedin.png" alt="linkedin" />
            <Box>
              <Typography sx={{ color: main, fontWeight: "500" }}>Likedin</Typography>
              <Typography sx={{ color: medium, fontWeight: "500" }}>Network Platform</Typography>
            </Box>
          </FlexBetween>
          <EditOutlined sx={{ color: main }} />
        </FlexBetween>
      </Box>
    </WidgetWrapper>
  )
}

export default UserWidget
