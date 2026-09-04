import test from "node:test"
import assert from "node:assert/strict"

import {
  buildBooksPageHref,
  readBooksPageState,
} from "../lib/book-discovery.js"

test("buildBooksPageHref keeps the books route when no filters are provided", () => {
  assert.equal(buildBooksPageHref({}), "/books")
})

test("buildBooksPageHref writes homepage search links with the search query key", () => {
  assert.equal(buildBooksPageHref({ search: "python" }), "/books?search=python")
})

test("buildBooksPageHref writes category links to the existing books route", () => {
  assert.equal(
    buildBooksPageHref({ category: "文学" }),
    "/books?category=%E6%96%87%E5%AD%A6",
  )
})

test("readBooksPageState trims incoming query parameters", () => {
  const state = readBooksPageState(new URLSearchParams("search=%20%E4%BA%BA%E5%B7%A5%E6%99%BA%E8%83%BD%20&category=%20%E6%96%87%E5%AD%A6%20"))

  assert.deepEqual(state, {
    search: "人工智能",
    category: "文学",
  })
})

test("readBooksPageState falls back to empty filters for blank query values", () => {
  const state = readBooksPageState(new URLSearchParams("search=%20%20&category=%20"))

  assert.deepEqual(state, {
    search: "",
    category: "",
  })
})
