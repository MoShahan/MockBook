/** Must match backend `lib/password.js` message and rules. */
export const PASSWORD_POLICY_MESSAGE =
  "Password must be 8–24 characters and include uppercase, lowercase, a number, and a symbol."

const PASSWORD_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,24}$/

export function isValidPassword(password: string): boolean {
  return PASSWORD_RE.test(password)
}
