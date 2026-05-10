"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { BookOpen, Search, Menu, X, User, Bell, Settings, LogOut } from "lucide-react"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoggedIn] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <BookOpen className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight">智慧图书馆</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            首页
          </Link>
          <Link href="/books" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            图书浏览
          </Link>
          <Link href="/categories" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            分类目录
          </Link>
          <Link href="/about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            关于我们
          </Link>
        </nav>

        {/* Search & Actions */}
        <div className="hidden md:flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="搜索图书..."
              className="w-64 pl-10 bg-secondary border-border"
            />
          </div>
          
          {isLoggedIn ? (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-medium flex items-center justify-center text-primary-foreground">
                  3
                </span>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      个人中心
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/borrows" className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      我的借阅
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/settings" className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      账户设置
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive">
                    <LogOut className="h-4 w-4 mr-2" />
                    退出登录
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
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

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="搜索图书..."
                className="w-full pl-10 bg-secondary border-border"
              />
            </div>
            <Link href="/" className="text-sm font-medium py-2 hover:text-primary transition-colors">
              首页
            </Link>
            <Link href="/books" className="text-sm font-medium py-2 hover:text-primary transition-colors">
              图书浏览
            </Link>
            <Link href="/categories" className="text-sm font-medium py-2 hover:text-primary transition-colors">
              分类目录
            </Link>
            <Link href="/about" className="text-sm font-medium py-2 hover:text-primary transition-colors">
              关于我们
            </Link>
            <div className="flex gap-2 pt-2 border-t border-border">
              <Button variant="ghost" className="flex-1" asChild>
                <Link href="/login">登录</Link>
              </Button>
              <Button className="flex-1" asChild>
                <Link href="/register">注册</Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
