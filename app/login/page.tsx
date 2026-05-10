"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { BookOpen, Mail, Lock, ArrowRight, Smartphone } from "lucide-react"

export default function LoginPage() {
  const [showPhoneModal, setShowPhoneModal] = useState(false)
  const [countdown, setCountdown] = useState(0)

  const handleSendCode = () => {
    if (countdown > 0) return
    setCountdown(60)
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      {/* Background Pattern */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#1a1a1a_1px,transparent_1px),linear-gradient(to_bottom,#1a1a1a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
      
      <div className="w-full max-w-md relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <BookOpen className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold">智慧图书馆</span>
          </Link>
        </div>

        <Card className="bg-card border-border">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl">欢迎回来</CardTitle>
            <CardDescription>登录您的账户以继续</CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">邮箱 / 用户名</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="text"
                    placeholder="请输入邮箱或用户名"
                    className="pl-10 bg-secondary border-border"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">密码</Label>
                  <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                    忘记密码？
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="请输入密码"
                    className="pl-10 bg-secondary border-border"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox id="remember" />
                <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">
                  记住我
                </Label>
              </div>

              <Button type="submit" className="w-full h-11">
                登录
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>

            {/* 手机验证码登录按钮 */}
            <Button 
              variant="secondary" 
              className="w-full h-11"
              onClick={() => setShowPhoneModal(true)}
            >
              <Smartphone className="mr-2 h-4 w-4" />
              手机验证码登录
            </Button>

            {/* 分割线 */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-card px-3 text-muted-foreground">其他登录方式</span>
              </div>
            </div>

            {/* 微信登录按钮 */}
            <Button 
              variant="outline" 
              className="w-full h-11 border-[#07C160]/50 hover:bg-[#07C160]/10 hover:border-[#07C160] text-[#07C160]"
            >
              <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.89c-.135-.01-.269-.03-.407-.03zm-2.53 3.274c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982z"/>
              </svg>
              微信授权登录
            </Button>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          还没有账户？{" "}
          <Link href="/register" className="text-primary hover:underline font-medium">
            立即注册
          </Link>
        </p>

        <p className="text-center text-xs text-muted-foreground mt-4">
          <Link href="/" className="hover:text-foreground transition-colors">
            返回首页
          </Link>
        </p>
      </div>

      {/* 手机验证码登录模态框 */}
      <Dialog open={showPhoneModal} onOpenChange={setShowPhoneModal}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-xl">手机验证码登录</DialogTitle>
            <DialogDescription>
              输入您的手机号码，我们将发送验证码
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="phone">手机号码</Label>
              <div className="relative">
                <Smartphone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="请输入手机号码"
                  className="pl-10 bg-secondary border-border"
                  maxLength={11}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="code">验证码</Label>
              <div className="flex gap-3">
                <Input
                  id="code"
                  type="text"
                  placeholder="请输入验证码"
                  className="bg-secondary border-border flex-1"
                  maxLength={6}
                />
                <Button 
                  type="button"
                  variant="outline"
                  className="shrink-0 min-w-[110px]"
                  onClick={handleSendCode}
                  disabled={countdown > 0}
                >
                  {countdown > 0 ? `${countdown}s 后重发` : "发送验证码"}
                </Button>
              </div>
            </div>

            <Button type="submit" className="w-full h-11 mt-6">
              登录
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
