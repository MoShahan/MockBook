import axios from "axios"

import type { ApiErrorBody } from "@/types/models"

/** Extract a user-facing message from an unknown thrown value (axios or Error). */
export function getErrorMessage(error: unknown, fallback = "Something went wrong"): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiErrorBody | undefined
    return data?.msg || data?.error || error.message || fallback
  }
  if (error instanceof Error) {
    return error.message || fallback
  }
  return fallback
}
