"use client"

import { EventOutlined } from "@mui/icons-material"

import ComingSoonFeature from "@/components/ComingSoonFeature"

const EventsPage = () => (
  <ComingSoonFeature
    title="Events"
    summary="Host or join time-bound hangouts - meetups, birthdays, or anything with a date."
    icon={<EventOutlined />}
    details={[
      "Create an event with a title, time, and who can see it.",
      "People can mark going or interested, and find it again on this page.",
      "Events are not Groups. A group is an ongoing community; an event is a single occasion.",
    ]}
  />
)

export default EventsPage
