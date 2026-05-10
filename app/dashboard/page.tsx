import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import {
  BookOpen,
  Clock,
  AlertTriangle,
  BookMarked,
  Settings,
  History,
  Bell,
  ArrowRight,
  Calendar,
} from "lucide-react"

const user = {
  name: "张三",
  email: "zhangsan@school.edu.cn",
  studentId: "2024001234",
  borrowLimit: 5,
  currentBorrows: 3,
}

const currentBorrows = [
  {
    id: 1,
    title: "深度学习入门",
    author: "斋藤康毅",
    borrowDate: "2026-04-15",
    dueDate: "2026-05-15",
    daysLeft: 5,
    status: "normal",
  },
  {
    id: 2,
    title: "人类简史",
    author: "尤瓦尔·赫拉利",
    borrowDate: "2026-04-20",
    dueDate: "2026-05-20",
    daysLeft: 10,
    status: "normal",
  },
  {
    id: 3,
    title: "三体",
    author: "刘慈欣",
    borrowDate: "2026-03-25",
    dueDate: "2026-04-24",
    daysLeft: -16,
    status: "overdue",
  },
]

const recentHistory = [
  { id: 1, title: "Python编程：从入门到实践", returnDate: "2026-04-10" },
  { id: 2, title: "算法导论", returnDate: "2026-03-28" },
  { id: 3, title: "设计模式", returnDate: "2026-03-15" },
]

const notifications = [
  { id: 1, message: "《三体》已逾期16天，请尽快归还", type: "warning", time: "今天" },
  { id: 2, message: "《深度学习入门》将在5天后到期", type: "info", time: "昨天" },
  { id: 3, message: "您预约的《机器学习实战》已到馆", type: "success", time: "3天前" },
]

export default function DashboardPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Welcome Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-primary">
                <AvatarFallback className="bg-primary/10 text-primary text-xl">
                  {user.name[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold">你好，{user.name}</h1>
                <p className="text-muted-foreground">学号：{user.studentId}</p>
              </div>
            </div>
            <Button variant="outline" asChild>
              <Link href="/dashboard/settings">
                <Settings className="mr-2 h-4 w-4" />
                账户设置
              </Link>
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">当前借阅</p>
                    <p className="text-3xl font-bold mt-1">{user.currentBorrows}</p>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">借阅额度</span>
                    <span>{user.currentBorrows}/{user.borrowLimit}</span>
                  </div>
                  <Progress value={(user.currentBorrows / user.borrowLimit) * 100} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">即将到期</p>
                    <p className="text-3xl font-bold mt-1">2</p>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-accent/20 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-accent" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-4">7天内到期</p>
              </CardContent>
            </Card>

            <Card className="bg-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">逾期图书</p>
                    <p className="text-3xl font-bold mt-1 text-destructive">1</p>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                    <AlertTriangle className="h-6 w-6 text-destructive" />
                  </div>
                </div>
                <p className="text-sm text-destructive mt-4">罚款：¥8.00</p>
              </CardContent>
            </Card>

            <Card className="bg-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">历史借阅</p>
                    <p className="text-3xl font-bold mt-1">27</p>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-chart-3/20 flex items-center justify-center">
                    <History className="h-6 w-6 text-chart-3" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-4">累计借阅</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Current Borrows */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-card">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <BookMarked className="h-5 w-5" />
                      当前借阅
                    </CardTitle>
                    <CardDescription>您正在借阅的图书</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/dashboard/borrows">
                      查看全部
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {currentBorrows.map((book) => (
                      <div
                        key={book.id}
                        className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                      >
                        <div className="h-16 w-12 rounded bg-secondary flex items-center justify-center shrink-0">
                          <BookOpen className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium line-clamp-1">{book.title}</h4>
                          <p className="text-sm text-muted-foreground">{book.author}</p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>到期：{book.dueDate}</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          {book.status === "overdue" ? (
                            <Badge variant="destructive">
                              逾期 {Math.abs(book.daysLeft)} 天
                            </Badge>
                          ) : book.daysLeft <= 7 ? (
                            <Badge className="bg-accent/20 text-accent hover:bg-accent/30">
                              {book.daysLeft} 天后到期
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              {book.daysLeft} 天后到期
                            </Badge>
                          )}
                          <div className="mt-2 flex gap-2">
                            <Button size="sm" variant="outline" className="h-7 text-xs">
                              续借
                            </Button>
                            <Button size="sm" className="h-7 text-xs">
                              归还
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent History */}
              <Card className="bg-card">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <History className="h-5 w-5" />
                      借阅历史
                    </CardTitle>
                    <CardDescription>最近归还的图书</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/dashboard/history">
                      查看全部
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentHistory.map((book) => (
                      <div
                        key={book.id}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50 transition-colors"
                      >
                        <span className="font-medium">{book.title}</span>
                        <span className="text-sm text-muted-foreground">
                          归还于 {book.returnDate}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Notifications */}
              <Card className="bg-card">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Bell className="h-5 w-5" />
                    通知消息
                  </CardTitle>
                  <Badge variant="secondary">{notifications.length}</Badge>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className="p-3 rounded-lg bg-secondary/50 space-y-1"
                      >
                        <div className="flex items-start gap-2">
                          {notification.type === "warning" && (
                            <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                          )}
                          {notification.type === "info" && (
                            <Clock className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                          )}
                          {notification.type === "success" && (
                            <BookMarked className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                          )}
                          <p className="text-sm">{notification.message}</p>
                        </div>
                        <p className="text-xs text-muted-foreground pl-6">{notification.time}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="bg-card">
                <CardHeader>
                  <CardTitle className="text-base">快捷操作</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href="/books">
                      <BookOpen className="mr-2 h-4 w-4" />
                      浏览图书
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href="/dashboard/borrows">
                      <BookMarked className="mr-2 h-4 w-4" />
                      我的借阅
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href="/dashboard/settings">
                      <Settings className="mr-2 h-4 w-4" />
                      账户设置
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
