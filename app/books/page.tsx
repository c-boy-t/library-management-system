'use client'

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { BookOpen, Filter, Search, Star } from 'lucide-react'
import { z } from 'zod'

import { Footer } from '@/components/footer'
import { Header } from '@/components/header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { ApiError, requestJson } from '@/lib/api'
import { logError } from '@/lib/logger'

interface Book {
  id: number
  title: string
  author: string
  category_name: string
  year: number
  available_count: number
  cover_url?: string | null
  rating?: number | null
}

const bookListItemSchema = z.object({
  bookId: z.number(),
  title: z.string(),
  author: z.string(),
  publishYear: z.number().nullable().optional(),
  categoryName: z.string().nullable().optional(),
  availableCount: z.number().nullable().optional(),
  coverUrl: z.string().nullable().optional(),
  rating: z.number().nullable().optional(),
})

const bookPageSchema = z.object({
  total: z.number(),
  pages: z.number(),
  pageNum: z.number(),
  pageSize: z.number(),
  list: z.array(bookListItemSchema),
})

const yearOptions = [
  { label: '2020 至今', value: '2020-now' },
  { label: '2015 - 2019', value: '2015-2019' },
  { label: '2010 - 2014', value: '2010-2014' },
  { label: '2010 年以前', value: 'before-2010' },
]

const availabilityOptions = [
  { label: '可借阅', value: 'available' },
  { label: '已全部借出', value: 'unavailable' },
]

function getErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    return error.message
  }

  return '图书数据加载失败，请稍后重试'
}

function normalizeCoverUrl(coverUrl?: string | null) {
  if (!coverUrl) {
    return null
  }

  return /^https?:\/\//i.test(coverUrl) ? coverUrl : null
}

function matchesYearRange(year: number, range: string) {
  if (range === '2020-now') {
    return year >= 2020
  }
  if (range === '2015-2019') {
    return year >= 2015 && year <= 2019
  }
  if (range === '2010-2014') {
    return year >= 2010 && year <= 2014
  }
  return year < 2010
}

async function fetchBooks(search?: string) {
  const params = new URLSearchParams({
    page: '1',
    size: '100',
    sort: 'createTime,desc',
  })
  const keyword = search?.trim()
  if (keyword) {
    params.set('search', keyword)
  }

  const page = await requestJson(`/api/v1/books?${params.toString()}`, {
    method: 'GET',
  }, bookPageSchema)

  return {
    total: page.total,
    books: page.list.map((book): Book => ({
      id: book.bookId,
      title: book.title,
      author: book.author,
      category_name: book.categoryName || '未分类',
      year: book.publishYear ?? 0,
      available_count: book.availableCount ?? 0,
      cover_url: normalizeCoverUrl(book.coverUrl),
      rating: book.rating,
    })),
  }
}

export default function BooksPage() {
  const [searchValue, setSearchValue] = useState('')
  const [submittedSearch, setSubmittedSearch] = useState('')
  const [books, setBooks] = useState<Book[]>([])
  const [serverTotal, setServerTotal] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState('全部')
  const [selectedYears, setSelectedYears] = useState<string[]>([])
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  const categories = useMemo(() => {
    return ['全部', ...Array.from(new Set(books.map((book) => book.category_name)))]
  }, [books])

  const loadBooks = useCallback(async (search?: string) => {
    setLoading(true)
    setErrorMessage('')
    try {
      const result = await fetchBooks(search)
      setBooks(result.books)
      setServerTotal(result.total)
      setSelectedCategory('全部')
    } catch (error) {
      logError('books.load', error)
      setBooks([])
      setServerTotal(0)
      setErrorMessage(getErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }, [])

  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      const matchesCategory = selectedCategory === '全部' || book.category_name === selectedCategory
      const matchesYear = selectedYears.length === 0
        || selectedYears.some((range) => matchesYearRange(book.year, range))
      const matchesAvailability = selectedAvailability.length === 0
        || selectedAvailability.some((status) => (
          status === 'available' ? book.available_count > 0 : book.available_count === 0
        ))

      return matchesCategory && matchesYear && matchesAvailability
    })
  }, [books, selectedAvailability, selectedCategory, selectedYears])

  useEffect(() => {
    void loadBooks()
  }, [loadBooks])

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmittedSearch(searchValue)
    void loadBooks(searchValue)
  }

  function toggleFilter(value: string, selected: string[], onChange: (next: string[]) => void) {
    onChange(selected.includes(value)
      ? selected.filter((item) => item !== value)
      : [...selected, value])
  }

  const filterPanel = (
    <div className="space-y-7">
      <section>
        <h2 className="mb-3 text-sm font-semibold text-foreground">图书分类</h2>
        <div className="space-y-1">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setSelectedCategory(category)}
              className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors ${selectedCategory === category
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-secondary/70 hover:text-foreground'
                }`}
            >
              <span>{category}</span>
              <span className="text-xs opacity-75">
                {category === '全部'
                  ? books.length
                  : books.filter((book) => book.category_name === category).length}
              </span>
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-foreground">出版年份</h2>
        <div className="space-y-3">
          {yearOptions.map((option) => (
            <label key={option.value} className="flex cursor-pointer items-center gap-3 text-sm text-muted-foreground">
              <Checkbox
                checked={selectedYears.includes(option.value)}
                onCheckedChange={() => toggleFilter(option.value, selectedYears, setSelectedYears)}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-foreground">借阅状态</h2>
        <div className="space-y-3">
          {availabilityOptions.map((option) => (
            <label key={option.value} className="flex cursor-pointer items-center gap-3 text-sm text-muted-foreground">
              <Checkbox
                checked={selectedAvailability.includes(option.value)}
                onCheckedChange={() => toggleFilter(option.value, selectedAvailability, setSelectedAvailability)}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </section>
    </div>
  )

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-normal">图书浏览</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                按分类、年份和借阅状态筛选馆藏图书
                {submittedSearch && <span>，当前搜索“{submittedSearch}”</span>}
              </p>
            </div>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="w-fit lg:hidden">
                  <Filter className="h-4 w-4" />
                  筛选
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>筛选条件</SheetTitle>
                </SheetHeader>
                <div className="mt-6">{filterPanel}</div>
              </SheetContent>
            </Sheet>
          </div>

          <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
            <aside className="hidden lg:block">
              <div className="sticky top-24 rounded-lg border bg-card/70 p-5">
                {filterPanel}
              </div>
            </aside>

            <section className="min-w-0">
              <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="search"
                    value={searchValue}
                    onChange={(event) => setSearchValue(event.target.value)}
                    placeholder="搜索书名或作者"
                    className="h-10 bg-card pl-10"
                  />
                </div>
                <Button type="submit" className="h-10 sm:w-28">
                  <Search className="h-4 w-4" />
                  搜索
                </Button>
              </form>

              <div className="mt-4 text-sm text-muted-foreground">
                共找到 <span className="font-medium text-foreground">{filteredBooks.length}</span> 本图书
              </div>

              {loading && (
                <div className="mt-6 rounded-lg border bg-card/70 p-10 text-center text-sm text-muted-foreground">
                  正在从后端加载图书...
                </div>
              )}

              {!loading && errorMessage && (
                <div className="mt-6 rounded-lg border border-destructive/30 bg-destructive/10 p-10 text-center text-sm text-destructive">
                  {errorMessage}
                </div>
              )}

              {!loading && !errorMessage && (
                <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {filteredBooks.map((book) => (
                    <Link key={book.id} href={`/books/${book.id}`} className="group block">
                      <Card className="h-full bg-card transition-colors hover:border-primary/60">
                        <CardContent className="flex h-full flex-col p-5">
                          <div className="flex aspect-[3/4] items-center justify-center overflow-hidden rounded-md bg-secondary/80">
                            {book.cover_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={book.cover_url}
                                alt={book.title}
                                className="h-full w-full object-cover transition-transform group-hover:scale-105"
                              />
                            ) : (
                              <BookOpen className="h-12 w-12 text-muted-foreground/60 transition-colors group-hover:text-primary" />
                            )}
                          </div>

                          <div className="mt-4 flex flex-1 flex-col">
                            <div className="mb-3 flex items-center justify-between gap-3">
                              <Badge variant="secondary">{book.category_name}</Badge>
                              <span className="text-xs text-muted-foreground">{book.year}</span>
                            </div>

                            <h3 className="line-clamp-2 min-h-12 text-base font-semibold transition-colors group-hover:text-primary">
                              {book.title}
                            </h3>
                            <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{book.author}</p>

                            <div className="mt-3 flex items-center gap-1 text-sm">
                              <Star className="h-4 w-4 fill-accent text-accent" />
                              <span className="font-medium">
                                {typeof book.rating === 'number' ? book.rating.toFixed(1) : '暂无评分'}
                              </span>
                            </div>

                            <div className="mt-auto pt-5">
                              {book.available_count > 0 ? (
                                <Badge className="bg-primary/15 text-primary hover:bg-primary/20">
                                  可借阅 ({book.available_count})
                                </Badge>
                              ) : (
                                <Badge variant="destructive">已全部借出</Badge>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}

              {!loading && !errorMessage && filteredBooks.length === 0 && (
                <div className="mt-6 rounded-lg border bg-card/70 p-10 text-center text-sm text-muted-foreground">
                  没有找到符合条件的图书
                </div>
              )}
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
