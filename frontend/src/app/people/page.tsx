"use client"

import { Box, Typography } from "@mui/material"

import AddPeopleWidget from "@/components/AddPeopleWidget"
import Navbar from "@/components/Navbar"
import PageShell from "@/components/PageShell"

const PeoplePage = () => {
  return (
    <Box>
      <Navbar />
      <PageShell narrow>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
          Find people
        </Typography>
        <Typography sx={{ color: "text.secondary", mb: 2, lineHeight: 1.5 }}>
          Search for people to follow or send a friend request. Follow someone to see their posts in
          your Following feed.
        </Typography>
        <AddPeopleWidget showTitle={false} mode="infinite" />
      </PageShell>
    </Box>
  )
}

export default PeoplePage
