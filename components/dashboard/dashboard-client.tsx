'use client'

import Link from 'next/link'
import { AlertTriangle, Bell, BookMarked, BookOpen, CheckCheck, Clock, History, Settings, ArrowRight } from 'lucide-react'

import { CurrentBorrowingsCard } from '@/components/dashboard/current-borrowings-card'
import { DashboardStats } from '@/components/dashboard/dashboard-stats'
import { DashboardWelcome } from '@/components/dashboard/dashboard-welcome'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useDashboardData } from '@/hooks/use-dashboard-data'

function formatDate(date: string) {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(date))
}

function formatDateTime(date?: string | null) {
  if (!date) {
    return '刚刚'
  }

  return new Intl.DateTimeFormat('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

function getNotificationIcon(type: string, actionRequired: boolean) {
  if (actionRequired || type === 'ADMIN_OVERDUE_REMINDER' || type === 'OVERDUE') {
    return <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
  }
  if (type === 'DUE_SOON') {
    return <Clock className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
  }
  if (type === 'RETURNED' || type === 'BORROW') {
    return <BookMarked className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
  }

  return <Bell className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
}

export function DashboardClient() {
  const {
    actionBorrowId,
    borrowings,
    displayUser,
    handleRenew,
    handleReturn,
    handleNotificationAction,
    historyBorrowings,
    loading,
    notificationActionId,
    notificationTotal,
    notifications,
    notificationsLoading,
    summary,
  } = useDashboardData()

  return (
    <div className="container mx-auto px-4 py-8">
      <DashboardWelcome
        avatarText={displayUser.avatarText}
        realName={displayUser.realName}
        username={displayUser.username}
      />

      <DashboardStats summary={summary} />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <CurrentBorrowingsCard
            actionBorrowId={actionBorrowId}
            borrowings={borrowings}
            loading={loading}
            onRenew={handleRenew}
            onReturn={handleReturn}
          />

          <Card className="bg-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  借阅历史
                </CardTitle>
                <CardDescription>最近归还的图书</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard/borrows">
                  查看全部
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {loading && (
                  <div className="rounded-lg bg-secondary/40 p-4 text-sm text-muted-foreground">
                    正在加载历史借阅...
                  </div>
                )}

                {!loading && historyBorrowings.length === 0 && (
                  <div className="rounded-lg bg-secondary/40 p-6 text-center text-sm text-muted-foreground">
                    暂无历史借阅记录
                  </div>
                )}

                {!loading && historyBorrowings.map((book) => (
                  <div
                    key={book.borrowId}
                    className="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-secondary/50"
                  >
                    <span className="line-clamp-1 font-medium">{book.bookTitle}</span>
                    <span className="shrink-0 text-sm text-muted-foreground">
                      归还于 {book.returnDate ? formatDate(book.returnDate) : '-'}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <Bell className="h-5 w-5" />
                通知消息
              </CardTitle>
              <Badge variant="secondary">{notificationTotal}</Badge>
            </CardHeader>
            <CardContent>
              <ScrollArea className="max-h-[22rem] pr-4 md:max-h-[28rem]">
                <div className="space-y-3">
                {notificationsLoading && (
                  <div className="rounded-lg bg-secondary/40 p-4 text-sm text-muted-foreground">
                    正在加载通知...
                  </div>
                )}

                {!notificationsLoading && notifications.length === 0 && (
                  <div className="rounded-lg bg-secondary/40 p-4 text-sm text-muted-foreground">
                    暂无通知消息
                  </div>
                )}

                {!notificationsLoading && notifications.map((notification) => (
                  <div key={notification.notificationId} className="space-y-3 rounded-lg bg-secondary/50 p-3">
                    <div className="flex items-start gap-2">
                      {getNotificationIcon(notification.notificationType, Boolean(notification.actionRequired))}
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="line-clamp-1 text-sm font-medium">{notification.title}</p>
                          {notification.actionStatus === 'RECEIVED' && (
                            <Badge variant="secondary" className="gap-1">
                              <CheckCheck className="h-3 w-3" />
                              已收到
                            </Badge>
                          )}
                          {notification.actionStatus === 'IGNORED' && (
                            <Badge variant="outline">已忽略</Badge>
                          )}
                        </div>
                        <p className="line-clamp-3 text-sm">{notification.content || '您有一条新的通知。'}</p>
                        <p className="text-xs text-muted-foreground">{formatDateTime(notification.actionTime || notification.createTime)}</p>
                      </div>
                    </div>

                    {notification.actionRequired && (
                      <div className="flex gap-2 pl-6">
                        <Button
                          size="sm"
                          disabled={notificationActionId === notification.notificationId}
                          onClick={() => { void handleNotificationAction(notification.notificationId, 'RECEIVED') }}
                        >
                          收到
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={notificationActionId === notification.notificationId}
                          onClick={() => { void handleNotificationAction(notification.notificationId, 'IGNORED') }}
                        >
                          忽略
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-base">快捷操作</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/books">
                  <BookOpen className="mr-2 h-4 w-4" />
                  浏览图书
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/dashboard/borrows">
                  <BookMarked className="mr-2 h-4 w-4" />
                  我的借阅
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/dashboard/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  账户设置
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
