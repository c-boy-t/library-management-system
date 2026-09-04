"use client"

import { useState } from "react"
import { AlertTriangle, Loader2, Send } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ApiError } from "@/lib/api"
import { sendOverdueReminders } from "@/lib/notifications"
import { logError } from "@/lib/logger"
import { useToast } from "@/hooks/use-toast"
import { useAuthStore } from "@/store/auth-store"

function getErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    return error.message
  }

  return "操作失败，请稍后重试"
}

export function OverdueNotificationPanel() {
  const token = useAuthStore((state) => state.token)
  const { toast } = useToast()
  const [sending, setSending] = useState(false)

  const handleSend = async () => {
    if (!token) {
      return
    }

    setSending(true)
    try {
      const result = await sendOverdueReminders()
      toast({
        title: "逾期通知已发送",
        description: `目标用户 ${result.targetUserCount} 人，本次创建 ${result.createdNotificationCount} 条，跳过 ${result.skippedUserCount} 人。`,
      })
    } catch (error) {
      logError("admin.notifications.send-overdue", error)
      toast({
        title: "发送失败",
        description: getErrorMessage(error),
        variant: "destructive",
      })
    } finally {
      setSending(false)
    }
  }

  return (
    <Card className="bg-card">
      <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            逾期提醒操作
          </CardTitle>
          <CardDescription>一键通知所有存在逾期借阅记录的用户；用户处理后会通过弹窗实时提醒管理员。</CardDescription>
        </div>
        <Button disabled={sending} onClick={() => { void handleSend() }}>
          {sending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
          一键通知逾期用户
        </Button>
      </CardHeader>
      <CardContent>
        <p className="rounded-lg bg-secondary/40 p-4 text-sm text-muted-foreground">
          回执不再在此处列表展示；在线管理员会收到单条弹窗提醒，离线期间产生的未读回执会在重新进入后台后补发。
        </p>
      </CardContent>
    </Card>
  )
}
