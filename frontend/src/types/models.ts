/** Friend list item as returned by the API (formatted objects, not raw ids). */
export type Friend = {
  _id: string
  firstName: string
  lastName: string
  occupation?: string
  location?: string
  picturePath?: string
  /** @deprecated Prefer `_id`; kept for older persisted Redux state. */
  id?: string
  /** @deprecated Prefer `picturePath`. */
  url?: string
}

export type User = {
  _id: string
  firstName: string
  lastName: string
  email?: string
  picturePath: string
  friends: Friend[]
  location?: string
  occupation?: string
  viewedProfile?: number
  impressions?: number
}

/** Post likes are a Map on the server, serialized as an object keyed by user id. */
export type PostLikes = Record<string, boolean>

export type PostComment = {
  _id?: string
  userId: string
  text: string
  createdAt?: string
  /** Comment likes keyed by user id (same shape as post likes). */
  likes?: PostLikes
  user?: Pick<User, "firstName" | "lastName" | "picturePath"> | null
}

export type Post = {
  _id: string
  userId: string
  description: string
  url?: string
  likes: PostLikes
  comments: PostComment[]
  createdAt?: string
  updatedAt?: string
  user?: Pick<User, "firstName" | "lastName" | "location" | "picturePath"> | null
}

export type AuthState = {
  mode: "light" | "dark"
  user: User | null
  posts: Post[]
  accessToken: string | null
  refreshToken: string | null
}

export type LoginFormValues = {
  email: string
  password: string
}

export type RegisterFormValues = {
  firstName: string
  lastName: string
  email: string
  password: string
  cPassword: string
}

export type CreatePostFormValues = {
  description: string
  picture: File | null
}

export type ApiErrorBody = {
  msg?: string
  error?: string
}

/** Resolve a friend entry id whether it is a formatted object or a legacy string id. */
export function friendIdOf(friend: Friend | string | null | undefined): string {
  if (friend == null) return ""
  if (typeof friend === "string") return friend
  return String(friend._id ?? friend.id ?? "")
}

/** Compare Mongo user ids safely (string / ObjectId / undefined). */
export function sameUserId(a: string | null | undefined, b: string | null | undefined): boolean {
  if (a == null || b == null || a === "" || b === "") return false
  return String(a) === String(b)
}
