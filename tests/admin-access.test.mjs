import test from "node:test"
import assert from "node:assert/strict"

import { getAdminAccessDecision } from "../lib/admin-access.js"

test("waits for hydration until both token and user are restored", () => {
  const decision = getAdminAccessDecision({
    token: null,
    user: null,
    hydrated: false,
  })

  assert.deepEqual(decision, { kind: "wait" })
})

test("redirects anonymous sessions to login after hydration", () => {
  const decision = getAdminAccessDecision({
    token: null,
    user: null,
    hydrated: true,
  })

  assert.deepEqual(decision, { kind: "redirect", href: "/login" })
})

test("redirects non-admin users away from admin", () => {
  const decision = getAdminAccessDecision({
    token: "token",
    user: { role: "reader" },
    hydrated: true,
  })

  assert.deepEqual(decision, { kind: "redirect", href: "/dashboard" })
})

test("allows admins into the admin page", () => {
  const decision = getAdminAccessDecision({
    token: "token",
    user: { role: "ADMIN" },
    hydrated: true,
  })

  assert.deepEqual(decision, { kind: "allow" })
})

test("reuses the same decision reference for repeated allow checks", () => {
  const state = {
    token: "token",
    user: { role: "ADMIN" },
    hydrated: true,
  }

  const firstDecision = getAdminAccessDecision(state)
  const secondDecision = getAdminAccessDecision(state)

  assert.strictEqual(secondDecision, firstDecision)
})
