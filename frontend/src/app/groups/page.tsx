"use client"

import { GroupsOutlined } from "@mui/icons-material"

import ComingSoonFeature from "@/components/ComingSoonFeature"

const GroupsPage = () => (
  <ComingSoonFeature
    title="Groups"
    summary="Create or join communities with their own feed, separate from your personal friends list."
    icon={<GroupsOutlined />}
    details={[
      "Start a group around a topic, club, or place, and let people join.",
      "Each group will have its own posts, so conversation stays in that community.",
      "This is different from Events: groups are ongoing. Events are for a date and time.",
    ]}
  />
)

export default GroupsPage
