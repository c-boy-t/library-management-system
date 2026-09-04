import Link from 'next/link'
import { memo, useMemo } from 'react'
import { ArrowRight, BookMarked, BookOpen, Calendar } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getBorrowingStatusView } from '@/hooks/use-dashboard-data'
import type { BorrowingRecord } from '@/lib/borrowings'

interface CurrentBorrowingsCardProps {
  actionBorrowId: number | null
  borrowings: BorrowingRecord[]
  loading: boolean
  onRenew: (borrowId: number) => void
  onReturn: (borrowId: number) => void
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(date))
}

function CurrentBorrowingsCardComponent({
  actionBorrowId,
  borrowings,
  loading,
  onRenew,
  onReturn,
}: CurrentBorrowingsCardProps) {
  const displayedBorrowings = useMemo(() => borrowings.slice(0, 3), [borrowings])

  return (
    <Card className="bg-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <BookMarked className="h-5 w-5" />
            当前借阅
          </CardTitle>
          <CardDescription>您正在借阅的图书</CardDescription>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/borrows">
            查看全部
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {loading && (
            <div className="rounded-lg bg-secondary/40 p-4 text-sm text-muted-foreground">
              正在加载借阅记录...
            </div>
          )}

          {!loading && displayedBorrowings.length === 0 && (
            <div className="rounded-lg bg-secondary/40 p-6 text-center text-sm text-muted-foreground">
              当前暂无借阅图书
            </div>
          )}

          {!loading && displayedBorrowings.map((book) => {
            const statusView = getBorrowingStatusView(book.dueDate)
            const disabled = actionBorrowId === book.borrowId

            return (
              <div
                key={book.borrowId}
                className="flex items-center gap-4 rounded-lg bg-secondary/50 p-4 transition-colors hover:bg-secondary"
              >
                <div className="flex h-16 w-12 shrink-0 items-center justify-center rounded bg-secondary">
                  <BookOpen className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="line-clamp-1 font-medium">{book.bookTitle}</h4>
                  <p className="text-sm text-muted-foreground">{book.author}</p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>到期：{formatDate(book.dueDate)}</span>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  {statusView.overdue ? (
                    <Badge variant="destructive">{statusView.label}</Badge>
                  ) : statusView.days <= 7 ? (
                    <Badge className="bg-accent/20 text-accent hover:bg-accent/30">
                      {statusView.label}
                    </Badge>
                  ) : (
                    <Badge variant="secondary">{statusView.label}</Badge>
                  )}
                  <div className="mt-2 flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                      disabled={disabled || statusView.overdue || (book.renewalCount ?? 0) >= 1}
                      onClick={() => onRenew(book.borrowId)}
                    >
                      {(book.renewalCount ?? 0) >= 1 ? '已续借' : '续借'}
                    </Button>
                    <Button
                      size="sm"
                      className="h-7 text-xs"
                      disabled={disabled}
                      onClick={() => onReturn(book.borrowId)}
                    >
                      归还
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

export const CurrentBorrowingsCard = memo(CurrentBorrowingsCardComponent)
