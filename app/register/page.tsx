"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { BookOpen, User, Mail, Lock, Phone, ArrowRight } from "lucide-react"

export default function RegisterPage() {
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
            <CardTitle className="text-2xl">创建账户</CardTitle>
            <CardDescription>注册成为图书馆会员</CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">用户名</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="username"
                      type="text"
                      placeholder="用户名"
                      className="pl-10 bg-secondary border-border"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="realname">真实姓名</Label>
                  <Input
                    id="realname"
                    type="text"
                    placeholder="真实姓名"
                    className="bg-secondary border-border"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">邮箱</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="请输入邮箱地址"
                    className="pl-10 bg-secondary border-border"
                  />
                </div>
                <p className="text-xs text-muted-foreground">用于接收借阅提醒和通知</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">手机号码（选填）</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="请输入手机号码"
                    className="pl-10 bg-secondary border-border"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">密码</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="8-20位，需包含大小写字母和数字"
                    className="pl-10 bg-secondary border-border"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">确认密码</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="请再次输入密码"
                    className="pl-10 bg-secondary border-border"
                  />
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Checkbox id="terms" className="mt-1" />
                <Label htmlFor="terms" className="text-sm font-normal cursor-pointer leading-relaxed">
                  我已阅读并同意{" "}
                  <Link href="/terms" className="text-primary hover:underline">服务条款</Link>
                  {" "}和{" "}
                  <Link href="/privacy" className="text-primary hover:underline">隐私政策</Link>
                </Label>
              </div>

              <Button type="submit" className="w-full h-11">
                注册
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          已有账户？{" "}
          <Link href="/login" className="text-primary hover:underline font-medium">
            立即登录
          </Link>
        </p>

        <p className="text-center text-xs text-muted-foreground mt-4">
          <Link href="/" className="hover:text-foreground transition-colors">
            返回首页
          </Link>
        </p>
      </div>
    </div>
  )
}
