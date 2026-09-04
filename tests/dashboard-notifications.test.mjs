import test from "node:test"
import assert from "node:assert/strict"

import { getDashboardNotificationPageParams } from "../lib/dashboard-notifications.js"

test("dashboard notification center requests only the latest three notifications", () => {
  assert.deepEqual(getDashboardNotificationPageParams(), {
    page: 1,
    size: 3,
    sort: "createTime,desc",
  })
})
