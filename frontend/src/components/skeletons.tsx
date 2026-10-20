"use client"

import { Box, Skeleton, useTheme } from "@mui/material"

import WidgetWrapper from "./WidgetWrapper"

/** Single feed/post card placeholder. */
export const PostCardSkeleton = () => {
  const theme = useTheme()
  return (
    <WidgetWrapper aria-hidden>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, mb: 1.25 }}>
        <Skeleton variant="circular" width={42} height={42} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Skeleton variant="text" width="42%" height={22} />
          <Skeleton variant="text" width="28%" height={16} />
        </Box>
      </Box>
      <Skeleton variant="text" width="92%" height={18} />
      <Skeleton variant="text" width="78%" height={18} sx={{ mb: 1.25 }} />
      <Skeleton
        variant="rounded"
        height={160}
        sx={{ borderRadius: `${Number(theme.shape.borderRadius) * 1.1}px`, mb: 1.25 }}
      />
      <Box sx={{ display: "flex", gap: 2 }}>
        <Skeleton variant="rounded" width={72} height={28} />
        <Skeleton variant="rounded" width={88} height={28} />
        <Skeleton variant="rounded" width={64} height={28} />
      </Box>
    </WidgetWrapper>
  )
}

type CountProps = { count?: number }

/** Stack of post-card skeletons for the feed / profile posts column. */
export const PostsFeedSkeleton = ({ count = 3 }: CountProps) => (
  <Box
    sx={{ display: "flex", flexDirection: "column", gap: "1rem" }}
    role="status"
    aria-live="polite"
    aria-label="Loading posts"
  >
    {Array.from({ length: count }, (_, i) => (
      <PostCardSkeleton key={i} />
    ))}
  </Box>
)

/** One people-list row (avatar + name + action). */
export const PeopleRowSkeleton = () => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 1.25,
      width: "100%",
      py: 0.75,
      px: 0.5,
    }}
    aria-hidden
  >
    <Skeleton variant="circular" width={40} height={40} sx={{ flexShrink: 0 }} />
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Skeleton variant="text" width="55%" height={20} />
      <Skeleton variant="text" width="35%" height={16} />
    </Box>
    <Skeleton variant="rounded" width={64} height={28} sx={{ flexShrink: 0, borderRadius: 2 }} />
  </Box>
)

/** Stack of people-row skeletons for modals / likers / friend requests. */
export const PeopleListSkeleton = ({ count = 6 }: CountProps) => (
  <Box
    sx={{ display: "flex", flexDirection: "column", gap: 0.25 }}
    role="status"
    aria-live="polite"
    aria-label="Loading people"
  >
    {Array.from({ length: count }, (_, i) => (
      <PeopleRowSkeleton key={i} />
    ))}
  </Box>
)

/** Profile sidebar card: cover, avatar, name, stats, meta. */
export const ProfileWidgetSkeleton = () => {
  const theme = useTheme()
  const coverRadius = `${Number(theme.shape.borderRadius) * 1.25}px`

  return (
    <WidgetWrapper sx={{ p: 0, overflow: "hidden" }} role="status" aria-label="Loading profile">
      <Skeleton
        variant="rectangular"
        sx={{
          height: { xs: 96, sm: 112 },
          borderTopLeftRadius: coverRadius,
          borderTopRightRadius: coverRadius,
        }}
      />
      <Box sx={{ px: "1.15rem", pb: "1.15rem", pt: 0 }}>
        <Box sx={{ mt: "-2.35rem", mb: 1 }}>
          <Skeleton
            variant="circular"
            width={64}
            height={64}
            sx={{
              border: theme => `3px solid ${theme.palette.background.paper}`,
            }}
          />
        </Box>
        <Skeleton variant="text" width="58%" height={28} sx={{ mb: 0.5 }} />
        <Box sx={{ display: "flex", gap: 1.5, mb: 1.5 }}>
          <Skeleton variant="text" width={72} height={18} />
          <Skeleton variant="text" width={80} height={18} />
          <Skeleton variant="text" width={76} height={18} />
        </Box>
        <Skeleton variant="text" width="70%" height={18} sx={{ mb: 0.5 }} />
        <Skeleton variant="text" width="55%" height={18} sx={{ mb: 1.5 }} />
        <Skeleton variant="text" width="40%" height={18} />
      </Box>
    </WidgetWrapper>
  )
}

/** Full profile page shell while auth user id is still hydrating. */
export const ProfilePageSkeleton = ({ wide }: { wide?: boolean }) => (
  <Box
    sx={{
      gap: { xs: "1.15rem", md: "1.5rem" },
      width: "100%",
      display: wide ? "flex" : "block",
      alignItems: "flex-start",
    }}
    role="status"
    aria-label="Loading profile page"
  >
    <Box
      sx={{
        flex: wide ? "0 0 320px" : undefined,
        width: wide ? 320 : "100%",
        maxWidth: "100%",
        minWidth: 0,
      }}
    >
      <ProfileWidgetSkeleton />
    </Box>
    <Box
      sx={{
        flex: wide ? "1 1 auto" : undefined,
        minWidth: 0,
        width: "100%",
        mt: wide ? undefined : "1.25rem",
      }}
    >
      <PostsFeedSkeleton count={2} />
    </Box>
  </Box>
)
