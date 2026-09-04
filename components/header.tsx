"use client"

import Link from 'next/link'
import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  BookOpen,
  LogOut,
  Menu,
  Search,
  X,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { authLogout } from '@/lib/auth'
import { logError } from '@/lib/logger'
import { toast } from '@/hooks/use-toast'
import { useAuthStore } from '@/store/auth-store'

const desktopLinks = [
  { href: '/', label: '首页' },
  { href: '/books', label: '图书浏览' },
  { href: '/categories', label: '分类目录' },
  { href: '/about', label: '关于我们' },
]

/**
 * 全站顶部导航。
 */
export function Header() {
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const token = useAuthStore((state) => state.token)
  const user = useAuthStore((state) => state.user)
  const clearSession = useAuthStore((state) => state.clearSession)

  const isAuthenticated = Boolean(token && user)

  const handleLogout = useCallback(async () => {
    try {
      if (useAuthStore.getState().token) {
        await authLogout()
      }
      toast({
        title: '已退出登录',
        description: '欢迎下次再来',
      })
    } catch (error) {
      logError('auth.logout', error)
    } finally {
      clearSession()
      setIsMenuOpen(false)
      router.push('/login')
    }
  }, [clearSession, router])

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <BookOpen className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight">智慧图书馆</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {desktopLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="搜索图书..."
              className="w-64 bg-secondary pl-10"
            />
          </div>

          {isAuthenticated ? (
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => {
                void handleLogout()
              }}
            >
              <LogOut className="h-4 w-4" />
              退出登录
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" asChild>
                <Link href="/login">登录</Link>
              </Button>
              <Button asChild>
                <Link href="/register">注册</Link>
              </Button>
            </div>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {isMenuOpen ? (
        <div className="border-t border-border bg-background md:hidden">
          <nav className="container mx-auto flex flex-col gap-4 px-4 py-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="搜索图书..."
                className="w-full bg-secondary pl-10"
              />
            </div>

            {desktopLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="py-2 text-sm font-medium transition-colors hover:text-primary"
              >
                {item.label}
              </Link>
            ))}

            {isAuthenticated ? (
              <div className="border-t border-border pt-3">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={() => {
                    void handleLogout()
                  }}
                >
                  <LogOut className="h-4 w-4" />
                  退出登录
                </Button>
              </div>
            ) : (
              <div className="flex gap-2 border-t border-border pt-2">
                <Button variant="ghost" className="flex-1" asChild>
                  <Link href="/login">登录</Link>
                </Button>
                <Button className="flex-1" asChild>
                  <Link href="/register">注册</Link>
                </Button>
              </div>
            )}
          </nav>
        </div>
      ) : null}
    </header>
  )
}
