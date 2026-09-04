'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

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
import { getDashboardNotificationPageParams } from '@/lib/dashboard-notifications'
import { logError } from '@/lib/logger'
import {
  fetchNotifications,
  handleNotificationAction as submitNotificationAction,
  type NotificationItem,
} from '@/lib/notifications'
import { toast } from '@/hooks/use-toast'
import { useAuthStore } from '@/store/auth-store'

interface BorrowingStatusView {
  days: number
  overdue: boolean
  label: string
}

const emptySummary: BorrowingSummary = {
  currentBorrowingCount: 0,
  dueSoonCount: 0,
  overdueBookCount: 0,
  overdueFineAll: 0,
  historyBorrowingCount: 0,
}

function getErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    return error.message
  }

  return '操作失败，请稍后重试'
}

/**
 * 计算借阅状态标签。
 *
 * @param dueDate 到期时间
 * @returns 状态展示数据
 */
export function getBorrowingStatusView(dueDate: string): BorrowingStatusView {
  const due = new Date(dueDate).getTime()
  const now = Date.now()
  const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24))

  if (diffDays < 0) {
    return {
      days: Math.abs(diffDays),
      overdue: true,
      label: `逾期 ${Math.abs(diffDays)} 天`,
    }
  }

  return {
    days: diffDays,
    overdue: false,
    label: `${diffDays} 天后到期`,
  }
}

/**
 * 用户中心数据与借阅操作 Hook。
 */
export function useDashboardData() {
  const router = useRouter()
  const token = useAuthStore((state) => state.token)
  const user = useAuthStore((state) => state.user)
  const hydrated = useAuthStore((state) => state.hydrated)
  const [summary, setSummary] = useState<BorrowingSummary>(emptySummary)
  const [borrowings, setBorrowings] = useState<BorrowingRecord[]>([])
  const [historyBorrowings, setHistoryBorrowings] = useState<BorrowingRecord[]>([])
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [notificationTotal, setNotificationTotal] = useState(0)
  const [notificationsLoading, setNotificationsLoading] = useState(true)
  const [notificationActionId, setNotificationActionId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionBorrowId, setActionBorrowId] = useState<number | null>(null)

  const displayUser = useMemo(() => {
    const realName = user?.realName?.trim() || '读者'
    return {
      realName,
      username: user?.username || '',
      avatarText: realName.slice(0, 1),
    }
  }, [user])

  const loadDashboardData = useCallback(async () => {
    if (!token) {
      return
    }

    setLoading(true)
    try {
      const [nextSummary, borrowingPage] = await Promise.all([
        fetchMyBorrowingSummary(),
        fetchMyCurrentBorrowings(),
      ])
      setSummary(nextSummary)
      setBorrowings(borrowingPage.list)
    } catch (error) {
      logError('dashboard.load', error)
      toast({
        title: '加载失败',
        description: getErrorMessage(error),
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [token])

  const loadBorrowingHistory = useCallback(async () => {
    if (!token) {
      return
    }

    try {
      const historyPage = await fetchMyBorrowingHistory()
      setHistoryBorrowings(historyPage.list)
    } catch (error) {
      logError('dashboard.history.load', error)
      toast({
        title: '历史借阅加载失败',
        description: getErrorMessage(error),
        variant: 'destructive',
      })
    }
  }, [token])

  const loadNotifications = useCallback(async () => {
    if (!token) {
      return
    }

    setNotificationsLoading(true)
    try {
      const notificationPage = await fetchNotifications(getDashboardNotificationPageParams())
      setNotifications(notificationPage.list)
      setNotificationTotal(notificationPage.total)
    } catch (error) {
      logError('dashboard.notifications.load', error)
      toast({
        title: '通知加载失败',
        description: getErrorMessage(error),
        variant: 'destructive',
      })
    } finally {
      setNotificationsLoading(false)
    }
  }, [token])

  const handleRenew = useCallback(async (borrowId: number) => {
    if (!token) {
      router.replace('/login')
      return
    }

    setActionBorrowId(borrowId)
    try {
      const renewedBorrowing = await renewBorrowing(borrowId)
      setBorrowings((current) => current.map((borrowing) => (
        borrowing.borrowId === borrowId ? renewedBorrowing : borrowing
      )))
      toast({ title: '续借成功' })
    } catch (error) {
      logError('dashboard.renew', error)
      toast({
        title: '续借失败',
        description: getErrorMessage(error),
        variant: 'destructive',
      })
    } finally {
      setActionBorrowId(null)
    }
  }, [router, token])

  const handleReturn = useCallback(async (borrowId: number) => {
    if (!token) {
      router.replace('/login')
      return
    }

    setActionBorrowId(borrowId)
    try {
      const returnedBorrowing = await returnBorrowing(borrowId)
      setBorrowings((current) => current.filter((borrowing) => borrowing.borrowId !== borrowId))
      setHistoryBorrowings((current) => [returnedBorrowing, ...current]
        .sort((a, b) => new Date(b.returnDate ?? 0).getTime() - new Date(a.returnDate ?? 0).getTime())
        .slice(0, 3))
      toast({ title: '归还成功' })
      await loadDashboardData()
      await loadBorrowingHistory()
    } catch (error) {
      logError('dashboard.return', error)
      toast({
        title: '归还失败',
        description: getErrorMessage(error),
        variant: 'destructive',
      })
    } finally {
      setActionBorrowId(null)
    }
  }, [loadBorrowingHistory, loadDashboardData, router, token])

  const handleNotificationAction = useCallback(async (
    notificationId: number,
    action: 'RECEIVED' | 'IGNORED',
  ) => {
    if (!token) {
      router.replace('/login')
      return
    }

    setNotificationActionId(notificationId)
    try {
      const updated = await submitNotificationAction(notificationId, action)
      setNotifications((current) => current.map((notification) => (
        notification.notificationId === notificationId ? updated : notification
      )))
      toast({ title: action === 'RECEIVED' ? '已确认收到通知' : '已忽略通知' })
    } catch (error) {
      logError('dashboard.notifications.action', error)
      toast({
        title: '通知处理失败',
        description: getErrorMessage(error),
        variant: 'destructive',
      })
    } finally {
      setNotificationActionId(null)
    }
  }, [router, token])

  useEffect(() => {
    // 如果 token/user 已经从持久化 store 恢复，就直接加载数据；否则才等待 hydrated 完成。
    if (!hydrated && (!token || !user)) {
      return
    }

    if (!token || !user) {
      router.replace('/login')
      return
    }

    const timer = window.setTimeout(() => {
      void loadDashboardData()
      void loadBorrowingHistory()
      void loadNotifications()
    }, 0)

    return () => window.clearTimeout(timer)
  }, [hydrated, loadBorrowingHistory, loadDashboardData, loadNotifications, router, token, user])

  return {
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
  }
}
