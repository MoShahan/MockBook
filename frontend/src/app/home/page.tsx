"use client"

import React, { useState } from "react"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Divider,
  Tab,
  Tabs,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material"

import AddPeopleWidget from "@/components/AddPeopleWidget"
import Navbar from "@/components/Navbar"
import PageShell from "@/components/PageShell"
import PostsWidget, { type PostsListKind } from "@/components/PostsWidget"

import { useAppSelector } from "../hooks"

import MyPostWidget from "./MyPostWidget"

type HomeTab = "friends" | "everyone"

const HomePage = () => {
  const user = useAppSelector(state => state.user)
  const theme = useTheme()
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
            gap: { xs: "1.5rem", md: "2rem" },
            alignItems: "flex-start",
            width: "100%",
          }}
        >
          <Box sx={{ flex: isWide ? "1 1 auto" : undefined, minWidth: 0, width: "100%" }}>
            <MyPostWidget url={user?.picturePath ?? ""} />
            <Divider sx={{ margin: "1.25rem 0 1rem" }} />
            <Tabs
              value={tab}
              onChange={(_, value: HomeTab) => setTab(value)}
              aria-label="Home feed"
              sx={{ mb: "1.25rem", borderBottom: 1, borderColor: "divider" }}
            >
              <Tab value="everyone" label="Everyone" />
              <Tab value="friends" label="Friends" />
            </Tabs>
            <PostsWidget key={listKind} list={listKind} userId={user?._id ?? ""} />
          </Box>
          {isWide ? (
            <Box
              sx={{
                flex: "0 0 360px",
                width: 360,
                maxWidth: "100%",
                position: "sticky",
                top: "5.5rem",
              }}
            >
              <AddPeopleWidget />
            </Box>
          ) : (
            <Accordion
              disableGutters
              elevation={0}
              sx={{
                mt: "1.75rem",
                width: "100%",
                bgcolor: "transparent",
                "&:before": { display: "none" },
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 2,
                overflow: "hidden",
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="add-people-content"
                id="add-people-header"
              >
                <Typography sx={{ fontWeight: 600, color: theme.palette.neutral.dark }}>
                  Find people
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 0, px: 0, pb: 0 }}>
                <AddPeopleWidget embedded />
              </AccordionDetails>
            </Accordion>
          )}
        </Box>
      </PageShell>
    </Box>
  )
}

export default HomePage
