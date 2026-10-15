import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

import type { AuthState, Friend, Post, User } from "@/types/models"

const initialState: AuthState = {
  mode: "dark",
  user: null,
  posts: [],
  accessToken: null,
  refreshToken: null,
}

/** Never persist a password if a buggy API response included one. */
function sanitizeUser(user: User): User {
  const { ...safe } = user as User & { password?: unknown }
  delete (safe as { password?: unknown }).password
  return safe
}

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    toggleMode: state => {
      state.mode = state.mode === "light" ? "dark" : "light"
    },
    setLogin: (
      state,
      action: PayloadAction<{ user: User; accessToken: string; refreshToken: string }>
    ) => {
      state.user = sanitizeUser(action.payload.user)
      state.accessToken = action.payload.accessToken
      state.refreshToken = action.payload.refreshToken
    },
    setTokens: (state, action: PayloadAction<{ accessToken: string; refreshToken: string }>) => {
      state.accessToken = action.payload.accessToken
      state.refreshToken = action.payload.refreshToken
    },
    setLogout: state => {
      state.user = null
      state.accessToken = null
      state.refreshToken = null
      state.posts = []
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
      const id = String(updated._id)
      const idx = state.posts.findIndex(post => String(post._id) === id)
      if (idx >= 0) {
        state.posts[idx] = { ...state.posts[idx], ...updated }
      } else {
        // Upsert so single-post page likes/comments work when the feed is empty.
        state.posts.push(updated)
      }
    },
    removePost: (state, action: PayloadAction<{ postId: string }>) => {
      const id = String(action.payload.postId)
      state.posts = state.posts.filter(post => String(post._id) !== id)
    },
  },
})

export const {
  toggleMode,
  setFriends,
  setLogin,
  setTokens,
  setPost,
  setPosts,
  removePost,
  setLogout,
} = authSlice.actions

export default authSlice.reducer
