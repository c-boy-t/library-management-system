import { memo, useMemo } from 'react'
import { AlertTriangle, BookOpen, Clock, History } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import type { BorrowingSummary } from '@/lib/borrowings'

interface DashboardStatsProps {
  summary: BorrowingSummary
}

function DashboardStatsComponent({ summary }: DashboardStatsProps) {
  const borrowLimit = 5
  const usagePercent = useMemo(
    () => Math.min((summary.currentBorrowingCount / borrowLimit) * 100, 100),
    [summary.currentBorrowingCount],
  )

  return (
    <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
      <Card className="bg-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">当前借阅</p>
              <p className="mt-1 text-3xl font-bold">{summary.currentBorrowingCount}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
          </div>
          <div className="mt-4">
            <div className="mb-1 flex justify-between text-sm">
              <span className="text-muted-foreground">借阅额度</span>
              <span>{summary.currentBorrowingCount}/{borrowLimit}</span>
            </div>
            <Progress value={usagePercent} className="h-2" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">即将到期</p>
              <p className="mt-1 text-3xl font-bold">{summary.dueSoonCount}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/20">
              <Clock className="h-6 w-6 text-accent" />
            </div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">7天内到期</p>
        </CardContent>
      </Card>

      <Card className="bg-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">逾期图书</p>
              <p className="mt-1 text-3xl font-bold text-destructive">{summary.overdueBookCount}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
          </div>
          <p className="mt-4 text-sm text-destructive">罚款：¥{summary.overdueFineAll.toFixed(2)}</p>
        </CardContent>
      </Card>

      <Card className="bg-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">历史借阅</p>
              <p className="mt-1 text-3xl font-bold">{summary.historyBorrowingCount}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-chart-3/20">
              <History className="h-6 w-6 text-chart-3" />
            </div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">累计借阅</p>
        </CardContent>
      </Card>
    </div>
  )
}

export const DashboardStats = memo(DashboardStatsComponent)
