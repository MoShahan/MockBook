"use client"

import React, { useState } from "react"
import PersonSearchOutlined from "@mui/icons-material/PersonSearchOutlined"
import {
  Box,
  Button,
  Tab,
  Tabs,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material"
import { useRouter } from "next/navigation"

import AddPeopleWidget from "@/components/AddPeopleWidget"
import Navbar from "@/components/Navbar"
import PageShell from "@/components/PageShell"
import PostsWidget, { type PostsListKind } from "@/components/PostsWidget"
import { segmentedTabsSx } from "@/components/segmentedTabsSx"

import { useAppSelector } from "../hooks"

import MyPostWidget from "./MyPostWidget"

type HomeTab = "friends" | "everyone"

const HomePage = () => {
  const user = useAppSelector(state => state.user)
  const theme = useTheme()
  const router = useRouter()
  const isWide = useMediaQuery("(min-width:1000px)")
  const [tab, setTab] = useState<HomeTab>("everyone")

  const listKind: PostsListKind = tab === "friends" ? "friends" : "feed"

  return (
    <Box>
      <Navbar />
      <PageShell>
        <Box
          sx={{
            display: isWide ? "flex" : "block",
            gap: { xs: "1.15rem", md: "1.5rem" },
            alignItems: "flex-start",
            width: "100%",
          }}
        >
          <Box sx={{ flex: isWide ? "1 1 auto" : undefined, minWidth: 0, width: "100%" }}>
            <MyPostWidget url={user?.picturePath ?? ""} />
            {!isWide ? (
              <Button
                fullWidth
                variant="outlined"
                startIcon={<PersonSearchOutlined />}
                onClick={() => router.push("/people")}
                sx={{
                  mt: "1rem",
                  mb: "0.25rem",
                  textTransform: "none",
                  fontWeight: 600,
                  justifyContent: "flex-start",
                  borderColor: theme.palette.divider,
                  color: theme.palette.neutral.dark,
                  "&:hover": {
                    borderColor: theme.palette.primary.main,
                    bgcolor: "action.hover",
                  },
                }}
              >
                Find people
              </Button>
            ) : null}
            <Box sx={{ mt: "1.15rem", mb: "0.35rem" }}>
              <Typography
                variant="caption"
                sx={{
                  display: "block",
                  mb: 0.75,
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  color: theme.palette.neutral.medium,
                }}
              >
                Feed
              </Typography>
              <Tabs
                value={tab}
                onChange={(_, value: HomeTab) => setTab(value)}
                aria-label="Home feed"
                sx={segmentedTabsSx}
              >
                <Tab value="everyone" label="Everyone" disableRipple />
                <Tab value="friends" label="Following" disableRipple />
              </Tabs>
            </Box>
            <PostsWidget key={listKind} list={listKind} userId={user?._id ?? ""} />
          </Box>
          {isWide ? (
            <Box
              sx={{
                flex: "0 0 300px",
                width: 300,
                maxWidth: "100%",
                position: "sticky",
                top: "5.5rem",
              }}
            >
              <AddPeopleWidget />
              <Button
                fullWidth
                size="small"
                onClick={() => router.push("/people")}
                sx={{
                  mt: 1,
                  textTransform: "none",
                  fontWeight: 600,
                  color: "text.secondary",
                }}
              >
                Open full page
              </Button>
            </Box>
          ) : null}
        </Box>
      </PageShell>
    </Box>
  )
}

export default HomePage
