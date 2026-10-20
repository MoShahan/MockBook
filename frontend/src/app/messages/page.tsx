"use client"

import { MailOutlined } from "@mui/icons-material"

import ComingSoonFeature from "@/components/ComingSoonFeature"

const MessagesPage = () => (
  <ComingSoonFeature
    title="Messages"
    summary="Private conversations so you can talk one-to-one without putting everything on a post."
    icon={<MailOutlined />}
    details={[
      "Friends inbox: you can message someone here only after they accept your friend request. Mutual friends land in this inbox.",
      "Other inbox: if you only follow them, or a friend request is still pending, your message does not enter their Friends inbox. It goes to a separate requests inbox they can open or ignore.",
      "Following someone is not enough for the Friends inbox. That inbox is for accepted friends only.",
    ]}
  />
)

export default MessagesPage
