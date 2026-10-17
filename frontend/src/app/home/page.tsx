"use client"

import React, { useState } from "react"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
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
import { segmentedTabsSx } from "@/components/segmentedTabsSx"

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
            gap: { xs: "1.15rem", md: "1.5rem" },
            alignItems: "flex-start",
            width: "100%",
          }}
        >
          <Box sx={{ flex: isWide ? "1 1 auto" : undefined, minWidth: 0, width: "100%" }}>
            <MyPostWidget url={user?.picturePath ?? ""} />
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
            </Box>
          ) : (
            <Accordion
              disableGutters
              elevation={0}
              sx={{
                mt: "1.25rem",
                width: "100%",
                bgcolor: "transparent",
                "&:before": { display: "none" },
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 2,
                overflow: "hidden",
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon fontSize="small" />}
                aria-controls="add-people-content"
                id="add-people-header"
                sx={{ minHeight: 44, "& .MuiAccordionSummary-content": { my: 0.75 } }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: theme.palette.neutral.dark }}>
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
