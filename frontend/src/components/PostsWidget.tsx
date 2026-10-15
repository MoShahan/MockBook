"use client"

import React, { useEffect } from "react"

import { api, authHeaders } from "@/lib/api"
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
    const { data } = await api.get(`/posts${isProfile ? `/${userId}/posts` : ""}`, {
      headers: authHeaders(accessToken),
    })
    dispatch(setPosts({ posts: data }))
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
