"use client"

import React, { useState } from "react"
import { ChatBubbleOutlineOutlined, FavoriteBorderOutlined, FavoriteOutlined, ShareOutlined } from "@mui/icons-material"
import { Box, Divider, IconButton, Typography, useTheme } from "@mui/material"

import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { setPost } from "@/state"

import FlexBetween from "./FlexBetween"
import Friend from "./Friend"
import WidgetWrapper from "./WidgetWrapper"

type PostWidgetProps = { post: PostType }

const PostWidget = ({ post }: PostWidgetProps) => {
  const dispatch = useAppDispatch()
  const accessToken = useAppSelector(state => state.accessToken)
  const user = useAppSelector((state: any) => state?.user)
  const isLiked = Boolean(post?.likes[user?._id])
  const likesCount = Object.keys(post?.likes).length

  const theme: any = useTheme()
  const primary = theme.palette.primary.main
  const neutral = theme.palette.neutral.main

  const [isComments, setIsComments] = useState<boolean>(false)

  const patchLike = async () => {
    const response = await fetch(`http://localhost:5000/posts/${post?._id}/like`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId: user?._id }),
    })
    const res = await response.json()
    dispatch(setPost({ post: res.updatedPost }))
  }

  return (
    <WidgetWrapper>
      <Friend
        id={post?.userId}
        name={`${post?.user?.firstName} ${post?.user?.lastName}`}
        subtitle={post?.user?.location || ""}
        url={post?.user?.picturePath || ""}
      />
      <Typography sx={{ color: neutral, mt: "1rem" }}>{post?.description}</Typography>
      {post?.url && (
        <img
          width="100%"
          height="auto"
          alt="post"
          style={{
            borderRadius: "0.75rem",
            marginTop: "0.75rem",
          }}
          src={`http://localhost:5000/assets/${post?.url}`}
        />
      )}
      <FlexBetween sx={{ mt: "0.25rem" }}>
        <FlexBetween sx={{ gap: "1rem" }}>
          <FlexBetween sx={{ gap: "0.3rem" }}>
            <IconButton onClick={patchLike}>
              {isLiked ? <FavoriteOutlined sx={{ color: primary }} /> : <FavoriteBorderOutlined />}
            </IconButton>
            <Typography>{likesCount}</Typography>
          </FlexBetween>

          <FlexBetween sx={{ gap: "0.3rem" }}>
            <IconButton onClick={() => setIsComments(prev => !prev)}>
              <ChatBubbleOutlineOutlined />
            </IconButton>
            <Typography>{post?.comments.length}</Typography>
          </FlexBetween>
        </FlexBetween>
        <IconButton>
          <ShareOutlined />
        </IconButton>
      </FlexBetween>
      {isComments && (
        <Box sx={{ mt: "0.5rem" }}>
          {post?.comments.map((comment, index) => (
            <Box key={`${post?._id} - ${index}`}>
              <Divider />
              <Typography sx={{ color: neutral, m: "0.5rem 0", pl: "1rem" }}>{comment}</Typography>
            </Box>
          ))}
          <Divider />
        </Box>
      )}
    </WidgetWrapper>
  )
}

export default PostWidget
