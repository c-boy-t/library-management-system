/**
 * @typedef {{ role?: string | null } | null | undefined} AdminAccessUser
 * @typedef {{
 *   token: string | null
 *   user: AdminAccessUser
 *   hydrated: boolean
 * }} AdminAccessState
 * @typedef {{ kind: "wait" } | { kind: "allow" } | { kind: "redirect", href: string }} AdminAccessDecision
 */

const waitDecision = Object.freeze({ kind: "wait" })
const allowDecision = Object.freeze({ kind: "allow" })
const loginRedirectDecision = Object.freeze({ kind: "redirect", href: "/login" })
const dashboardRedirectDecision = Object.freeze({ kind: "redirect", href: "/dashboard" })

/**
 * Decide whether the admin page should wait, redirect, or load.
 *
 * @param {AdminAccessState} state
 * @returns {AdminAccessDecision}
 */
export function getAdminAccessDecision({ token, user, hydrated }) {
  if (!hydrated && (!token || !user)) {
    return waitDecision
  }

  if (!token || !user) {
    return loginRedirectDecision
  }

  if (user.role?.toUpperCase() !== "ADMIN") {
    return dashboardRedirectDecision
  }

  return allowDecision
}
