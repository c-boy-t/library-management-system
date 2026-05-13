'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  AlertTriangle,
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  RotateCcw,
} from 'lucide-react'

import { Footer } from '@/components/footer'
import { Header } from '@/components/header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  fetchMyBorrowingHistory,
  fetchMyBorrowingSummary,
  fetchMyCurrentBorrowings,
  renewBorrowing,
  returnBorrowing,
  type BorrowingRecord,
  type BorrowingSummary,
} from '@/lib/borrowings'
import { ApiError } from '@/lib/api'
import { logError } from '@/lib/logger'
import { toast } from '@/hooks/use-toast'
import { useAuthStore } from '@/store/auth-store'

const emptySummary: BorrowingSummary = {
  currentBorrowingCount: 0,
  dueSoonCount: 0,
  overdueBookCount: 0,
  overdueFineAll: 0,
  historyBorrowingCount: 0,
}

interface BorrowingViewModel extends BorrowingRecord {
  daysUntilDue: number
  isDueSoon: boolean
  isOverdue: boolean
  statusLabel: string
}

function getErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    return error.message
  }

  return '借阅数据加载失败，请稍后重试'
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(date))
}

function getDaysUntilDue(dueDate: string) {
  const due = new Date(dueDate).getTime()
  return Math.ceil((due - Date.now()) / (1000 * 60 * 60 * 24))
}

function toBorrowingView(record: BorrowingRecord): BorrowingViewModel {
  const daysUntilDue = getDaysUntilDue(record.dueDate)
  const isOverdue = daysUntilDue < 0 || record.status === 'OVERDUE'
  const isDueSoon = !isOverdue && daysUntilDue <= 7

  return {
    ...record,
    daysUntilDue,
    isDueSoon,
    isOverdue,
    statusLabel: isOverdue ? `逾期 ${Math.abs(daysUntilDue)} 天` : `${daysUntilDue} 天后到期`,
  }
}

export default function BorrowsPage() {
  const router = useRouter()
  const token = useAuthStore((state) => state.token)
  const user = useAuthStore((state) => state.user)
  const hydrated = useAuthStore((state) => state.hydrated)
  const [summary, setSummary] = useState<BorrowingSummary>(emptySummary)
  const [currentBorrowings, setCurrentBorrowings] = useState<BorrowingRecord[]>([])
  const [historyBorrowings, setHistoryBorrowings] = useState<BorrowingRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [actionBorrowId, setActionBorrowId] = useState<number | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  const currentViews = useMemo(() => currentBorrowings.map(toBorrowingView), [currentBorrowings])

  const totalBorrowingCount = summary.historyBorrowingCount
  const currentBorrowingCount = summary.currentBorrowingCount || currentBorrowings.length
  const overdueCount = summary.overdueBookCount || currentViews.filter((book) => book.isOverdue).length
  const dueSoonCount = summary.dueSoonCount || currentViews.filter((book) => book.isDueSoon).length

  const loadBorrowings = useCallback(async () => {
    if (!token) {
      return
    }

    setLoading(true)
    setErrorMessage('')
    try {
      const [nextSummary, currentPage, historyPage] = await Promise.all([
        fetchMyBorrowingSummary(token),
        fetchMyCurrentBorrowings(token, 100),
        fetchMyBorrowingHistory(token, 100),
      ])

      setSummary(nextSummary)
      setCurrentBorrowings(currentPage.list)
      setHistoryBorrowings(historyPage.list)
    } catch (error) {
      logError('borrows.load', error)
      setErrorMessage(getErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }, [token])

  const handleRenew = useCallback(async (borrowId: number) => {
    if (!token) {
      router.replace('/login')
      return
    }

    setActionBorrowId(borrowId)
    try {
      const renewed = await renewBorrowing(token, borrowId)
      setCurrentBorrowings((records) => records.map((record) => (
        record.borrowId === borrowId ? renewed : record
      )))
      toast({ title: '续借成功' })
      void loadBorrowings()
    } catch (error) {
      logError('borrows.renew', error)
      toast({
        title: '续借失败',
        description: getErrorMessage(error),
        variant: 'destructive',
      })
    } finally {
      setActionBorrowId(null)
    }
  }, [loadBorrowings, router, token])

  const handleReturn = useCallback(async (borrowId: number) => {
    if (!token) {
      router.replace('/login')
      return
    }

    setActionBorrowId(borrowId)
    try {
      const returned = await returnBorrowing(token, borrowId)
      setCurrentBorrowings((records) => records.filter((record) => record.borrowId !== borrowId))
      setHistoryBorrowings((records) => [returned, ...records]
        .sort((a, b) => new Date(b.returnDate ?? 0).getTime() - new Date(a.returnDate ?? 0).getTime()))
      toast({ title: '归还成功' })
      void loadBorrowings()
    } catch (error) {
      logError('borrows.return', error)
      toast({
        title: '归还失败',
        description: getErrorMessage(error),
        variant: 'destructive',
      })
    } finally {
      setActionBorrowId(null)
    }
  }, [loadBorrowings, router, token])

  useEffect(() => {
    if (!hydrated && (!token || !user)) {
      return
    }

    if (!token || !user) {
      router.replace('/login')
      return
    }

    void loadBorrowings()
  }, [hydrated, loadBorrowings, router, token, user])

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 bg-background">
        <div className="container mx-auto px-4 py-8">
          <Button variant="ghost" asChild className="mb-6">
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回个人中心
            </Link>
          </Button>

          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold">我的借阅</h1>
              <p className="text-muted-foreground">管理您的借阅图书</p>
            </div>

            <div className="flex flex-wrap gap-3">
              {overdueCount > 0 && (
                <Badge variant="destructive" className="h-8 px-3">
                  <AlertTriangle className="mr-1 h-3.5 w-3.5" />
                  {overdueCount} 本逾期
                </Badge>
              )}
              {dueSoonCount > 0 && (
                <Badge className="h-8 bg-accent/20 px-3 text-accent">
                  <Clock className="mr-1 h-3.5 w-3.5" />
                  {dueSoonCount} 本即将到期
                </Badge>
              )}
            </div>
          </div>

          <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-card">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">当前借阅</p>
                <p className="mt-1 text-2xl font-bold">{currentBorrowingCount}</p>
              </CardContent>
            </Card>
            <Card className="bg-card">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">逾期图书</p>
                <p className="mt-1 text-2xl font-bold text-destructive">{overdueCount}</p>
              </CardContent>
            </Card>
            <Card className="bg-card">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">即将到期</p>
                <p className="mt-1 text-2xl font-bold text-accent">{dueSoonCount}</p>
              </CardContent>
            </Card>
            <Card className="bg-card">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">总借阅</p>
                <p className="mt-1 text-2xl font-bold">{totalBorrowingCount}</p>
              </CardContent>
            </Card>
          </div>

          {loading && (
            <Card className="bg-card">
              <CardContent className="p-10 text-center text-sm text-muted-foreground">
                正在加载借阅数据...
              </CardContent>
            </Card>
          )}

          {!loading && errorMessage && (
            <Card className="border-destructive/40 bg-destructive/10">
              <CardContent className="p-10 text-center text-sm text-destructive">
                {errorMessage}
              </CardContent>
            </Card>
          )}

          {!loading && !errorMessage && (
            <Tabs defaultValue="current" className="space-y-6">
              <TabsList className="h-auto border border-border bg-card p-1">
                <TabsTrigger value="current" className="px-4">
                  <BookOpen className="mr-2 h-4 w-4" />
                  当前借阅 ({currentBorrowingCount})
                </TabsTrigger>
                <TabsTrigger value="history" className="px-4">
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  借阅历史 ({historyBorrowings.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="current">
                <div className="space-y-4">
                  {currentViews.map((book) => {
                    const actionDisabled = actionBorrowId === book.borrowId
                    const renewed = (book.renewalCount ?? book.renewed ?? 0) >= 1

                    return (
                      <Card
                        key={book.borrowId}
                        className={`bg-card ${book.isOverdue ? 'border-destructive/50' : ''}`}
                      >
                        <CardContent className="p-6">
                          <div className="flex flex-col gap-4 md:flex-row md:items-center">
                            <div className="flex h-24 w-16 shrink-0 items-center justify-center rounded-lg bg-secondary">
                              <BookOpen className="h-8 w-8 text-muted-foreground" />
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="mb-2 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                  <Link
                                    href={`/books/${book.bookId}`}
                                    className="font-semibold transition-colors hover:text-primary"
                                  >
                                    {book.bookTitle}
                                  </Link>
                                  <p className="text-sm text-muted-foreground">{book.author}</p>
                                </div>
                                {book.isOverdue ? (
                                  <Badge variant="destructive" className="w-fit">
                                    {book.statusLabel}
                                  </Badge>
                                ) : book.isDueSoon ? (
                                  <Badge className="w-fit bg-accent/20 text-accent">
                                    {book.statusLabel}
                                  </Badge>
                                ) : (
                                  <Badge variant="secondary" className="w-fit">
                                    {book.statusLabel}
                                  </Badge>
                                )}
                              </div>

                              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  <span>借阅：{formatDate(book.borrowDate)}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  <span>到期：{formatDate(book.dueDate)}</span>
                                </div>
                              </div>

                              {book.isOverdue && (
                                <div className="mt-3 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                                  <AlertTriangle className="mr-2 inline-block h-4 w-4" />
                                  此图书已逾期，罚款金额：¥{book.overdueFine.toFixed(2)}
                                </div>
                              )}
                            </div>

                            <div className="flex shrink-0 gap-2 md:flex-col">
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={actionDisabled || renewed || book.isOverdue}
                                className="flex-1 md:flex-none"
                                onClick={() => {
                                  void handleRenew(book.borrowId)
                                }}
                              >
                                <RotateCcw className="mr-2 h-4 w-4" />
                                {renewed ? '已续借' : '续借'}
                              </Button>
                              <Button
                                size="sm"
                                disabled={actionDisabled}
                                className="flex-1 md:flex-none"
                                onClick={() => {
                                  void handleReturn(book.borrowId)
                                }}
                              >
                                归还
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}

                  {currentViews.length === 0 && (
                    <Card className="bg-card">
                      <CardContent className="p-12 text-center">
                        <BookOpen className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                        <h3 className="mb-2 text-lg font-semibold">暂无借阅</h3>
                        <p className="mb-4 text-muted-foreground">您目前没有正在借阅的图书</p>
                        <Button asChild>
                          <Link href="/books">
                            浏览图书
                            <ArrowUpRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="history">
                <Card className="bg-card">
                  <CardHeader>
                    <CardTitle className="text-lg">借阅历史</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {historyBorrowings.map((book) => (
                        <div
                          key={book.borrowId}
                          className="flex flex-col gap-3 rounded-lg bg-secondary/50 p-4 transition-colors hover:bg-secondary sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex h-12 w-9 shrink-0 items-center justify-center rounded bg-secondary">
                              <BookOpen className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div>
                              <Link
                                href={`/books/${book.bookId}`}
                                className="font-medium transition-colors hover:text-primary"
                              >
                                {book.bookTitle}
                              </Link>
                              <p className="text-sm text-muted-foreground">{book.author}</p>
                            </div>
                          </div>
                          <div className="text-left sm:text-right">
                            <div className="flex items-center gap-1 text-sm text-muted-foreground sm:justify-end">
                              <CheckCircle2 className="h-4 w-4 text-primary" />
                              <span>已归还</span>
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {formatDate(book.borrowDate)} ~ {book.returnDate ? formatDate(book.returnDate) : '-'}
                            </p>
                          </div>
                        </div>
                      ))}

                      {historyBorrowings.length === 0 && (
                        <div className="rounded-lg bg-secondary/40 p-10 text-center text-sm text-muted-foreground">
                          暂无借阅历史
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
