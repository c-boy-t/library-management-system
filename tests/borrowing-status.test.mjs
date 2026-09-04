import test from "node:test"
import assert from "node:assert/strict"

import { getBorrowingStatusMeta } from "../lib/borrowing-status.js"

test("maps BORROWING to the active borrowing badge", () => {
  assert.deepEqual(getBorrowingStatusMeta("BORROWING"), {
    label: "借出",
    variant: "default",
  })
})

test("keeps returned records as a secondary badge", () => {
  assert.deepEqual(getBorrowingStatusMeta("RETURNED"), {
    label: "已还",
    variant: "secondary",
  })
})

test("falls back to an outline badge for unknown statuses", () => {
  assert.deepEqual(getBorrowingStatusMeta("SOMETHING_ELSE"), {
    label: "SOMETHING_ELSE",
    variant: "outline",
  })
})
