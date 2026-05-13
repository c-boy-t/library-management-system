"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
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
  DialogDescription,
  DialogFooter,
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { ApiError } from "@/lib/api"
import {
  fetchAdminUsers,
  resetAdminUserPassword,
  updateAdminUserStatus,
  type AdminUser,
  type AdminUserPage,
} from "@/lib/admin-users"
import { logError } from "@/lib/logger"
import { useAuthStore } from "@/store/auth-store"
import {
  BookOpen,
  Users,
  BarChart3,
  Settings,
  Search,
  Plus,
  MoreHorizontal,
  AlertTriangle,
  LogOut,
  ImagePlus,
  BookMarked,
  Home,
  FolderTree,
  Clock,
  Bell,
  FileText,
  KeyRound,
  Ban,
  RotateCcw,
  Eye,
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

type UserStatusFilter = "all" | "1" | "0"

const emptyUserPage: AdminUserPage = {
  total: 0,
  pages: 0,
  pageNum: 1,
  pageSize: 10,
  list: [],
}

function getErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    return error.message
  }

  return "用户数据加载失败，请稍后重试"
}

function formatDateTime(date?: string | null) {
  if (!date) {
    return "-"
  }

  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(new Date(date))
}

function getUserStatusLabel(status: number) {
  return status === 1 ? "激活" : "禁用"
}

function getGenderLabel(gender?: number | null) {
  if (gender === 0) {
    return "女"
  }
  if (gender === 1) {
    return "男"
  }
  return "-"
}

function getVisiblePages(currentPage: number, totalPages: number) {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  const start = Math.max(1, Math.min(currentPage - 2, totalPages - 4))
  return Array.from({ length: 5 }, (_, index) => start + index)
}

export default function AdminPage() {
  const router = useRouter()
  const [activeNav, setActiveNav] = useState("users")
  const [showAddBookModal, setShowAddBookModal] = useState(false)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [nameInput, setNameInput] = useState("")
  const [statusInput, setStatusInput] = useState<UserStatusFilter>("all")
  const [userQuery, setUserQuery] = useState<{ realName: string; status: UserStatusFilter }>({
    realName: "",
    status: "all",
  })
  const [userPage, setUserPage] = useState<AdminUserPage>(emptyUserPage)
  const [userLoading, setUserLoading] = useState(false)
  const [userError, setUserError] = useState("")
  const [pageSize] = useState(5)
  const [detailUser, setDetailUser] = useState<AdminUser | null>(null)
  const [passwordUser, setPasswordUser] = useState<AdminUser | null>(null)
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [actionUserId, setActionUserId] = useState<number | null>(null)
  const token = useAuthStore((state) => state.token)
  const hydrated = useAuthStore((state) => state.hydrated)
  const { toast } = useToast()

  const loadUsers = useCallback(async (
    page = 1,
    query = userQuery,
  ) => {
    if (!token) {
      return
    }

    setUserLoading(true)
    setUserError("")
    try {
      const nextPage = await fetchAdminUsers(token, {
        page,
        size: pageSize,
        realName: query.realName,
        status: query.status === "all" ? undefined : Number(query.status),
      })
      setUserPage(nextPage)
    } catch (error) {
      logError("admin.users.load", error)
      setUserPage(emptyUserPage)
      setUserError(getErrorMessage(error))
    } finally {
      setUserLoading(false)
    }
  }, [pageSize, token, userQuery])

  const handleUserSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextQuery = {
      realName: nameInput.trim(),
      status: statusInput,
    }
    setUserQuery(nextQuery)
    void loadUsers(1, nextQuery)
  }

  const handleResetUserSearch = () => {
    const nextQuery = { realName: "", status: "all" as const }
    setNameInput("")
    setStatusInput("all")
    setUserQuery(nextQuery)
    void loadUsers(1, nextQuery)
  }

  const handleUserPageChange = (page: number) => {
    if (page < 1 || (userPage.pages > 0 && page > userPage.pages) || page === userPage.pageNum) {
      return
    }

    void loadUsers(page)
  }

  const handleToggleStatus = async (user: AdminUser) => {
    if (!token) {
      router.replace("/login")
      return
    }

    const nextStatus = user.status === 1 ? 0 : 1
    setActionUserId(user.userId)
    try {
      const updated = await updateAdminUserStatus(token, user.userId, nextStatus)
      setUserPage((currentPage) => ({
        ...currentPage,
        list: currentPage.list.map((item) => (item.userId === updated.userId ? updated : item)),
      }))
      setDetailUser((currentUser) => (currentUser?.userId === updated.userId ? updated : currentUser))
      toast({ title: "操作成功" })
    } catch (error) {
      logError("admin.users.status", error)
      toast({
        title: "操作失败",
        description: getErrorMessage(error),
        variant: "destructive",
      })
    } finally {
      setActionUserId(null)
    }
  }

  const handleResetPassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!token || !passwordUser) {
      return
    }

    setActionUserId(passwordUser.userId)
    try {
      await resetAdminUserPassword(token, passwordUser.userId, {
        newPassword,
        confirmPassword,
      })
      setPasswordUser(null)
      setNewPassword("")
      setConfirmPassword("")
      toast({ title: "操作成功" })
    } catch (error) {
      logError("admin.users.reset-password", error)
      toast({
        title: "重置失败",
        description: getErrorMessage(error),
        variant: "destructive",
      })
    } finally {
      setActionUserId(null)
    }
  }

  useEffect(() => {
    if (!hydrated && !token) {
      return
    }

    if (!token) {
      router.replace("/login")
      return
    }

    if (activeNav === "users") {
      void loadUsers(1)
    }
  }, [activeNav, hydrated, loadUsers, router, token])

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

  const visibleUserPages = getVisiblePages(userPage.pageNum, userPage.pages)

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
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${activeNav === "dashboard" ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
                }`}
            >
              <Home className="h-4 w-4" />
              仪表盘
            </button>
            <button
              onClick={() => setActiveNav("books")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${activeNav === "books" ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
                }`}
            >
              <BookOpen className="h-4 w-4" />
              图书管理
            </button>
            <button
              onClick={() => setActiveNav("categories")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${activeNav === "categories" ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
                }`}
            >
              <FolderTree className="h-4 w-4" />
              分类管理
            </button>
            <button
              onClick={() => setActiveNav("borrows")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${activeNav === "borrows" ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
                }`}
            >
              <BookMarked className="h-4 w-4" />
              借阅管理
            </button>
            <button
              onClick={() => setActiveNav("users")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${activeNav === "users" ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
                }`}
            >
              <Users className="h-4 w-4" />
              用户管理
            </button>
            <button
              onClick={() => setActiveNav("overdue")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${activeNav === "overdue" ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
                }`}
            >
              <Clock className="h-4 w-4" />
              逾期管理
              <Badge variant="destructive" className="ml-auto text-xs">23</Badge>
            </button>
            <button
              onClick={() => setActiveNav("reports")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${activeNav === "reports" ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
                }`}
            >
              <BarChart3 className="h-4 w-4" />
              统计报表
            </button>
            <button
              onClick={() => setActiveNav("settings")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${activeNav === "settings" ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
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
              <Card className="bg-card">
                <CardHeader>
                  <CardTitle className="text-lg">条件搜索</CardTitle>
                  <CardDescription>按真实姓名模糊匹配用户，并可限定账号状态。</CardDescription>
                </CardHeader>
                <CardContent>
                  <form
                    onSubmit={handleUserSearch}
                    className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(260px,1fr)_280px_auto]"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="user-name-search">姓名</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="user-name-search"
                          value={nameInput}
                          onChange={(event) => setNameInput(event.target.value)}
                          placeholder="请输入用户姓名"
                          className="pl-10 bg-secondary"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>状态</Label>
                      <Select
                        value={statusInput}
                        onValueChange={(value) => setStatusInput(value as UserStatusFilter)}
                      >
                        <SelectTrigger className="w-full bg-secondary">
                          <SelectValue placeholder="请选择状态" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">全部状态</SelectItem>
                          <SelectItem value="1">激活</SelectItem>
                          <SelectItem value="0">禁用</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end gap-2">
                      <Button type="submit" className="w-full md:w-auto">
                        <Search className="mr-2 h-4 w-4" />
                        搜索
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        aria-label="重置搜索"
                        onClick={handleResetUserSearch}
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              <Card className="bg-card">
                <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle className="text-lg">用户信息</CardTitle>
                    <CardDescription>
                      共 {userPage.total} 位用户，当前第 {userPage.pageNum || 1} / {Math.max(userPage.pages, 1)} 页
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {userError && (
                    <div className="border-t border-border p-8 text-center text-sm text-destructive">
                      {userError}
                    </div>
                  )}

                  {!userError && (
                    <>
                      <div className="hidden overflow-x-auto lg:block">
                        <Table className="table-auto">
                          <TableHeader>
                            <TableRow>
                              <TableHead className="min-w-[180px]">用户信息</TableHead>
                              <TableHead className="min-w-[180px]">联系方式</TableHead>
                              <TableHead className="min-w-[100px]">角色</TableHead>
                              <TableHead className="min-w-[110px]">账号状态</TableHead>
                              <TableHead className="min-w-[180px]">最后操作时间</TableHead>
                              <TableHead className="min-w-[260px] text-right">操作</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {userPage.list.map((user) => (
                              <TableRow key={user.userId}>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Avatar className="h-8 w-8">
                                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                        {(user.realName || user.username).slice(0, 1)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <p className="font-medium">{user.username}</p>
                                      <p className="text-xs text-muted-foreground">{user.realName || "-"}</p>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <p className="font-mono text-sm">{user.phone || "-"}</p>
                                  <p className="text-xs text-muted-foreground">{user.email || "-"}</p>
                                </TableCell>
                                <TableCell>
                                  <span
                                    className={`inline-flex rounded-md px-2.5 py-1 text-xs font-medium ${user.role === "admin"
                                      ? "bg-purple-500/15 text-purple-300"
                                      : "bg-blue-500/15 text-blue-300"
                                      }`}
                                  >
                                    {user.role || "-"}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <span
                                    className="inline-flex rounded-md px-2.5 py-1 text-xs font-medium text-white"
                                    style={{ backgroundColor: user.status === 1 ? "#52c41a" : "#ff4d4f" }}
                                  >
                                    {getUserStatusLabel(user.status)}
                                  </span>
                                </TableCell>
                                <TableCell className="font-mono text-sm text-muted-foreground">
                                  {formatDateTime(user.lastOperationTime)}
                                </TableCell>
                                <TableCell>
                                  <div className="flex justify-end gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-8"
                                      onClick={() => setDetailUser(user)}
                                    >
                                      <Eye className="mr-1.5 h-3.5 w-3.5" />
                                      详情
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-8"
                                      onClick={() => {
                                        setPasswordUser(user)
                                        setNewPassword("")
                                        setConfirmPassword("")
                                      }}
                                    >
                                      <KeyRound className="mr-1.5 h-3.5 w-3.5" />
                                      重置
                                    </Button>
                                    <Button
                                      variant={user.status === 1 ? "destructive" : "secondary"}
                                      size="sm"
                                      className="h-8"
                                      disabled={actionUserId === user.userId}
                                      onClick={() => {
                                        void handleToggleStatus(user)
                                      }}
                                    >
                                      <Ban className="mr-1.5 h-3.5 w-3.5" />
                                      {user.status === 1 ? "禁用" : "启用"}
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                            {!userLoading && userPage.list.length === 0 && (
                              <TableRow>
                                <TableCell colSpan={6} className="h-28 text-center text-muted-foreground">
                                  暂无匹配用户
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>

                      <div className="space-y-3 border-t border-border p-4 lg:hidden">
                        {userPage.list.map((user) => (
                          <div key={user.userId} className="rounded-lg bg-secondary/50 p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-9 w-9">
                                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                    {(user.realName || user.username).slice(0, 1)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">{user.username}</p>
                                  <p className="text-xs text-muted-foreground">{user.realName || "-"}</p>
                                </div>
                              </div>
                              <span
                                className="inline-flex rounded-md px-2.5 py-1 text-xs font-medium text-white"
                                style={{ backgroundColor: user.status === 1 ? "#52c41a" : "#ff4d4f" }}
                              >
                                {getUserStatusLabel(user.status)}
                              </span>
                            </div>
                            <div className="mt-4 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                              <span>电话：{user.phone || "-"}</span>
                              <span>角色：{user.role || "-"}</span>
                              <span className="sm:col-span-2">最后操作：{formatDateTime(user.lastOperationTime)}</span>
                            </div>
                            <div className="mt-4 flex flex-wrap gap-2">
                              <Button variant="outline" size="sm" onClick={() => setDetailUser(user)}>
                                <Eye className="mr-1.5 h-3.5 w-3.5" />
                                详情
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setPasswordUser(user)
                                  setNewPassword("")
                                  setConfirmPassword("")
                                }}
                              >
                                <KeyRound className="mr-1.5 h-3.5 w-3.5" />
                                重置
                              </Button>
                              <Button
                                variant={user.status === 1 ? "destructive" : "secondary"}
                                size="sm"
                                disabled={actionUserId === user.userId}
                                onClick={() => {
                                  void handleToggleStatus(user)
                                }}
                              >
                                <Ban className="mr-1.5 h-3.5 w-3.5" />
                                {user.status === 1 ? "禁用" : "启用"}
                              </Button>
                            </div>
                          </div>
                        ))}
                        {!userLoading && userPage.list.length === 0 && (
                          <div className="rounded-lg bg-secondary/40 p-8 text-center text-sm text-muted-foreground">
                            暂无匹配用户
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {userLoading && (
                    <div className="border-t border-border p-6 text-center text-sm text-muted-foreground">
                      正在加载用户数据...
                    </div>
                  )}

                  <div className="flex flex-col gap-3 border-t border-border p-4 md:flex-row md:items-center md:justify-between">
                    <p className="text-sm text-muted-foreground">
                      第 {userPage.pageNum || 1} 页，每页 {userPage.pageSize || pageSize} 条，共 {userPage.total} 条
                    </p>
                    <Pagination className="mx-0 w-auto justify-start md:justify-end">
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            href="#"
                            className={userPage.pageNum <= 1 ? "pointer-events-none opacity-50" : ""}
                            onClick={(event) => {
                              event.preventDefault()
                              handleUserPageChange(userPage.pageNum - 1)
                            }}
                          />
                        </PaginationItem>
                        {visibleUserPages.map((page) => (
                          <PaginationItem key={page}>
                            <PaginationLink
                              href="#"
                              isActive={page === userPage.pageNum}
                              onClick={(event) => {
                                event.preventDefault()
                                handleUserPageChange(page)
                              }}
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                        <PaginationItem>
                          <PaginationNext
                            href="#"
                            className={userPage.pageNum >= userPage.pages ? "pointer-events-none opacity-50" : ""}
                            onClick={(event) => {
                              event.preventDefault()
                              handleUserPageChange(userPage.pageNum + 1)
                            }}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                </CardContent>
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

      <Dialog open={Boolean(detailUser)} onOpenChange={(open) => !open && setDetailUser(null)}>
        <DialogContent className="bg-card border-border sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>用户详情</DialogTitle>
            <DialogDescription>
              {detailUser ? `${detailUser.realName || detailUser.username} 的账号档案` : ""}
            </DialogDescription>
          </DialogHeader>
          {detailUser && (
            <form className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="detail-username">用户名</Label>
                <Input id="detail-username" value={detailUser.username} readOnly className="bg-secondary" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="detail-real-name">真实姓名</Label>
                <Input id="detail-real-name" value={detailUser.realName || "-"} readOnly className="bg-secondary" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="detail-gender">性别</Label>
                <Input id="detail-gender" value={getGenderLabel(detailUser.gender)} readOnly className="bg-secondary" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="detail-phone">手机号</Label>
                <Input id="detail-phone" value={detailUser.phone || "-"} readOnly className="bg-secondary font-mono" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="detail-role">role</Label>
                <Input id="detail-role" value={detailUser.role || "-"} readOnly className="bg-secondary font-mono" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="detail-status">账号状态</Label>
                <Input id="detail-status" value={getUserStatusLabel(detailUser.status)} readOnly className="bg-secondary" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="detail-email">邮箱</Label>
                <Input id="detail-email" value={detailUser.email || "-"} readOnly className="bg-secondary" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="detail-locked-until">locked_until</Label>
                <Input
                  id="detail-locked-until"
                  value={formatDateTime(detailUser.lockedUntil)}
                  readOnly
                  className="bg-secondary font-mono"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="detail-address">地址</Label>
                <Input id="detail-address" value={detailUser.address || "-"} readOnly className="bg-secondary" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="detail-last-operated-at">最后操作时间</Label>
                <Input
                  id="detail-last-operated-at"
                  value={formatDateTime(detailUser.lastOperationTime)}
                  readOnly
                  className="bg-secondary font-mono"
                />
              </div>
              <DialogFooter className="sm:col-span-2">
                <Button type="button" onClick={() => setDetailUser(null)}>
                  关闭
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(passwordUser)}
        onOpenChange={(open) => {
          if (!open) {
            setPasswordUser(null)
            setNewPassword("")
            setConfirmPassword("")
          }
        }}
      >
        <DialogContent className="bg-card border-border sm:max-w-md">
          <DialogHeader>
            <DialogTitle>重置密码</DialogTitle>
            <DialogDescription>
              {passwordUser ? `${passwordUser.realName || passwordUser.username}（${passwordUser.username}）` : ""}
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={handleResetPassword}
          >
            <div className="space-y-2">
              <Label htmlFor="new-password">新密码</Label>
              <Input
                id="new-password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                type="password"
                placeholder="请输入新密码"
                className="bg-secondary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">确认新密码</Label>
              <Input
                id="confirm-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                type="password"
                placeholder="请再次输入新密码"
                className="bg-secondary"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setPasswordUser(null)}>
                取消
              </Button>
              <Button type="submit" disabled={passwordUser ? actionUserId === passwordUser.userId : false}>
                确认重置
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  )
}
