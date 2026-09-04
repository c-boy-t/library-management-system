import test from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, resolve } from "node:path"

const __dirname = dirname(fileURLToPath(import.meta.url))
const source = readFileSync(resolve(__dirname, "../components/admin/book-management.tsx"), "utf8")

const desktopActions = source.slice(
  source.indexOf('<Table className="table-auto">'),
  source.indexOf('<TableCell colSpan={6}'),
)

test("desktop book actions expose edit and delete buttons without an overflow menu", () => {
  assert.doesNotMatch(desktopActions, /MoreHorizontal|DropdownMenu/)
  assert.match(desktopActions, /<Pencil className="mr-1\.5 h-3\.5 w-3\.5" \/>[\s\r\n]*编辑/)
  assert.match(desktopActions, /<Trash2 className="mr-1\.5 h-3\.5 w-3\.5" \/>[\s\r\n]*删除/)
})

test("desktop book table centers the ISBN and action headers", () => {
  assert.match(desktopActions, /<TableHead className="[^"]*text-center[^"]*">ISBN<\/TableHead>/)
  assert.match(desktopActions, /<TableHead className="[^"]*text-center[^"]*">操作<\/TableHead>/)
})
