'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import {
  BookOpen,
  Calendar,
  Building2,
  Barcode,
  ArrowLeft,
  BookMarked,
  Clock,
  Loader2,
} from 'lucide-react'
import { z } from 'zod'

import { Footer } from '@/components/footer'
import { Header } from '@/components/header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ApiError, requestJson } from '@/lib/api'
import { borrowBook } from '@/lib/borrowings'
import { logError } from '@/lib/logger'
import { useToast } from '@/hooks/use-toast'
import { useAuthStore } from '@/store/auth-store'

const bookDetailSchema = z.object({
  bookId: z.number(),
  isbn: z.string(),
  title: z.string(),
  author: z.string(),
  publisher: z.string().optional().nullable(),
  publishYear: z.number().optional().nullable(),
  categoryName: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  totalCount: z.number(),
  availableCount: z.number(),
  coverUrl: z.string().optional().nullable(),
})

type BookDetail = z.infer<typeof bookDetailSchema>

function getErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 404) {
      return '图书不存在或已下架'
    }
    return error.message
  }

  return '图书数据加载失败，请稍后重试'
}

function getBorrowErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    return error.message
  }

  return '借阅请求失败，请稍后重试'
}

function normalizeCoverUrl(coverUrl?: string | null) {
  if (!coverUrl) {
    return null
  }

  return /^https?:\/\//i.test(coverUrl) ? coverUrl : null
}

export default function BookDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const bookId = Number(params.id)
  const invalidId = !Number.isInteger(bookId) || bookId <= 0
  const token = useAuthStore((state) => state.token)
  const hydrated = useAuthStore((state) => state.hydrated)
  const { toast } = useToast()
  const [book, setBook] = useState<BookDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [borrowing, setBorrowing] = useState(false)

  const loadBook = useCallback(async (id: number) => {
    try {
      const detail = await requestJson(`/api/v1/books/${id}`, {
        method: 'GET',
      }, bookDetailSchema)
      setBook(detail)
      setErrorMessage('')
    } catch (error) {
      logError('book-detail.load', error)
      setBook(null)
      setErrorMessage(getErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (invalidId) {
      return undefined
    }
    const timer = window.setTimeout(() => {
      void loadBook(bookId)
    }, 0)

    return () => window.clearTimeout(timer)
  }, [bookId, invalidId, loadBook])

  const handleBorrow = useCallback(async () => {
    if (!hydrated) {
      return
    }

    if (!token) {
      router.replace('/login')
      return
    }

    if (!book || borrowing) {
      return
    }

    setBorrowing(true)
    try {
      await borrowBook(book.bookId)
      toast({ title: '借阅成功', description: '可在「我的借阅」中查看借阅详情' })
      await loadBook(book.bookId)
    } catch (error) {
      logError('book-detail.borrow', error)
      toast({
        title: '借阅失败',
        description: getBorrowErrorMessage(error),
        variant: 'destructive',
      })
    } finally {
      setBorrowing(false)
    }
  }, [book, borrowing, hydrated, loadBook, router, toast, token])

  const available = (book?.availableCount ?? 0) > 0
  const coverUrl = normalizeCoverUrl(book?.coverUrl)

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground transition-colors">首页</Link>
            <span>/</span>
            <Link href="/books" className="hover:text-foreground transition-colors">图书浏览</Link>
            <span>/</span>
            <span className="text-foreground line-clamp-1">{book?.title ?? '图书详情'}</span>
          </div>

          {invalidId ? (
            <div className="space-y-4 py-24 text-center">
              <p className="text-muted-foreground">无效的图书链接</p>
              <Button variant="outline" asChild>
                <Link href="/books">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  返回图书列表
                </Link>
              </Button>
            </div>
          ) : loading ? (
            <div className="py-24 text-center text-muted-foreground">正在加载图书信息…</div>
          ) : errorMessage ? (
            <div className="space-y-4 py-24 text-center">
              <p className="text-muted-foreground">{errorMessage}</p>
              <Button variant="outline" asChild>
                <Link href="/books">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  返回图书列表
                </Link>
              </Button>
            </div>
          ) : book ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Book Cover & Actions */}
              <div className="lg:col-span-1">
                <div className="sticky top-24 space-y-6">
                  {/* Book Cover */}
                  <Card className="bg-card overflow-hidden">
                    <div className="aspect-[3/4] bg-secondary flex items-center justify-center">
                      {coverUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={coverUrl} alt={book.title} className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-4xl font-bold text-muted-foreground/50 line-clamp-3 px-4 text-center">
                          {book.title}
                        </span>
                      )}
                    </div>
                  </Card>

                  {/* Actions */}
                  <div className="space-y-3">
                    <Button
                      className="w-full h-12 text-base"
                      disabled={!available || borrowing}
                      onClick={() => {
                        void handleBorrow()
                      }}
                    >
                      {borrowing ? (
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      ) : (
                        <BookMarked className="mr-2 h-5 w-5" />
                      )}
                      {borrowing ? '借阅中…' : available ? '借阅此书' : '已全部借出'}
                    </Button>
                  </div>

                  {/* Stock Info */}
                  <Card className="bg-card">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">馆藏数量</span>
                        <span className="font-medium">{book.totalCount} 本</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">可借数量</span>
                        <span className={`font-medium ${available ? 'text-primary' : 'text-destructive'}`}>
                          {book.availableCount} 本
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Book Details */}
              <div className="lg:col-span-2 space-y-6">
                {/* Title & Meta */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="secondary">{book.categoryName || '未分类'}</Badge>
                    {available ? (
                      <Badge className="bg-primary/10 text-primary">可借阅</Badge>
                    ) : (
                      <Badge variant="destructive">已全部借出</Badge>
                    )}
                  </div>

                  <h1 className="text-2xl md:text-3xl font-bold text-balance">{book.title}</h1>
                </div>

                {/* Basic Info */}
                <Card className="bg-card">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                          <BookOpen className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">作者</p>
                          <p className="font-medium">{book.author}</p>
                        </div>
                      </div>

                      {book.publisher && (
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">出版社</p>
                            <p className="font-medium">{book.publisher}</p>
                          </div>
                        </div>
                      )}

                      {book.publishYear && (
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                            <Calendar className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">出版年份</p>
                            <p className="font-medium">{book.publishYear} 年</p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                          <Barcode className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">ISBN</p>
                          <p className="font-medium">{book.isbn}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Description */}
                {book.description && (
                  <Card className="bg-card">
                    <CardContent className="p-6">
                      <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                        {book.description}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Borrow Info */}
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="p-6">
                    <h3 className="font-semibold flex items-center gap-2 mb-4">
                      <Clock className="h-5 w-5 text-primary" />
                      借阅须知
                    </h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• 借阅期限：30天</li>
                      <li>• 可续借次数：1次（续借后重新计算借阅期限）</li>
                      <li>• 逾期罚款：每天0.5元</li>
                      <li>• 每位用户最多同时借阅5本图书</li>
                    </ul>
                  </CardContent>
                </Card>

                <Button variant="ghost" asChild className="mt-4">
                  <Link href="/books">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    返回图书列表
                  </Link>
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </main>

      <Footer />
    </div>
  )
}
