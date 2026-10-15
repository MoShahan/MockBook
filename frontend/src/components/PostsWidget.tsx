"use client"

import React, { useEffect } from "react"

import { setPosts } from "@/state"

import { useAppDispatch, useAppSelector } from "../app/hooks"

import PostWidget from "./PostWidget"

type PostsWidgetProps = {
  isProfile: boolean
  userId: string
}

const PostsWidget = ({ isProfile = false, userId }: PostsWidgetProps) => {
  const dispatch = useAppDispatch()
  const posts = useAppSelector((state: any) => state.posts)
  const accessToken = useAppSelector(state => state?.accessToken)

  const getPosts = async () => {
    const response = await fetch(`http://localhost:5000/posts${isProfile ? `/${userId}/posts` : ""}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    const res = await response.json()
    dispatch(setPosts({ posts: res }))
  }

  useEffect(() => {
    getPosts()
  }, [])

  return (
    <>
      {posts.map((post: PostType) => (
        <PostWidget key={post?._id} post={post}></PostWidget>
      ))}
    </>
  )
}

export default PostsWidget
