"use client"

import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BookOpen,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ArrowLeft,
  Calendar,
  RotateCcw,
  ArrowUpRight,
} from "lucide-react"

const currentBorrows = [
  {
    id: 1,
    title: "深度学习入门",
    author: "斋藤康毅",
    isbn: "9787115485588",
    borrowDate: "2026-04-15",
    dueDate: "2026-05-15",
    daysLeft: 5,
    status: "normal",
    renewed: false,
  },
  {
    id: 2,
    title: "人类简史",
    author: "尤瓦尔·赫拉利",
    isbn: "9787508647357",
    borrowDate: "2026-04-20",
    dueDate: "2026-05-20",
    daysLeft: 10,
    status: "normal",
    renewed: false,
  },
  {
    id: 3,
    title: "三体",
    author: "刘慈欣",
    isbn: "9787020002207",
    borrowDate: "2026-03-25",
    dueDate: "2026-04-24",
    daysLeft: -16,
    status: "overdue",
    renewed: true,
  },
]

const historyBorrows = [
  {
    id: 4,
    title: "Python编程：从入门到实践",
    author: "埃里克·马瑟斯",
    borrowDate: "2026-03-10",
    returnDate: "2026-04-10",
  },
  {
    id: 5,
    title: "算法导论",
    author: "Thomas H. Cormen",
    borrowDate: "2026-02-20",
    returnDate: "2026-03-28",
  },
  {
    id: 6,
    title: "设计模式",
    author: "Erich Gamma",
    borrowDate: "2026-02-01",
    returnDate: "2026-03-15",
  },
  {
    id: 7,
    title: "活着",
    author: "余华",
    borrowDate: "2026-01-15",
    returnDate: "2026-02-10",
  },
  {
    id: 8,
    title: "红楼梦",
    author: "曹雪芹",
    borrowDate: "2025-12-20",
    returnDate: "2026-01-20",
  },
]

export default function BorrowsPage() {
  const overdueCount = currentBorrows.filter(b => b.status === "overdue").length
  const nearDueCount = currentBorrows.filter(b => b.status === "normal" && b.daysLeft <= 7).length

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

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold">我的借阅</h1>
              <p className="text-muted-foreground">管理您的借阅图书</p>
            </div>
            
            <div className="flex gap-3">
              {overdueCount > 0 && (
                <Badge variant="destructive" className="h-8 px-3">
                  <AlertTriangle className="mr-1 h-3.5 w-3.5" />
                  {overdueCount} 本逾期
                </Badge>
              )}
              {nearDueCount > 0 && (
                <Badge className="h-8 px-3 bg-accent/20 text-accent">
                  <Clock className="mr-1 h-3.5 w-3.5" />
                  {nearDueCount} 本即将到期
                </Badge>
              )}
            </div>
          </div>

          <Tabs defaultValue="current" className="space-y-6">
            <TabsList className="bg-card border border-border h-auto p-1">
              <TabsTrigger value="current" className="px-4">
                <BookOpen className="mr-2 h-4 w-4" />
                当前借阅 ({currentBorrows.length})
              </TabsTrigger>
              <TabsTrigger value="history" className="px-4">
                <CheckCircle2 className="mr-2 h-4 w-4" />
                借阅历史 ({historyBorrows.length})
              </TabsTrigger>
            </TabsList>

            {/* Current Borrows */}
            <TabsContent value="current">
              <div className="space-y-4">
                {currentBorrows.map((book) => (
                  <Card key={book.id} className={`bg-card ${book.status === "overdue" ? "border-destructive/50" : ""}`}>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center gap-4">
                        {/* Book Cover */}
                        <div className="h-24 w-16 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                          <BookOpen className="h-8 w-8 text-muted-foreground" />
                        </div>

                        {/* Book Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <div>
                              <Link href={`/books/${book.id}`} className="font-semibold hover:text-primary transition-colors">
                                {book.title}
                              </Link>
                              <p className="text-sm text-muted-foreground">{book.author}</p>
                            </div>
                            {book.status === "overdue" ? (
                              <Badge variant="destructive">
                                逾期 {Math.abs(book.daysLeft)} 天
                              </Badge>
                            ) : book.daysLeft <= 7 ? (
                              <Badge className="bg-accent/20 text-accent shrink-0">
                                {book.daysLeft} 天后到期
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="shrink-0">
                                {book.daysLeft} 天后到期
                              </Badge>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>借阅：{book.borrowDate}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>到期：{book.dueDate}</span>
                            </div>
                            <div>
                              <span className="font-mono text-xs">ISBN: {book.isbn}</span>
                            </div>
                          </div>

                          {book.status === "overdue" && (
                            <div className="mt-3 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                              <AlertTriangle className="inline-block h-4 w-4 mr-2" />
                              此图书已逾期，罚款金额：¥{(Math.abs(book.daysLeft) * 0.5).toFixed(2)}
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex md:flex-col gap-2 shrink-0">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            disabled={book.renewed}
                            className="flex-1 md:flex-none"
                          >
                            <RotateCcw className="mr-2 h-4 w-4" />
                            {book.renewed ? "已续借" : "续借"}
                          </Button>
                          <Button size="sm" className="flex-1 md:flex-none">
                            归还
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {currentBorrows.length === 0 && (
                  <Card className="bg-card">
                    <CardContent className="p-12 text-center">
                      <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">暂无借阅</h3>
                      <p className="text-muted-foreground mb-4">您目前没有正在借阅的图书</p>
                      <Button asChild>
                        <Link href="/books">
                          浏览图书
                          <ArrowUpRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* History */}
            <TabsContent value="history">
              <Card className="bg-card">
                <CardHeader>
                  <CardTitle className="text-lg">借阅历史</CardTitle>
                  <CardDescription>已归还的图书记录</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {historyBorrows.map((book) => (
                      <div 
                        key={book.id} 
                        className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-9 rounded bg-secondary flex items-center justify-center shrink-0">
                            <BookOpen className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <Link href={`/books/${book.id}`} className="font-medium hover:text-primary transition-colors">
                              {book.title}
                            </Link>
                            <p className="text-sm text-muted-foreground">{book.author}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                            <span>已归还</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {book.borrowDate} ~ {book.returnDate}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  )
}
