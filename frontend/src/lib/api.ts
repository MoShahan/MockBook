/**
 * Shared API client (axios) and URL helpers.
 *
 * Set `NEXT_PUBLIC_API_URL` in `frontend/.env.local` (see `.env.example`).
 * Falls back to http://localhost:5000 for local dev if unset.
 *
 * Bearer JWT is attached via a request interceptor from the Redux store.
 */

import axios from "axios"

import { store } from "@/state/store"

const DEFAULT_API_URL = "http://localhost:5000"

/** API origin with no trailing slash. */
export function getApiBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL?.trim() || DEFAULT_API_URL
  return raw.replace(/\/+$/, "")
}

/**
 * Build a full API URL from a path (for rare cases that need a string URL).
 * @example apiUrl("/posts") → "http://localhost:5000/posts"
 */
export function apiUrl(path: string = ""): string {
  const base = getApiBaseUrl()
  if (!path) return base
  const normalized = path.startsWith("/") ? path : `/${path}`
  return `${base}${normalized}`
}

/**
 * Resolve a media `src` for `<img>`.
 * Absolute ImageKit (or other CDN) URLs are returned as-is.
 * Empty values stay empty.
 *
 * @example mediaUrl("https://ik.imagekit.io/id/x.jpg") → same URL
 */
export function mediaUrl(src: string | undefined | null): string {
  if (!src) return ""
  const trimmed = src.trim()
  if (!trimmed) return ""
  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith("data:")) {
    return trimmed
  }
  // Legacy relative paths are not served by the API anymore (uploads go to ImageKit).
  return trimmed
}

/** @deprecated Prefer `mediaUrl` — uploads are absolute ImageKit URLs now. */
export const assetUrl = mediaUrl

/** Shared axios instance for all Express API calls. */
export const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    Accept: "application/json",
  },
})

api.interceptors.request.use(config => {
  const token = store.getState().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
