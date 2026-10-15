/**
 * Shared API client (axios) and URL helpers.
 *
 * Set `NEXT_PUBLIC_API_URL` in `frontend/.env.local` (see `.env.example`).
 * Falls back to http://localhost:5000 for local dev if unset.
 */

import axios from "axios"

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
 * URL for a file under the backend `public/assets` folder.
 * @example assetUrl("avatar.png") → "http://localhost:5000/assets/avatar.png"
 */
export function assetUrl(filename: string): string {
  const name = filename.replace(/^\/+/, "")
  return apiUrl(`/assets/${name}`)
}

/** Shared axios instance for all Express API calls. */
export const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    Accept: "application/json",
  },
})

/** Authorization header helper for Bearer JWT. */
export function authHeaders(accessToken: string | null | undefined) {
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {}
}
