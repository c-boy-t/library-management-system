'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import {
  BookOpen,
  Search,
  Clock,
  Users,
  BookMarked,
  TrendingUp,
  ArrowRight,
  Flame,
  Calendar,
  Sparkles,
} from 'lucide-react'
import { z } from 'zod'

import { Footer } from '@/components/footer'
import { Header } from '@/components/header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { requestJson } from '@/lib/api'
import { buildBooksPageHref } from '@/lib/book-discovery'
import { fetchCategories, type Category } from '@/lib/categories'
import { logError } from '@/lib/logger'
import { fetchHotBooks, fetchPublicStatsOverview, type HotBook, type PublicStats } from '@/lib/stats'

const latestBookItemSchema = z.object({
  bookId: z.number(),
  title: z.string(),
  author: z.string(),
  categoryName: z.string().nullable().optional(),
  coverUrl: z.string().nullable().optional(),
  availableCount: z.number().nullable().optional(),
})

const latestBookPageSchema = z.object({
  total: z.number(),
  pages: z.number(),
  pageNum: z.number(),
  pageSize: z.number(),
  list: z.array(latestBookItemSchema),
})

interface FeaturedBook {
  bookId: number
  title: string
  author: string
  categoryName?: string | null
  coverUrl?: string | null
  badgeLabel: string
  badgeTone: 'hot' | 'available' | 'unavailable'
}

// Tailwind 无法追踪运行时拼接的类名，徽章配色必须以完整字面量出现
const categoryBadgeColors = [
  'bg-chart-1/20',
  'bg-chart-2/20',
  'bg-chart-3/20',
  'bg-chart-4/20',
  'bg-chart-5/20',
]

function normalizeCoverUrl(coverUrl?: string | null) {
  if (!coverUrl) {
    return null
  }

  return /^https?:\/\//i.test(coverUrl) ? coverUrl : null
}

function toHotBookCard(book: HotBook): FeaturedBook {
  return {
    bookId: book.bookId,
    title: book.title,
    author: book.author,
    categoryName: book.categoryName,
    coverUrl: book.coverUrl,
    badgeLabel: `借阅 ${book.borrowCount} 次`,
    badgeTone: 'hot',
  }
}

function toLatestBookCard(book: z.infer<typeof latestBookItemSchema>): FeaturedBook {
  const available = (book.availableCount ?? 0) > 0
  return {
    bookId: book.bookId,
    title: book.title,
    author: book.author,
    categoryName: book.categoryName,
    coverUrl: book.coverUrl,
    badgeLabel: available ? '可借阅' : '已全部借出',
    badgeTone: available ? 'available' : 'unavailable',
  }
}

function BookCard({ book }: { book: FeaturedBook }) {
  const coverUrl = normalizeCoverUrl(book.coverUrl)

  return (
    <Link href={`/books/${book.bookId}`}>
      <Card className="group h-full hover:border-primary/50 transition-colors bg-card">
        <CardContent className="p-5">
          <div className="aspect-[3/4] rounded-lg bg-secondary flex items-center justify-center mb-4 overflow-hidden group-hover:bg-secondary/80 transition-colors">
            {coverUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={coverUrl} alt={book.title} className="h-full w-full object-cover" />
            ) : (
              <span className="text-4xl font-bold text-muted-foreground/50">{book.title.charAt(0)}</span>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Badge variant="secondary" className="text-xs">{book.categoryName || '未分类'}</Badge>
              {book.badgeTone === 'unavailable' ? (
                <Badge variant="secondary">已全部借出</Badge>
              ) : (
                <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
                  {book.badgeTone === 'hot' && <Flame className="mr-1 h-3 w-3" />}
                  {book.badgeLabel}
                </Badge>
              )}
            </div>
            <h3 className="font-semibold line-clamp-1 group-hover:text-primary transition-colors">
              {book.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-1">{book.author}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

function BookCardSkeleton() {
  return (
    <Card className="bg-card">
      <CardContent className="p-5">
        <div className="aspect-[3/4] rounded-lg bg-secondary animate-pulse mb-4" />
        <div className="h-4 w-1/2 rounded bg-secondary animate-pulse mb-2" />
        <div className="h-4 w-3/4 rounded bg-secondary animate-pulse" />
      </CardContent>
    </Card>
  )
}

export default function HomePage() {
  const [stats, setStats] = useState<PublicStats | null>(null)
  const [featuredBooks, setFeaturedBooks] = useState<FeaturedBook[]>([])
  const [booksSource, setBooksSource] = useState<'hot' | 'latest'>('hot')
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  const loadHomeData = useCallback(async () => {
    const [statsResult, hotResult, categoriesResult] = await Promise.allSettled([
      fetchPublicStatsOverview(),
      fetchHotBooks(4),
      fetchCategories(),
    ])

    if (statsResult.status === 'fulfilled') {
      setStats(statsResult.value)
    } else {
      logError('home.stats', statsResult.reason)
    }

    if (categoriesResult.status === 'fulfilled') {
      setCategories(categoriesResult.value.slice(0, 6))
    } else {
      logError('home.categories', categoriesResult.reason)
    }

    if (hotResult.status === 'fulfilled' && hotResult.value.length > 0) {
      setFeaturedBooks(hotResult.value.map(toHotBookCard))
      return
    }

    if (hotResult.status === 'rejected') {
      logError('home.hotBooks', hotResult.reason)
    }

    // 无借阅记录（或热门接口失败）时回退到最新上架图书
    try {
      const page = await requestJson('/api/v1/books?page=1&size=4', {
        method: 'GET',
      }, latestBookPageSchema)
      setFeaturedBooks(page.list.map(toLatestBookCard))
      setBooksSource('latest')
    } catch (error) {
      logError('home.latestBooks', error)
    }
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadHomeData().finally(() => setLoading(false))
    }, 0)

    return () => window.clearTimeout(timer)
  }, [loadHomeData])

  const statItems = [
    { label: '馆藏图书', value: stats?.bookTotal, icon: BookOpen },
    { label: '注册用户', value: stats?.userTotal, icon: Users },
    { label: '累计借阅', value: stats?.totalBorrowCount, icon: BookMarked },
    { label: '图书分类', value: stats?.categoryTotal, icon: TrendingUp },
  ]

  const booksSectionCopy = booksSource === 'hot'
    ? { title: '热门推荐', subtitle: '发现最受欢迎的图书' }
    : { title: '最新上架', subtitle: '最近加入馆藏的图书' }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1a1a1a_1px,transparent_1px),linear-gradient(to_bottom,#1a1a1a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

          <div className="container mx-auto px-4 py-24 md:py-32 relative">
            <div className="max-w-3xl mx-auto text-center space-y-8">
              <Badge variant="secondary" className="px-4 py-1.5">
                <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                智能图书管理系统
              </Badge>

              <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-balance">
                探索知识的海洋
                <br />
                <span className="text-primary">智慧图书馆</span>
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
                现代化的学校图书管理系统，为您提供便捷的图书检索、借阅服务，让知识触手可及。
              </p>

              {/* Search Bar */}
              <div className="max-w-xl mx-auto mt-8">
                <form action="/books" className="relative">
                  <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    name="search"
                    type="search"
                    placeholder="搜索书名、作者、ISBN..."
                    className="h-14 pl-12 pr-32 text-base bg-card border-border rounded-xl"
                  />
                  <Button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg">
                    搜索图书
                  </Button>
                </form>
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  <span className="text-sm text-muted-foreground">热门搜索:</span>
                  <Link href={buildBooksPageHref({ search: "python" })} className="text-sm text-primary hover:underline">Python</Link>
                  <Link href={buildBooksPageHref({ search: "人工智能" })} className="text-sm text-primary hover:underline">人工智能</Link>
                  <Link href={buildBooksPageHref({ search: "数据结构" })} className="text-sm text-primary hover:underline">数据结构</Link>
                  <Link href={buildBooksPageHref({ search: "微积分" })} className="text-sm text-primary hover:underline">微积分</Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="border-y border-border bg-card/50">
          <div className="container mx-auto px-4 py-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {statItems.map((stat) => (
                <div key={stat.label} className="text-center space-y-2">
                  <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-primary/10 mx-auto">
                    <stat.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-3xl md:text-4xl font-bold">
                    {typeof stat.value === 'number' ? stat.value.toLocaleString() : '—'}
                  </div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Books */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold">{booksSectionCopy.title}</h2>
                <p className="text-muted-foreground mt-1">{booksSectionCopy.subtitle}</p>
              </div>
              <Button variant="ghost" asChild className="group">
                <Link href="/books">
                  查看全部
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {loading ? (
                Array.from({ length: 4 }).map((_, index) => <BookCardSkeleton key={index} />)
              ) : featuredBooks.length > 0 ? (
                featuredBooks.map((book) => <BookCard key={book.bookId} book={book} />)
              ) : (
                <p className="col-span-full text-center text-muted-foreground py-8">暂无图书数据</p>
              )}
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-20 bg-card/50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold">图书分类</h2>
              <p className="text-muted-foreground mt-1">按分类浏览馆藏图书</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {loading ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <Card key={index} className="bg-card">
                    <CardContent className="p-6 text-center">
                      <div className="inline-flex h-14 w-14 rounded-xl bg-secondary animate-pulse mb-4" />
                      <div className="h-4 w-2/3 mx-auto rounded bg-secondary animate-pulse" />
                    </CardContent>
                  </Card>
                ))
              ) : categories.length > 0 ? (
                categories.map((category, index) => (
                  <Link key={category.categoryId} href={buildBooksPageHref({ category: category.categoryName })}>
                    <Card className="group hover:border-primary/50 transition-colors bg-card h-full">
                      <CardContent className="p-6 text-center">
                        <div className={`inline-flex items-center justify-center h-14 w-14 rounded-xl mb-4 ${categoryBadgeColors[index % categoryBadgeColors.length]}`}>
                          <span className="text-xl font-bold text-foreground">{category.categoryName.charAt(0)}</span>
                        </div>
                        <h3 className="font-semibold group-hover:text-primary transition-colors">{category.categoryName}</h3>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2 min-h-[2.5rem]">
                          {category.description || '点击浏览该分类图书'}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))
              ) : (
                <p className="col-span-full text-center text-muted-foreground py-8">暂无分类数据</p>
              )}
            </div>

            <div className="text-center mt-8">
              <Button variant="outline" asChild>
                <Link href="/categories">
                  查看全部分类
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold">为什么选择我们</h2>
              <p className="text-muted-foreground mt-1">现代化的图书管理体验</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="bg-card border-border">
                <CardContent className="p-8 text-center">
                  <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary/10 mb-6">
                    <Search className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">智能检索</h3>
                  <p className="text-muted-foreground">
                    支持书名、作者、ISBN等多维度搜索，快速找到您需要的图书。
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardContent className="p-8 text-center">
                  <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary/10 mb-6">
                    <Clock className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">便捷借阅</h3>
                  <p className="text-muted-foreground">
                    在线预约、借阅提醒、续借服务，让借阅更加便捷高效。
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardContent className="p-8 text-center">
                  <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary/10 mb-6">
                    <Calendar className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">到期提醒</h3>
                  <p className="text-muted-foreground">
                    自动发送借阅到期提醒，避免逾期罚款，贴心服务。
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-card/50">
          <div className="container mx-auto px-4">
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-8 md:p-12 text-center">
                <h2 className="text-2xl md:text-3xl font-bold mb-4">开始您的阅读之旅</h2>
                <p className="text-muted-foreground max-w-xl mx-auto mb-8">
                  注册成为会员，即可享受便捷的图书借阅服务。立即加入我们，探索知识的无限可能。
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" asChild>
                    <Link href="/register">
                      免费注册
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link href="/books">浏览图书</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
