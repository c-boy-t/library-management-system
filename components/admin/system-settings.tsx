"use client"

import { useCallback, useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { ApiError } from "@/lib/api"
import { useAuthStore } from "@/store/auth-store"
import { logError } from "@/lib/logger"
import {
  fetchSystemSettings,
  updateSystemSettings,
  type SystemSettings,
} from "@/lib/admin-settings"
import { Info } from "lucide-react"

const emptySettings: SystemSettings = {
  libraryName: "",
  contactEmail: "",
  phone: "",
}

function getErrorMessage(error: unknown) {
  if (error instanceof ApiError) return error.message
  return "加载失败，请稍后重试"
}

export default function SystemSettingsPage({ refreshKey }: { refreshKey: number }) {
  const [settings, setSettings] = useState<SystemSettings>(emptySettings)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const token = useAuthStore((state) => state.token)
  const { toast } = useToast()

  const loadSettings = useCallback(async () => {
    if (!token) return
    setLoading(true)
    setError("")
    try {
      const data = await fetchSystemSettings()
      setSettings(data)
    } catch (err) {
      logError("admin.settings.load", err)
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    const id = setTimeout(() => { loadSettings() }, 0)
    return () => clearTimeout(id)
  }, [loadSettings, refreshKey])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return
    setSaving(true)
    try {
      const updated = await updateSystemSettings({
        libraryName: settings.libraryName,
        contactEmail: settings.contactEmail,
        phone: settings.phone,
      })
      setSettings(updated)
      toast({ title: "保存成功", description: "系统设置已更新" })
    } catch (err) {
      logError("admin.settings.save", err)
      toast({ title: "保存失败", description: getErrorMessage(err), variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Tabs defaultValue="basic" className="space-y-6">
      <TabsList className="bg-card border border-border h-auto p-1 w-full justify-start">
        <TabsTrigger value="basic" className="px-4">
          <Info className="mr-2 h-4 w-4" />
          基本信息设置
        </TabsTrigger>
      </TabsList>

      <TabsContent value="basic">
        {loading ? (
          <div className="text-center text-sm text-muted-foreground py-12">正在加载设置...</div>
        ) : error ? (
          <div className="text-center text-sm text-destructive py-12">{error}</div>
        ) : (
          <Card className="bg-card">
            <CardHeader>
              <CardTitle>基本信息</CardTitle>
              <CardDescription>管理系统的基本信息配置。</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-6 max-w-lg">
                <div className="space-y-2">
                  <Label htmlFor="libraryName">图书馆名称</Label>
                  <Input
                    id="libraryName"
                    value={settings.libraryName}
                    onChange={(e) => setSettings((s) => ({ ...s, libraryName: e.target.value }))}
                    placeholder="请输入图书馆名称"
                    className="bg-secondary"
                    maxLength={100}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">联系邮箱</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={settings.contactEmail}
                    onChange={(e) => setSettings((s) => ({ ...s, contactEmail: e.target.value }))}
                    placeholder="请输入联系邮箱"
                    className="bg-secondary"
                    maxLength={100}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">联系电话</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={settings.phone}
                    onChange={(e) => setSettings((s) => ({ ...s, phone: e.target.value }))}
                    placeholder="请输入联系电话"
                    className="bg-secondary"
                    maxLength={20}
                  />
                </div>
                <div className="flex justify-end">
                  <Button type="submit" disabled={saving}>
                    {saving ? "保存中..." : "保存设置"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </TabsContent>
    </Tabs>
  )
}
