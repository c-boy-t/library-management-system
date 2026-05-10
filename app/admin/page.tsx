"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  BookOpen, 
  Users, 
  BarChart3, 
  Settings, 
  Search,
  Plus,
  MoreHorizontal,
  TrendingUp,
  BookCopy,
  UserCheck,
  AlertTriangle,
  LogOut,
  Menu,
  ImagePlus,
  BookMarked,
  Home,
  FolderTree,
  Clock,
  Bell,
  FileText
} from "lucide-react"

const stats = [
  { label: "图书总数", value: "50,248", change: "+128", icon: BookOpen, color: "text-primary" },
  { label: "注册用户", value: "12,456", change: "+56", icon: Users, color: "text-chart-2" },
  { label: "今日借阅", value: "86", change: "+12", icon: BookMarked, color: "text-accent" },
  { label: "逾期图书", value: "23", change: "-5", icon: AlertTriangle, color: "text-destructive" },
]

const recentBorrows = [
  { id: 1, user: "张三", book: "深度学习入门", time: "10分钟前", status: "借出" },
  { id: 2, user: "李四", book: "人类简史", time: "25分钟前", status: "借出" },
  { id: 3, user: "王五", book: "三体", time: "1小时前", status: "归还" },
  { id: 4, user: "赵六", book: "算法导论", time: "2小时前", status: "借出" },
  { id: 5, user: "孙七", book: "红楼梦", time: "3小时前", status: "归还" },
]

const overdueBooks = [
  { id: 1, user: "张三", book: "三体", dueDate: "2026-04-24", days: 16, fine: 8.0 },
  { id: 2, user: "钱八", book: "百年孤独", dueDate: "2026-04-28", days: 12, fine: 6.0 },
  { id: 3, user: "周九", book: "活着", dueDate: "2026-05-01", days: 9, fine: 4.5 },
]

const books = [
  { id: 1, isbn: "9787115485588", title: "深度学习入门", author: "斋藤康毅", category: "计算机", stock: 5, total: 8 },
  { id: 2, isbn: "9787508647357", title: "人类简史", author: "尤瓦尔·赫拉利", category: "历史", stock: 3, total: 5 },
  { id: 3, isbn: "9787544291163", title: "百年孤独", author: "马尔克斯", category: "文学", stock: 0, total: 4 },
  { id: 4, isbn: "9787301172346", title: "经济学原理", author: "曼昆", category: "经济", stock: 8, total: 10 },
  { id: 5, isbn: "9787020002207", title: "三体", author: "刘慈欣", category: "文学", stock: 7, total: 12 },
]

const users = [
  { id: 1, name: "张三", email: "zhangsan@school.edu.cn", studentId: "2024001234", borrows: 3, status: "active" },
  { id: 2, name: "李四", email: "lisi@school.edu.cn", studentId: "2024001235", borrows: 2, status: "active" },
  { id: 3, name: "王五", email: "wangwu@school.edu.cn", studentId: "2024001236", borrows: 0, status: "active" },
  { id: 4, name: "赵六", email: "zhaoliu@school.edu.cn", studentId: "2024001237", borrows: 5, status: "locked" },
]

export default function AdminPage() {
  const [activeNav, setActiveNav] = useState("dashboard")
  const [showAddBookModal, setShowAddBookModal] = useState(false)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setCoverPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card hidden lg:block">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-border">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <BookOpen className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <span className="text-lg font-bold">智慧图书馆</span>
                <p className="text-xs text-muted-foreground">管理后台</p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            <button
              onClick={() => setActiveNav("dashboard")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                activeNav === "dashboard" ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
              }`}
            >
              <Home className="h-4 w-4" />
              仪表盘
            </button>
            <button
              onClick={() => setActiveNav("books")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                activeNav === "books" ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
              }`}
            >
              <BookOpen className="h-4 w-4" />
              图书管理
            </button>
            <button
              onClick={() => setActiveNav("categories")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                activeNav === "categories" ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
              }`}
            >
              <FolderTree className="h-4 w-4" />
              分类管理
            </button>
            <button
              onClick={() => setActiveNav("borrows")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                activeNav === "borrows" ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
              }`}
            >
              <BookMarked className="h-4 w-4" />
              借阅管理
            </button>
            <button
              onClick={() => setActiveNav("users")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                activeNav === "users" ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
              }`}
            >
              <Users className="h-4 w-4" />
              用户管理
            </button>
            <button
              onClick={() => setActiveNav("overdue")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                activeNav === "overdue" ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
              }`}
            >
              <Clock className="h-4 w-4" />
              逾期管理
              <Badge variant="destructive" className="ml-auto text-xs">23</Badge>
            </button>
            <button
              onClick={() => setActiveNav("reports")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                activeNav === "reports" ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              统计报表
            </button>
            <button
              onClick={() => setActiveNav("settings")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                activeNav === "settings" ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
              }`}
            >
              <Settings className="h-4 w-4" />
              系统设置
            </button>
          </nav>

          {/* User */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-primary/10 text-primary">管</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">管理员</p>
                <p className="text-xs text-muted-foreground truncate">admin@school.edu.cn</p>
              </div>
              <Button variant="ghost" size="icon" className="shrink-0">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 border-b border-border bg-card px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold">
              {activeNav === "dashboard" && "仪表盘"}
              {activeNav === "books" && "图书管理"}
              {activeNav === "categories" && "分类管理"}
              {activeNav === "borrows" && "借阅管理"}
              {activeNav === "users" && "用户管理"}
              {activeNav === "overdue" && "逾期管理"}
              {activeNav === "reports" && "统计报表"}
              {activeNav === "settings" && "系统设置"}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="搜索..."
                className="w-64 pl-10 bg-secondary"
              />
            </div>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-[10px] font-medium flex items-center justify-center text-destructive-foreground">
                5
              </span>
            </Button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-auto">
          {activeNav === "dashboard" && (
            <div className="space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat) => (
                  <Card key={stat.label} className="bg-card">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">{stat.label}</p>
                          <p className="text-3xl font-bold mt-1">{stat.value}</p>
                        </div>
                        <div className={`h-12 w-12 rounded-xl bg-secondary flex items-center justify-center`}>
                          <stat.icon className={`h-6 w-6 ${stat.color}`} />
                        </div>
                      </div>
                      <p className="text-sm mt-2">
                        <span className={stat.change.startsWith("+") ? "text-primary" : "text-destructive"}>
                          {stat.change}
                        </span>
                        <span className="text-muted-foreground"> 较昨日</span>
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Borrows */}
                <Card className="bg-card">
                  <CardHeader>
                    <CardTitle className="text-lg">最近借阅</CardTitle>
                    <CardDescription>实时借还记录</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentBorrows.map((item) => (
                        <div key={item.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-secondary text-xs">
                                {item.user[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">{item.user}</p>
                              <p className="text-xs text-muted-foreground">{item.book}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant={item.status === "借出" ? "default" : "secondary"}>
                              {item.status}
                            </Badge>
                            <p className="text-xs text-muted-foreground mt-1">{item.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Overdue */}
                <Card className="bg-card">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                      逾期图书
                    </CardTitle>
                    <CardDescription>需要处理的逾期借阅</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {overdueBooks.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-destructive/5">
                          <div>
                            <p className="text-sm font-medium">{item.book}</p>
                            <p className="text-xs text-muted-foreground">
                              借阅人：{item.user} · 到期：{item.dueDate}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge variant="destructive">逾期 {item.days} 天</Badge>
                            <p className="text-xs text-destructive mt-1">罚款 ¥{item.fine.toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeNav === "books" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="搜索图书..." className="pl-10 bg-card" />
                </div>
                <Button onClick={() => setShowAddBookModal(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  新增图书
                </Button>
              </div>

              <Card className="bg-card">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ISBN</TableHead>
                      <TableHead>书名</TableHead>
                      <TableHead>作者</TableHead>
                      <TableHead>分类</TableHead>
                      <TableHead>库存</TableHead>
                      <TableHead className="w-[80px]">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {books.map((book) => (
                      <TableRow key={book.id}>
                        <TableCell className="font-mono text-sm">{book.isbn}</TableCell>
                        <TableCell className="font-medium">{book.title}</TableCell>
                        <TableCell>{book.author}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{book.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <span className={book.stock === 0 ? "text-destructive" : ""}>
                            {book.stock}/{book.total}
                          </span>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>编辑</DropdownMenuItem>
                              <DropdownMenuItem>查看详情</DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">删除</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </div>
          )}

          {activeNav === "users" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="搜索用户..." className="pl-10 bg-card" />
                </div>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  新增用户
                </Button>
              </div>

              <Card className="bg-card">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>用户</TableHead>
                      <TableHead>学号</TableHead>
                      <TableHead>邮箱</TableHead>
                      <TableHead>当前借阅</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead className="w-[80px]">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                {user.name[0]}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{user.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{user.studentId}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.borrows}/5</TableCell>
                        <TableCell>
                          <Badge variant={user.status === "active" ? "default" : "destructive"}>
                            {user.status === "active" ? "正常" : "锁定"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
<DropdownMenuContent align="end">
                                              <DropdownMenuItem>重置密码</DropdownMenuItem>
                                              <DropdownMenuItem>
                                                {user.status === "active" ? "禁用账户" : "启用账户"}
                                              </DropdownMenuItem>
                                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </div>
          )}

          {(activeNav === "categories" || activeNav === "borrows" || activeNav === "overdue" || activeNav === "reports" || activeNav === "settings") && (
            <Card className="bg-card">
              <CardContent className="p-12 text-center">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {activeNav === "categories" && "分类管理"}
                  {activeNav === "borrows" && "借阅管理"}
                  {activeNav === "overdue" && "逾期管理"}
                  {activeNav === "reports" && "统计报表"}
                  {activeNav === "settings" && "系统设置"}
                </h3>
                <p className="text-muted-foreground">此页面为静态演示，功能开发中...</p>
              </CardContent>
            </Card>
          )}
        </main>
      </div>

      {/* 新增图书模态框 */}
      <Dialog open={showAddBookModal} onOpenChange={(open) => {
        setShowAddBookModal(open)
        if (!open) setCoverPreview(null)
      }}>
        <DialogContent className="sm:max-w-2xl bg-card border-border max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">新增图书信息</DialogTitle>
          </DialogHeader>
          <form className="space-y-5 mt-4">
            {/* 图书封面上传 */}
            <div className="space-y-2">
              <Label>图书封面</Label>
              <div className="flex items-start gap-4">
                <label 
                  htmlFor="cover-upload"
                  className="relative flex-shrink-0 w-32 h-44 rounded-lg border-2 border-dashed border-border bg-secondary/50 hover:bg-secondary hover:border-primary/50 transition-all cursor-pointer overflow-hidden group"
                >
                  {coverPreview ? (
                    <>
                      <img 
                        src={coverPreview} 
                        alt="封面预览" 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-sm text-white">更换封面</span>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                      <ImagePlus className="h-8 w-8 mb-2" />
                      <span className="text-xs">点击上传</span>
                    </div>
                  )}
                  <input
                    id="cover-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleCoverChange}
                  />
                </label>
                <div className="text-xs text-muted-foreground space-y-1 pt-2">
                  <p>支持 JPG、PNG 格式</p>
                  <p>建议尺寸 300x420 像素</p>
                  <p>文件大小不超过 2MB</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="isbn">ISBN</Label>
                <Input
                  id="isbn"
                  placeholder="请输入ISBN编号"
                  className="bg-secondary border-border"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bookTitle">书名</Label>
                <Input
                  id="bookTitle"
                  placeholder="请输入书名"
                  className="bg-secondary border-border"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="author">作者</Label>
                <Input
                  id="author"
                  placeholder="请输入作者"
                  className="bg-secondary border-border"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="publisher">出版社</Label>
                <Input
                  id="publisher"
                  placeholder="请输入出版社"
                  className="bg-secondary border-border"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">分类</Label>
                <Select>
                  <SelectTrigger className="bg-secondary border-border">
                    <SelectValue placeholder="请选择分类" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="computer">计算机</SelectItem>
                    <SelectItem value="history">历史</SelectItem>
                    <SelectItem value="literature">文学</SelectItem>
                    <SelectItem value="economics">经济</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="publishYear">出版年份</Label>
                <Input
                  id="publishYear"
                  type="number"
                  min="1900"
                  max={new Date().getFullYear()}
                  placeholder="如 2024"
                  className="bg-secondary border-border"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="stock">总库存</Label>
                <Input
                  id="stock"
                  type="number"
                  min="1"
                  placeholder="请输入总库存数量"
                  className="bg-secondary border-border"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">简介</Label>
              <Textarea
                id="description"
                placeholder="请输入图书简介..."
                className="bg-secondary border-border min-h-[100px] resize-none"
                rows={4}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                type="button" 
                variant="secondary" 
                className="flex-1"
                onClick={() => {
                  setShowAddBookModal(false)
                  setCoverPreview(null)
                }}
              >
                取消
              </Button>
              <Button type="submit" className="flex-1">
                确认添加
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
