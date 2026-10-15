/** Friend list item as returned/formatted by the API / UI. */
export type Friend = {
  /** Some API responses use `_id`; older UI code expects `id`. */
  id?: string
  _id?: string
  firstName: string
  lastName: string
  occupation?: string
  location?: string
  /** Avatar path or full asset URL field from API (`url` or `picturePath`). */
  url?: string
  picturePath?: string
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

export type Post = {
  _id: string
  userId: string
  description: string
  url?: string
  likes: PostLikes
  comments: string[]
  user?: Pick<User, "firstName" | "lastName" | "location" | "picturePath"> | null
}

export type AuthState = {
  mode: "light" | "dark"
  user: User | null
  posts: Post[]
  accessToken: string | null
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
  location: string
  occupation: string
  picture: File | null
}

export type ApiErrorBody = {
  msg?: string
  error?: string
}
