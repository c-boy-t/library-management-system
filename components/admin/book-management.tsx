"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { ApiError } from "@/lib/api"
import {
  createAdminBook,
  deleteAdminBook,
  fetchAdminBooks,
  fetchBookDetail,
  updateAdminBook,
  uploadBookCover,
  type BookDetail,
  type BookListItem,
  type BookPage,
} from "@/lib/admin-books"
import { fetchCategories, type Category } from "@/lib/categories"
import { logError } from "@/lib/logger"
import { useAuthStore } from "@/store/auth-store"
import { ImagePlus, Plus, RotateCcw, Search, Pencil, Trash2, X } from "lucide-react"

type BookSearchState = {
  title: string
  author: string
  categoryId: string
}

type BookMode = "create" | "edit"

type BookFormState = {
  isbn: string
  title: string
  author: string
  publisher: string
  publishYear: string
  categoryId: string
  description: string
  totalCount: string
  coverUrl: string
}

const pageSize = 10
const maxCoverSize = 5 * 1024 * 1024
const allowedCoverExtensions = [".jpg", ".jpeg", ".png", ".webp"]

const emptyBookPage: BookPage = {
  total: 0,
  pages: 0,
  pageNum: 1,
  pageSize,
  list: [],
}

const emptyBookForm: BookFormState = {
  isbn: "",
  title: "",
  author: "",
  publisher: "",
  publishYear: "",
  categoryId: "",
  description: "",
  totalCount: "",
  coverUrl: "",
}

function getErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    return error.message
  }

  return "图书数据加载失败，请稍后重试"
}

function getVisiblePages(currentPage: number, totalPages: number) {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  const start = Math.max(1, Math.min(currentPage - 2, totalPages - 4))
  return Array.from({ length: 5 }, (_, index) => start + index)
}

function formatDateTime(date?: string | null) {
  if (!date) {
    return "-"
  }

  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(new Date(date))
}

function toSearchQuery(query: BookSearchState) {
  return {
    title: query.title.trim(),
    author: query.author.trim(),
    categoryId: query.categoryId.trim() ? Number(query.categoryId) : undefined,
  }
}

function toBookForm(detail: BookDetail): BookFormState {
  return {
    isbn: detail.isbn ?? "",
    title: detail.title ?? "",
    author: detail.author ?? "",
    publisher: detail.publisher ?? "",
    publishYear: detail.publishYear?.toString() ?? "",
    categoryId: detail.categoryId.toString(),
    description: detail.description ?? "",
    totalCount: detail.totalCount?.toString() ?? "",
    coverUrl: detail.coverUrl ?? "",
  }
}

export function BookManagement({ refreshKey }: { refreshKey: number }) {
  const router = useRouter()
  const token = useAuthStore((state) => state.token)
  const hydrated = useAuthStore((state) => state.hydrated)
  const { toast } = useToast()

  const [bookPage, setBookPage] = useState<BookPage>(emptyBookPage)
  const [bookLoading, setBookLoading] = useState(false)
  const [bookError, setBookError] = useState("")
  const [bookSearch, setBookSearch] = useState<BookSearchState>({
    title: "",
    author: "",
    categoryId: "",
  })
  const [query, setQuery] = useState<BookSearchState>({
    title: "",
    author: "",
    categoryId: "",
  })
  const [categories, setCategories] = useState<Category[]>([])
  const [categoryLoading, setCategoryLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [mode, setMode] = useState<BookMode>("create")
  const [editingBookId, setEditingBookId] = useState<number | null>(null)
  const [bookForm, setBookForm] = useState<BookFormState>(emptyBookForm)
  const [dialogLoading, setDialogLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [coverUploading, setCoverUploading] = useState(false)
  const [coverFileName, setCoverFileName] = useState("")
  const [actionBookId, setActionBookId] = useState<number | null>(null)

  const visiblePages = useMemo(
    () => getVisiblePages(bookPage.pageNum, bookPage.pages),
    [bookPage.pageNum, bookPage.pages],
  )

  const loadCategories = useCallback(async () => {
    setCategoryLoading(true)
    try {
      const nextCategories = await fetchCategories()
      setCategories(nextCategories)
    } catch (error) {
      logError("admin.books.categories", error)
      toast({
        title: "分类加载失败",
        description: getErrorMessage(error),
        variant: "destructive",
      })
      setCategories([])
    } finally {
      setCategoryLoading(false)
    }
  }, [toast])

  const loadBooks = useCallback(async (page: number, nextQuery: BookSearchState) => {
    if (!token) {
      return
    }

    setBookLoading(true)
    setBookError("")
    try {
      const result = await fetchAdminBooks({
        page,
        size: pageSize,
        ...toSearchQuery(nextQuery),
      })
      setBookPage(result)
    } catch (error) {
      logError("admin.books.load", error)
      setBookPage(emptyBookPage)
      setBookError(getErrorMessage(error))
    } finally {
      setBookLoading(false)
    }
  }, [token])

  const closeDialog = useCallback(() => {
    setDialogOpen(false)
    setDialogLoading(false)
    setSubmitting(false)
    setEditingBookId(null)
    setMode("create")
    setBookForm(emptyBookForm)
    setCoverUploading(false)
    setCoverFileName("")
  }, [])

  const openCreateDialog = () => {
    setMode("create")
    setEditingBookId(null)
    setBookForm(emptyBookForm)
    setDialogOpen(true)
  }

  const openEditDialog = useCallback(async (book: BookListItem) => {
    if (!token) {
      router.replace("/login")
      return
    }

    setMode("edit")
    setEditingBookId(book.bookId)
    setDialogOpen(true)
    setDialogLoading(true)
    try {
      const detail = await fetchBookDetail(book.bookId)
      setBookForm(toBookForm(detail))
    } catch (error) {
      logError("admin.books.detail", error)
      toast({
        title: "加载图书失败",
        description: getErrorMessage(error),
        variant: "destructive",
      })
      closeDialog()
    } finally {
      setDialogLoading(false)
    }
  }, [closeDialog, router, toast, token])

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextQuery = {
      title: bookSearch.title.trim(),
      author: bookSearch.author.trim(),
      categoryId: bookSearch.categoryId.trim(),
    }
    setQuery(nextQuery)
    void loadBooks(1, nextQuery)
  }

  const handleResetSearch = () => {
    const nextQuery = { title: "", author: "", categoryId: "" }
    setBookSearch(nextQuery)
    setQuery(nextQuery)
    void loadBooks(1, nextQuery)
  }

  const handleCoverFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) {
      return
    }
    if (!token) {
      router.replace("/login")
      return
    }

    const lowerName = file.name.toLowerCase()
    const allowed = allowedCoverExtensions.some((extension) => lowerName.endsWith(extension))
    if (!allowed) {
      toast({
        title: "封面格式不支持",
        description: "仅支持 JPG、JPEG、PNG、WEBP 格式",
        variant: "destructive",
      })
      return
    }
    if (file.size > maxCoverSize) {
      toast({
        title: "封面文件过大",
        description: "单个封面文件不能超过 5MB",
        variant: "destructive",
      })
      return
    }

    setCoverUploading(true)
    setCoverFileName(file.name)
    try {
      const coverUrl = await uploadBookCover(file)
      setBookForm((current) => ({ ...current, coverUrl }))
      toast({ title: "封面上传成功" })
    } catch (error) {
      logError("admin.books.cover-upload", error)
      setCoverFileName("")
      toast({
        title: "封面上传失败",
        description: getErrorMessage(error),
        variant: "destructive",
      })
    } finally {
      setCoverUploading(false)
    }
  }

  const handlePageChange = (page: number) => {
    if (page < 1 || (bookPage.pages > 0 && page > bookPage.pages) || page === bookPage.pageNum) {
      return
    }

    void loadBooks(page, query)
  }

  const handleDelete = async (book: BookListItem) => {
    if (!token) {
      router.replace("/login")
      return
    }

    if (!window.confirm(`确定删除《${book.title}》吗？`)) {
      return
    }

    setActionBookId(book.bookId)
    try {
      await deleteAdminBook(book.bookId)
      toast({ title: "删除成功" })
      const targetPage = bookPage.list.length === 1 && bookPage.pageNum > 1 ? bookPage.pageNum - 1 : bookPage.pageNum
      await loadBooks(targetPage, query)
    } catch (error) {
      logError("admin.books.delete", error)
      toast({
        title: "删除失败",
        description: getErrorMessage(error),
        variant: "destructive",
      })
    } finally {
      setActionBookId(null)
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!token) {
      router.replace("/login")
      return
    }

    const categoryId = Number(bookForm.categoryId)
    const totalCount = Number(bookForm.totalCount)
    const publishYear = bookForm.publishYear.trim() ? Number(bookForm.publishYear) : undefined

    if (!bookForm.isbn.trim() || !bookForm.title.trim() || !bookForm.author.trim() || !Number.isFinite(categoryId) || !Number.isFinite(totalCount)) {
      toast({
        title: "请完善必填项",
        description: "ISBN、书名、作者、分类和总库存不能为空",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        isbn: bookForm.isbn.trim(),
        title: bookForm.title.trim(),
        author: bookForm.author.trim(),
        publisher: bookForm.publisher.trim() || undefined,
        publishYear,
        categoryId,
        description: bookForm.description.trim() || undefined,
        totalCount,
        coverUrl: bookForm.coverUrl.trim() || undefined,
      }

      if (mode === "create") {
        await createAdminBook(payload)
        toast({ title: "新增成功" })
        closeDialog()
        await loadBooks(1, query)
        return
      }

      if (!editingBookId) {
        throw new Error("Missing editing book id")
      }

      await updateAdminBook(editingBookId, payload)
      toast({ title: "保存成功" })
      closeDialog()
      await loadBooks(bookPage.pageNum, query)
    } catch (error) {
      logError("admin.books.submit", error)
      toast({
        title: mode === "create" ? "新增失败" : "保存失败",
        description: getErrorMessage(error),
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  useEffect(() => {
    if (!token) {
      if (!hydrated) {
        return
      }

      router.replace("/login")
      return
    }

    const timer = window.setTimeout(() => {
      void loadCategories()
      void loadBooks(1, { title: "", author: "", categoryId: "" })
    }, 0)

    // loadCategories / loadBooks are intentionally omitted — we only want this
    // effect to fire when auth resolves or the admin sidebar explicitly refreshes this tab.
    return () => window.clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, token, refreshKey])

  return (
    <div className="space-y-6">
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-lg">图书搜索</CardTitle>
          <CardDescription>按书名、作者或分类进行检索。</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSearch}
            className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(220px,1fr)_minmax(220px,1fr)_minmax(220px,1fr)_auto]"
          >
            <div className="space-y-2">
              <Label htmlFor="book-title-search">书名</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="book-title-search"
                  value={bookSearch.title}
                  onChange={(event) => setBookSearch((current) => ({ ...current, title: event.target.value }))}
                  placeholder="请输入书名"
                  className="pl-10 bg-secondary"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="book-author-search">作者</Label>
              <Input
                id="book-author-search"
                value={bookSearch.author}
                onChange={(event) => setBookSearch((current) => ({ ...current, author: event.target.value }))}
                placeholder="请输入作者"
                className="bg-secondary"
              />
            </div>
            <div className="space-y-2">
              <Label>分类</Label>
              <Select
                value={bookSearch.categoryId || "all"}
                onValueChange={(value) => setBookSearch((current) => ({
                  ...current,
                  categoryId: value === "all" ? "" : value,
                }))}
              >
                <SelectTrigger className="w-full bg-secondary">
                  <SelectValue placeholder={categoryLoading ? "正在加载分类..." : "请选择分类"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部分类</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.categoryId} value={String(category.categoryId)}>
                      {category.categoryName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-2">
              <Button type="submit" className="w-full md:w-auto">
                <Search className="mr-2 h-4 w-4" />
                搜索
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="重置搜索"
                onClick={handleResetSearch}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-card">
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-lg">图书信息</CardTitle>
            <CardDescription>
              共 {bookPage.total} 本图书，当前第 {bookPage.pageNum || 1} / {Math.max(bookPage.pages, 1)} 页
            </CardDescription>
          </div>
          <Button onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" />
            新增图书
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {bookError && (
            <div className="border-t border-border p-8 text-center text-sm text-destructive">
              {bookError}
            </div>
          )}

          {!bookError && (
            <>
              <div className="hidden overflow-x-auto lg:block">
                <Table className="table-auto">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[170px] text-center">ISBN</TableHead>
                      <TableHead className="min-w-[220px]">书名</TableHead>
                      <TableHead className="min-w-[180px]">作者</TableHead>
                      <TableHead className="min-w-[140px]">分类</TableHead>
                      <TableHead className="min-w-[120px]">库存</TableHead>
                      <TableHead className="min-w-[180px] text-center">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookPage.list.map((book) => (
                      <TableRow key={book.bookId}>
                        <TableCell className="font-mono text-sm">{book.isbn}</TableCell>
                        <TableCell className="font-medium">{book.title}</TableCell>
                        <TableCell>{book.author}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{book.categoryName || book.categoryId || "-"}</Badge>
                        </TableCell>
                        <TableCell>
                          <span className={book.availableCount === 0 ? "text-destructive" : ""}>
                            {book.availableCount}/{book.totalCount}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="h-8" onClick={() => void openEditDialog(book)}>
                              <Pencil className="mr-1.5 h-3.5 w-3.5" />
                              编辑
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 text-destructive hover:text-destructive"
                              disabled={actionBookId === book.bookId}
                              onClick={() => void handleDelete(book)}
                            >
                              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                              删除
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {!bookLoading && bookPage.list.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="h-28 text-center text-muted-foreground">
                          暂无匹配图书
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="space-y-3 border-t border-border p-4 lg:hidden">
                {bookPage.list.map((book) => (
                  <div key={book.bookId} className="rounded-lg bg-secondary/50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-mono text-sm text-muted-foreground">{book.isbn}</p>
                        <p className="mt-1 font-medium">{book.title}</p>
                        <p className="text-sm text-muted-foreground">{book.author}</p>
                      </div>
                      <Badge variant="secondary">{book.categoryName || book.categoryId || "-"}</Badge>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-sm">
                      <span className={book.availableCount === 0 ? "text-destructive" : "text-muted-foreground"}>
                        库存 {book.availableCount}/{book.totalCount}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDateTime(book.createTime)}
                      </span>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" onClick={() => void openEditDialog(book)}>
                        <Pencil className="mr-1.5 h-3.5 w-3.5" />
                        编辑
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive"
                        disabled={actionBookId === book.bookId}
                        onClick={() => void handleDelete(book)}
                      >
                        <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                        删除
                      </Button>
                    </div>
                  </div>
                ))}
                {!bookLoading && bookPage.list.length === 0 && (
                  <div className="rounded-lg bg-secondary/40 p-8 text-center text-sm text-muted-foreground">
                    暂无匹配图书
                  </div>
                )}
              </div>
            </>
          )}

          {bookLoading && (
            <div className="border-t border-border p-6 text-center text-sm text-muted-foreground">
              正在加载图书数据...
            </div>
          )}

          <div className="flex flex-col gap-3 border-t border-border p-4 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-muted-foreground">
              第 {bookPage.pageNum || 1} 页，每页 {bookPage.pageSize || pageSize} 条，共 {bookPage.total} 条
            </p>
            <Pagination className="mx-0 w-auto justify-start md:justify-end">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    className={bookPage.pageNum <= 1 ? "pointer-events-none opacity-50" : ""}
                    onClick={(event) => {
                      event.preventDefault()
                      handlePageChange(bookPage.pageNum - 1)
                    }}
                  />
                </PaginationItem>
                {visiblePages.map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      href="#"
                      isActive={page === bookPage.pageNum}
                      onClick={(event) => {
                        event.preventDefault()
                        handlePageChange(page)
                      }}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    className={bookPage.pageNum >= bookPage.pages ? "pointer-events-none opacity-50" : ""}
                    onClick={(event) => {
                      event.preventDefault()
                      handlePageChange(bookPage.pageNum + 1)
                    }}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="sm:max-w-3xl bg-card border-border overflow-hidden p-0">
          <div className="border-b border-border px-6 pt-6">
            <DialogHeader className="pb-4">
              <DialogTitle className="text-xl">
                {mode === "create" ? "新增图书信息" : "编辑图书信息"}
              </DialogTitle>
              <DialogDescription>
                {mode === "create"
                  ? "填写图书基础信息后保存到系统。"
                  : "修改图书信息后保存到系统。"}
              </DialogDescription>
            </DialogHeader>
          </div>

          <ScrollArea className="max-h-[calc(90vh-8rem)]">
            <form className="space-y-5 px-6 py-5" onSubmit={handleSubmit}>
              {dialogLoading ? (
                <div className="py-10 text-center text-sm text-muted-foreground">
                  正在加载图书信息...
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2 sm:col-span-2">
                      <Label>图书封面</Label>
                      <div className="flex flex-col gap-4 rounded-lg border border-border bg-secondary/30 p-4 sm:flex-row sm:items-start">
                        <label
                          htmlFor="book-cover-upload"
                          className="relative flex h-44 w-32 shrink-0 cursor-pointer overflow-hidden rounded-lg border-2 border-dashed border-border bg-background/40 transition-colors hover:border-primary/60 hover:bg-secondary"
                        >
                          {bookForm.coverUrl ? (
                            <>
                              <img
                                src={bookForm.coverUrl}
                                alt={bookForm.title || "图书封面"}
                                className="h-full w-full object-cover"
                              />
                              <span className="absolute inset-0 flex items-center justify-center bg-black/60 text-sm text-white opacity-0 transition-opacity hover:opacity-100">
                                更换封面
                              </span>
                            </>
                          ) : (
                            <span className="flex h-full w-full flex-col items-center justify-center text-muted-foreground">
                              <ImagePlus className="mb-2 h-8 w-8" />
                              <span className="text-xs">上传封面</span>
                            </span>
                          )}
                          <input
                            id="book-cover-upload"
                            type="file"
                            accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                            className="hidden"
                            disabled={coverUploading || submitting}
                            onChange={(event) => {
                              void handleCoverFileChange(event)
                            }}
                          />
                        </label>
                        <div className="min-w-0 flex-1 space-y-3 text-sm">
                          <div>
                            <p className="font-medium">{coverUploading ? "正在上传封面..." : "支持 JPG、PNG、WEBP 格式"}</p>
                            <p className="mt-1 text-xs text-muted-foreground">单文件最大 5MB，上传成功后会自动写入图书封面地址。</p>
                          </div>
                          {coverFileName && (
                            <p className="truncate text-xs text-muted-foreground">已选择：{coverFileName}</p>
                          )}
                          {bookForm.coverUrl && (
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge variant="secondary" className="max-w-full truncate">
                                已上传封面
                              </Badge>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setBookForm((current) => ({ ...current, coverUrl: "" }))
                                  setCoverFileName("")
                                }}
                              >
                                <X className="mr-1.5 h-3.5 w-3.5" />
                                移除
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="book-isbn">ISBN</Label>
                      <Input
                        id="book-isbn"
                        value={bookForm.isbn}
                        onChange={(event) => setBookForm((current) => ({ ...current, isbn: event.target.value }))}
                        placeholder="请输入ISBN编号"
                        className="bg-secondary border-border"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="book-title">书名</Label>
                      <Input
                        id="book-title"
                        value={bookForm.title}
                        onChange={(event) => setBookForm((current) => ({ ...current, title: event.target.value }))}
                        placeholder="请输入书名"
                        className="bg-secondary border-border"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="book-author">作者</Label>
                      <Input
                        id="book-author"
                        value={bookForm.author}
                        onChange={(event) => setBookForm((current) => ({ ...current, author: event.target.value }))}
                        placeholder="请输入作者"
                        className="bg-secondary border-border"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="book-publisher">出版社</Label>
                      <Input
                        id="book-publisher"
                        value={bookForm.publisher}
                        onChange={(event) => setBookForm((current) => ({ ...current, publisher: event.target.value }))}
                        placeholder="请输入出版社"
                        className="bg-secondary border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="book-publish-year">出版年份</Label>
                      <Input
                        id="book-publish-year"
                        type="number"
                        min="0"
                        max="9999"
                        value={bookForm.publishYear}
                        onChange={(event) => setBookForm((current) => ({ ...current, publishYear: event.target.value }))}
                        placeholder="如 2024"
                        className="bg-secondary border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="book-category">分类</Label>
                      <Select
                        value={bookForm.categoryId}
                        onValueChange={(value) => setBookForm((current) => ({ ...current, categoryId: value }))}
                      >
                        <SelectTrigger id="book-category" className="bg-secondary border-border">
                          <SelectValue placeholder={categoryLoading ? "正在加载分类..." : "请选择分类"} />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.categoryId} value={String(category.categoryId)}>
                              {category.categoryName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="book-total-count">总库存</Label>
                      <Input
                        id="book-total-count"
                        type="number"
                        min="0"
                        value={bookForm.totalCount}
                        onChange={(event) => setBookForm((current) => ({ ...current, totalCount: event.target.value }))}
                        placeholder="请输入总库存数量"
                        className="bg-secondary border-border"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="book-description">简介</Label>
                    <Textarea
                      id="book-description"
                      value={bookForm.description}
                      onChange={(event) => setBookForm((current) => ({ ...current, description: event.target.value }))}
                      placeholder="请输入图书简介..."
                      className="min-h-[120px] resize-none bg-secondary border-border"
                      rows={5}
                    />
                  </div>
                </>
              )}

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={closeDialog} disabled={submitting}>
                  取消
                </Button>
                <Button type="submit" disabled={submitting || dialogLoading || categoryLoading || coverUploading}>
                  {submitting ? "处理中..." : mode === "create" ? "确认添加" : "保存"}
                </Button>
              </DialogFooter>
            </form>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  )
}
