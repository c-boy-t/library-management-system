"use client"

import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  User,
  Mail,
  Phone,
  Lock,
  Bell,
  Shield,
  ArrowLeft,
} from "lucide-react"

export default function SettingsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Back Link */}
          <Button variant="ghost" asChild className="mb-6">
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回个人中心
            </Link>
          </Button>

          <div className="max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">账户设置</h1>

            <Tabs defaultValue="profile" className="space-y-6">
              <TabsList className="bg-card border border-border h-auto p-1 w-full justify-start">
                <TabsTrigger value="profile" className="px-4">
                  <User className="mr-2 h-4 w-4" />
                  个人信息
                </TabsTrigger>
                <TabsTrigger value="security" className="px-4">
                  <Shield className="mr-2 h-4 w-4" />
                  账户安全
                </TabsTrigger>
                <TabsTrigger value="notifications" className="px-4">
                  <Bell className="mr-2 h-4 w-4" />
                  通知设置
                </TabsTrigger>
              </TabsList>

              {/* Profile Tab */}
              <TabsContent value="profile">
                <Card className="bg-card">
                  <CardHeader>
                    <CardTitle>个人信息</CardTitle>
                    <CardDescription>管理您的个人资料信息</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Form */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="username">用户名</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            id="username"
                            defaultValue="zhangsan"
                            className="pl-10 bg-secondary"
                            disabled
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">用户名不可修改</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="realname">真实姓名</Label>
                        <Input
                          id="realname"
                          defaultValue="张三"
                          className="bg-secondary"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">邮箱</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            id="email"
                            type="email"
                            defaultValue="zhangsan@school.edu.cn"
                            className="pl-10 bg-secondary"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">手机号码</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            id="phone"
                            type="tel"
                            defaultValue="138****8888"
                            className="pl-10 bg-secondary"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="studentId">学号</Label>
                        <Input
                          id="studentId"
                          defaultValue="2024001234"
                          className="bg-secondary"
                          disabled
                        />
                        <p className="text-xs text-muted-foreground">学号不可修改</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="address">地址</Label>
                        <Input
                          id="address"
                          name="address"
                          defaultValue="北京市海淀区学院路 1 号"
                          className="bg-secondary"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button>保存修改</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Security Tab */}
              <TabsContent value="security">
                <Card className="bg-card">
                  <CardHeader>
                    <CardTitle>修改密码</CardTitle>
                    <CardDescription>定期更新密码以保护账户安全</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4 max-w-md">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">当前密码</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            id="currentPassword"
                            type="password"
                            placeholder="请输入当前密码"
                            className="pl-10 bg-secondary"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="newPassword">新密码</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            id="newPassword"
                            type="password"
                            placeholder="8-20位，需包含大小写字母和数字"
                            className="pl-10 bg-secondary"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">确认新密码</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            id="confirmPassword"
                            type="password"
                            placeholder="请再次输入新密码"
                            className="pl-10 bg-secondary"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button>更新密码</Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card mt-6">
                  <CardHeader>
                    <CardTitle>登录历史</CardTitle>
                    <CardDescription>查看最近的登录记录</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { time: "2026-05-10 14:30", device: "Chrome - Windows", ip: "192.168.1.xxx", current: true },
                        { time: "2026-05-09 09:15", device: "Safari - iOS", ip: "192.168.1.xxx", current: false },
                        { time: "2026-05-08 20:45", device: "Chrome - Windows", ip: "192.168.1.xxx", current: false },
                      ].map((record, index) => (
                        <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                          <div>
                            <p className="font-medium text-sm">{record.device}</p>
                            <p className="text-xs text-muted-foreground">
                              {record.time} · IP: {record.ip}
                            </p>
                          </div>
                          {record.current && (
                            <span className="text-xs text-primary font-medium">当前设备</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Notifications Tab */}
              <TabsContent value="notifications">
                <Card className="bg-card">
                  <CardHeader>
                    <CardTitle>通知偏好</CardTitle>
                    <CardDescription>选择您希望接收的通知类型</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">借阅到期提醒</p>
                          <p className="text-sm text-muted-foreground">在借阅到期前3天发送提醒</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <Separator />
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">逾期通知</p>
                          <p className="text-sm text-muted-foreground">图书逾期时发送通知</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <Separator />
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">预约到馆通知</p>
                          <p className="text-sm text-muted-foreground">预约的图书到馆时通知</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <Separator />
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">新书推荐</p>
                          <p className="text-sm text-muted-foreground">推送您可能感兴趣的新书</p>
                        </div>
                        <Switch />
                      </div>
                      
                      <Separator />
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">系统公告</p>
                          <p className="text-sm text-muted-foreground">图书馆重要公告和通知</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-medium mb-4">通知方式</h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Mail className="h-5 w-5 text-muted-foreground" />
                            <span>邮件通知</span>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Bell className="h-5 w-5 text-muted-foreground" />
                            <span>站内消息</span>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button>保存设置</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
