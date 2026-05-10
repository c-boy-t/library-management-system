import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  BookOpen,
  Search,
  Clock,
  Users,
  BookMarked,
  TrendingUp,
  ArrowRight,
  Star,
  Calendar,
  Sparkles,
} from "lucide-react"

const featuredBooks = [
  {
    id: 1,
    title: "深度学习入门",
    author: "斋藤康毅",
    category: "计算机科学",
    rating: 4.8,
    cover: "TP",
    available: true,
  },
  {
    id: 2,
    title: "人类简史",
    author: "尤瓦尔·赫拉利",
    category: "历史",
    rating: 4.9,
    cover: "K",
    available: true,
  },
  {
    id: 3,
    title: "百年孤独",
    author: "加西亚·马尔克斯",
    category: "文学",
    rating: 4.7,
    cover: "I",
    available: false,
  },
  {
    id: 4,
    title: "经济学原理",
    author: "曼昆",
    category: "经济学",
    rating: 4.6,
    cover: "F",
    available: true,
  },
]

const categories = [
  { name: "文学", code: "I", count: 2850, color: "bg-chart-1" },
  { name: "历史", code: "K", count: 1560, color: "bg-chart-2" },
  { name: "计算机", code: "TP", count: 980, color: "bg-chart-3" },
  { name: "经济学", code: "F", count: 1240, color: "bg-chart-4" },
  { name: "哲学", code: "B", count: 720, color: "bg-chart-5" },
  { name: "艺术", code: "J", count: 890, color: "bg-chart-1" },
]

const stats = [
  { label: "馆藏图书", value: "50,000+", icon: BookOpen },
  { label: "注册用户", value: "12,000+", icon: Users },
  { label: "日均借阅", value: "500+", icon: BookMarked },
  { label: "图书分类", value: "22", icon: TrendingUp },
]

export default function HomePage() {
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
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="搜索书名、作者、ISBN..."
                    className="h-14 pl-12 pr-32 text-base bg-card border-border rounded-xl"
                  />
                  <Button className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg">
                    搜索图书
                  </Button>
                </div>
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  <span className="text-sm text-muted-foreground">热门搜索:</span>
                  <Link href="/books?q=python" className="text-sm text-primary hover:underline">Python</Link>
                  <Link href="/books?q=人工智能" className="text-sm text-primary hover:underline">人工智能</Link>
                  <Link href="/books?q=数据结构" className="text-sm text-primary hover:underline">数据结构</Link>
                  <Link href="/books?q=微积分" className="text-sm text-primary hover:underline">微积分</Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="border-y border-border bg-card/50">
          <div className="container mx-auto px-4 py-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center space-y-2">
                  <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-primary/10 mx-auto">
                    <stat.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-3xl md:text-4xl font-bold">{stat.value}</div>
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
                <h2 className="text-2xl md:text-3xl font-bold">热门推荐</h2>
                <p className="text-muted-foreground mt-1">发现最受欢迎的图书</p>
              </div>
              <Button variant="ghost" asChild className="group">
                <Link href="/books">
                  查看全部
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredBooks.map((book) => (
                <Link key={book.id} href={`/books/${book.id}`}>
                  <Card className="group h-full hover:border-primary/50 transition-colors bg-card">
                    <CardContent className="p-5">
                      {/* Book Cover Placeholder */}
                      <div className="aspect-[3/4] rounded-lg bg-secondary flex items-center justify-center mb-4 group-hover:bg-secondary/80 transition-colors">
                        <span className="text-4xl font-bold text-muted-foreground/50">{book.cover}</span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary" className="text-xs">{book.category}</Badge>
                          <div className="flex items-center gap-1 text-sm">
                            <Star className="h-3.5 w-3.5 fill-accent text-accent" />
                            <span>{book.rating}</span>
                          </div>
                        </div>
                        <h3 className="font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                          {book.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">{book.author}</p>
                        <div className="pt-2">
                          {book.available ? (
                            <Badge className="bg-primary/10 text-primary hover:bg-primary/20">可借阅</Badge>
                          ) : (
                            <Badge variant="secondary">已借出</Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-20 bg-card/50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold">图书分类</h2>
              <p className="text-muted-foreground mt-1">按中图分类法浏览图书</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((category) => (
                <Link key={category.code} href={`/categories/${category.code}`}>
                  <Card className="group hover:border-primary/50 transition-colors bg-card h-full">
                    <CardContent className="p-6 text-center">
                      <div className={`inline-flex items-center justify-center h-14 w-14 rounded-xl ${category.color}/20 mb-4`}>
                        <span className="text-xl font-bold text-foreground">{category.code}</span>
                      </div>
                      <h3 className="font-semibold group-hover:text-primary transition-colors">{category.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{category.count.toLocaleString()} 本</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
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
