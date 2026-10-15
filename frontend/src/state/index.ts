import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

import type { AuthState, Friend, Post, User } from "@/types/models"

const initialState: AuthState = {
  mode: "dark",
  user: null,
  posts: [],
  accessToken: null,
}

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    toggleMode: state => {
      state.mode = state.mode === "light" ? "dark" : "light"
    },
    setLogin: (state, action: PayloadAction<{ user: User; accessToken: string }>) => {
      state.user = action.payload.user
      state.accessToken = action.payload.accessToken
    },
    setLogout: state => {
      state.user = null
      state.accessToken = null
    },
    setFriends: (state, action: PayloadAction<{ friends: Friend[] }>) => {
      if (state.user) {
        state.user.friends = action.payload.friends
      } else {
        console.warn("User does not exist, cannot set Friends")
      }
    },
    setPosts: (state, action: PayloadAction<{ posts: Post[] }>) => {
      state.posts = action.payload.posts
    },
    setPost: (state, action: PayloadAction<{ post: Post }>) => {
      const updated = action.payload.post
      // Match Mongo `_id` (not `id` / postId)
      state.posts = state.posts.map(post =>
        String(post._id) === String(updated._id) ? { ...post, ...updated } : post
      )
    },
  },
})

export const { toggleMode, setFriends, setLogin, setPost, setPosts, setLogout } = authSlice.actions

export default authSlice.reducer
