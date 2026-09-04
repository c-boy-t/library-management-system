"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { BellRing } from "lucide-react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  markNotificationsRead,
  subscribeAdminOverdueAcks,
  type NotificationItem,
} from "@/lib/notifications"
import { logError } from "@/lib/logger"
import { useToast } from "@/hooks/use-toast"
import { useAuthStore } from "@/store/auth-store"

const AUTO_CLOSE_DELAY_MS = 5000

export function AdminOverdueAckDialog() {
  const token = useAuthStore((state) => state.token)
  const hydrated = useAuthStore((state) => state.hydrated)
  const { toast } = useToast()
  const [activeNotification, setActiveNotification] = useState<NotificationItem | null>(null)
  const seenNotificationIds = useRef(new Set<number>())
  const queuedNotifications = useRef<NotificationItem[]>([])
  const activeNotificationRef = useRef<NotificationItem | null>(null)

  const enqueueNotification = useCallback((notification: NotificationItem) => {
    if (notification.notificationType !== "ADMIN_OVERDUE_ACK") {
      return
    }
    if (seenNotificationIds.current.has(notification.notificationId)) {
      return
    }

    seenNotificationIds.current.add(notification.notificationId)
    if (activeNotificationRef.current) {
      queuedNotifications.current.push(notification)
      return
    }

    activeNotificationRef.current = notification
    setActiveNotification(notification)
  }, [])

  const closeActiveNotification = useCallback(async () => {
    const notification = activeNotificationRef.current
    if (!notification) {
      return
    }

    const nextNotification = queuedNotifications.current.shift() ?? null
    activeNotificationRef.current = nextNotification
    setActiveNotification(nextNotification)

    if (!token) {
      return
    }

    try {
      await markNotificationsRead([notification.notificationId])
    } catch (error) {
      logError("admin.notifications.ack-read", error)
      toast({
        title: "回执状态更新失败",
        description: "弹窗已关闭，但回执已读状态未能同步。",
        variant: "destructive",
      })
    }
  }, [token, toast])

  useEffect(() => {
    if (!activeNotification) {
      return
    }

    const timer = window.setTimeout(() => {
      void closeActiveNotification()
    }, AUTO_CLOSE_DELAY_MS)

    return () => window.clearTimeout(timer)
  }, [activeNotification, closeActiveNotification])

  useEffect(() => {
    if (!hydrated && !token) {
      return
    }
    if (!token) {
      return
    }

    const abortController = new AbortController()
    const unsubscribe = subscribeAdminOverdueAcks({
      signal: abortController.signal,
      onMessage: enqueueNotification,
      onError: (error) => {
        logError("admin.notifications.ack-stream", error)
      },
    })

    return () => {
      abortController.abort()
      unsubscribe()
    }
  }, [enqueueNotification, hydrated, token])

  return (
    <AlertDialog
      open={Boolean(activeNotification)}
      onOpenChange={(open) => {
        if (!open) {
          void closeActiveNotification()
        }
      }}
    >
      <AlertDialogContent className="border-primary/20 bg-card">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <BellRing className="h-5 w-5 text-primary" />
            用户回执提醒
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base text-foreground">
            {activeNotification?.content || "用户已收到逾期提醒。"}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction
            onClick={(event) => {
              event.preventDefault()
              void closeActiveNotification()
            }}
          >
            OK
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
