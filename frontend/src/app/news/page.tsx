"use client"

import { NewspaperOutlined } from "@mui/icons-material"

import ComingSoonFeature from "@/components/ComingSoonFeature"

const NewsPage = () => (
  <ComingSoonFeature
    title="News"
    summary="A place for latest headlines and stories, separate from the social feed."
    icon={<NewspaperOutlined />}
    details={[
      "Read recent news without mixing it into Home posts from people you know.",
      "Sources and topics are not chosen yet - this tab is reserved for that later.",
    ]}
  />
)

export default NewsPage
