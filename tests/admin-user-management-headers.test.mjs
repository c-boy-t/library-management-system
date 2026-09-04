import test from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, resolve } from "node:path"

const __dirname = dirname(fileURLToPath(import.meta.url))
const source = readFileSync(resolve(__dirname, "../app/admin/page.tsx"), "utf8")

const userTableHeader = source.slice(
  source.indexOf('<CardTitle className="text-lg">用户信息</CardTitle>'),
  source.indexOf("</TableHeader>", source.indexOf('<CardTitle className="text-lg">用户信息</CardTitle>')),
)

test("user management table columns use flex weights and requested alignment", () => {
  const columns = [
    { label: "用户信息", weight: "flex-[2_1_0%]", align: "text-left" },
    { label: "联系方式", weight: "flex-[2_1_0%]", align: "text-left" },
    { label: "角色", weight: "flex-[1_1_0%]", align: "text-center" },
    { label: "账号状态", weight: "flex-[1_1_0%]", align: "text-center" },
    { label: "最后操作时间", weight: "flex-[1.6_1_0%]", align: "text-center" },
    { label: "操作", weight: "flex-[2.4_1_0%]", align: "text-right" },
  ]

  assert.match(userTableHeader, /<Table className="block w-full">/)
  assert.match(userTableHeader, /<TableRow className="flex w-full">/)

  for (const { label, weight, align } of columns) {
    assert.match(
      userTableHeader,
      new RegExp(`<TableHead className="[^"]*${weight.replaceAll("[", "\\[").replaceAll("]", "\\]")}[^"]*${align}[^"]*">${label}</TableHead>`),
    )
  }
})

test("user management table body mirrors header weights and aligns content by column", () => {
  const userTableBody = source.slice(
    source.indexOf('<TableBody className="block">', source.indexOf('<CardTitle className="text-lg">用户信息</CardTitle>')),
    source.indexOf("</TableBody>", source.indexOf('<CardTitle className="text-lg">用户信息</CardTitle>')),
  )

  const expectedCells = [
    /<TableCell className="flex-\[2_1_0%\] text-left">/,
    /<TableCell className="flex-\[2_1_0%\] text-left">/,
    /<TableCell className="flex-\[1_1_0%\] text-center">/,
    /<TableCell className="flex-\[1_1_0%\] text-center">/,
    /<TableCell className="flex-\[1\.6_1_0%\] text-center font-mono text-sm text-muted-foreground">/,
    /<TableCell className="flex-\[2\.4_1_0%\] text-right">/,
  ]

  assert.match(userTableBody, /<TableRow key={user\.userId} className="flex w-full">/)
  for (const expectedCell of expectedCells) {
    assert.match(userTableBody, expectedCell)
  }

  assert.match(userTableBody, /<div className="flex justify-end gap-2">/)
})
