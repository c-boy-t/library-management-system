import test from "node:test"
import assert from "node:assert/strict"

import {
  buildAdminOverdueAckStreamHeaders,
  parseSseChunk,
} from "../lib/admin-overdue-ack-stream.js"

test("parseSseChunk buffers incomplete SSE frames", () => {
  const first = parseSseChunk("", "event: overdue-ack\ndata: {\"notificationId\":1}")

  assert.deepEqual(first.messages, [])
  assert.equal(first.buffer, "event: overdue-ack\ndata: {\"notificationId\":1}")
})

test("parseSseChunk returns complete event messages and leaves trailing buffer", () => {
  const parsed = parseSseChunk(
    "event: overdue-ack\ndata: {\"notificationId\":1}",
    "\n\nevent: heartbeat\ndata: {}\n\nevent: overdue-ack",
  )

  assert.deepEqual(parsed.messages, [
    { event: "overdue-ack", data: "{\"notificationId\":1}" },
    { event: "heartbeat", data: "{}" },
  ])
  assert.equal(parsed.buffer, "event: overdue-ack")
})

test("parseSseChunk joins multi-line data fields", () => {
  const parsed = parseSseChunk("", "event: overdue-ack\ndata: {\"a\":1,\ndata: \"b\":2}\n\n")

  assert.deepEqual(parsed.messages, [
    { event: "overdue-ack", data: "{\"a\":1,\n\"b\":2}" },
  ])
  assert.equal(parsed.buffer, "")
})

test("buildAdminOverdueAckStreamHeaders requests the SSE media type", () => {
  assert.deepEqual(buildAdminOverdueAckStreamHeaders("token-123"), {
    Accept: "text/event-stream",
    Authorization: "Bearer token-123",
  })
})
