"use client"

import { StorefrontOutlined } from "@mui/icons-material"

import ComingSoonFeature from "@/components/ComingSoonFeature"

const MarketplacePage = () => (
  <ComingSoonFeature
    title="Marketplace"
    summary="Buy and sell with other people on Xivi - listings from members, not ads from the site."
    icon={<StorefrontOutlined />}
    details={[
      "Post an item for sale, or browse what others are offering nearby.",
      "This is person-to-person listings. It is not the same as sponsored ads on the feed.",
      "Sponsored placements, if they come later, stay a separate product - not this tab.",
    ]}
  />
)

export default MarketplacePage
