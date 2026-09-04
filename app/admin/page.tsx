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
import { getAdminAccessDecision } from "@/lib/admin-access"
import { authLogout } from "@/lib/auth"
import { getBorrowingStatusMeta } from "@/lib/borrowing-status"
import { AdminOverdueAckDialog } from "@/components/admin/admin-overdue-ack-dialog"
import { BookManagement } from "@/components/admin/book-management"
import { OverdueNotificationPanel } from "@/components/admin/overdue-notification-panel"
import SystemSettingsPage from "@/components/admin/system-settings"
import {
  fetchAdminUsers,
  resetAdminUserPassword,
  updateAdminUserStatus,
  type AdminUser,
  type AdminUserPage,
} from "@/lib/admin-users"
import {
  fetchAdminStatisticsOverview,
  fetchAdminHotBooks,
  type StatisticsOverview,
  type HotBook,
} from "@/lib/admin-statistics"
import {
  fetchAdminBorrowingRecords,
  fetchAdminOverdueRecords,
  type AdminBorrowingPageParams,
  type BorrowingRecord,
  type BorrowingPage,
} from "@/lib/admin-borrowings"
import {
  createAdminCategory,
  updateAdminCategory,
  deleteAdminCategory,
  fetchAdminCategories,
  type CategoryPage,
} from "@/lib/admin-categories"
import { logError } from "@/lib/logger"
import { useAuthStore } from "@/store/auth-store"
import {
  BookOpen,
  Users,
  BarChart3,
  Settings,
  Search,
  AlertTriangle,
  LogOut,
  BookMarked,
  Home,
  FolderTree,
  Clock,
  Bell,
  KeyRound,
  Ban,
  RotateCcw,
  Eye,
  Pencil,
  Trash2,
  Library,
  CircleCheck,
  ArrowUpRight,
  UserPlus,
  Trophy,
  Download,
} from "lucide-react"

type UserStatusFilter = "all" | "1" | "0"

const emptyUserPage: AdminUserPage = {
  total: 0,
  pages: 0,
  pageNum: 1,
  pageSize: 10,
  list: [],
}

const emptyBorrowingPage: BorrowingPage = {
  total: 0,
  pages: 0,
  pageNum: 1,
  pageSize: 10,
  list: [],
}

type CategoryItem = CategoryPage['list'][number]

const emptyCategoryPage: CategoryPage = {
  total: 0,
  pages: 0,
  pageNum: 1,
  pageSize: 10,
  list: [],
}

const emptyOverview: StatisticsOverview = {
  bookTotal: 0,
  categoryTotal: 0,
  userTotal: 0,
  activeUserTotal: 0,
  activeBorrowingTotal: 0,
  overdueBorrowingTotal: 0,
  todayBorrowCount: 0,
  monthBorrowCount: 0,
  totalBorrowCount: 0,
  totalFineAmount: 0,
  availableBookTotal: 0,
  monthNewUserCount: 0,
}

function getErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    return error.message
  }
  return "数据加载失败，请稍后重试"
}

function formatDateTime(date?: string | null) {
  if (!date) return "-"
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

function formatDate(date?: string | null) {
  if (!date) return "-"
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(date))
}

function getUserStatusLabel(status: number) {
  return status === 1 ? "激活" : "禁用"
}

function getGenderLabel(gender?: number | null) {
  if (gender === 0) return "女"
  if (gender === 1) return "男"
  return "-"
}

function getBorrowingStatusBadge(status: string) {
  const meta = getBorrowingStatusMeta(status)
  return <Badge variant={meta.variant}>{meta.label}</Badge>
}

function getVisiblePages(currentPage: number, totalPages: number) {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }
  const start = Math.max(1, Math.min(currentPage - 2, totalPages - 4))
  return Array.from({ length: 5 }, (_, index) => start + index)
}

function getDaysOverdue(dueDate?: string | null) {
  if (!dueDate) return 0
  const now = Date.now()
  const due = new Date(dueDate).getTime()
  return Math.max(0, Math.ceil((now - due) / (1000 * 60 * 60 * 24)))
}

const VALID_TABS = ["dashboard", "books", "categories", "borrows", "users", "overdue", "reports", "settings"]

export default function AdminPage() {
  const router = useRouter()
  const [activeNav, setActiveNav] = useState("users")
  const [navRequestVersion, setNavRequestVersion] = useState(0)

  // ===== 仪表盘 state =====
  const [overview, setOverview] = useState<StatisticsOverview>(emptyOverview)
  const [dashboardLoading, setDashboardLoading] = useState(false)
  const [recentBorrowings, setRecentBorrowings] = useState<BorrowingRecord[]>([])
  const [recentOverdue, setRecentOverdue] = useState<BorrowingRecord[]>([])
  const [overviewError, setOverviewError] = useState("")

  // ===== 用户管理 state =====
  const [nameInput, setNameInput] = useState("")
  const [statusInput, setStatusInput] = useState<UserStatusFilter>("all")
  const [userQuery, setUserQuery] = useState<{ realName: string; status: UserStatusFilter }>({
    realName: "",
    status: "all",
  })
  const [userPage, setUserPage] = useState<AdminUserPage>(emptyUserPage)
  const [userLoading, setUserLoading] = useState(false)
  const [userError, setUserError] = useState("")
  const [pageSize] = useState(10)
  const [detailUser, setDetailUser] = useState<AdminUser | null>(null)
  const [passwordUser, setPasswordUser] = useState<AdminUser | null>(null)
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [actionUserId, setActionUserId] = useState<number | null>(null)

  // ===== 分类管理 state =====
  const [categoryPage, setCategoryPage] = useState<CategoryPage>(emptyCategoryPage)
  const [categoryLoading, setCategoryLoading] = useState(false)
  const [categoryError, setCategoryError] = useState("")
  const [categoryPageNum, setCategoryPageNum] = useState(1)
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)
  const [categoryForm, setCategoryForm] = useState({ categoryName: "", description: "" })
  const [categoryFormErrors, setCategoryFormErrors] = useState<{ categoryName?: string; description?: string }>({})
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null)
  const [categorySubmitting, setCategorySubmitting] = useState(false)

  // ===== 借阅管理 state =====
  const [borrowingPage, setBorrowingPage] = useState<BorrowingPage>(emptyBorrowingPage)
  const [borrowingLoading, setBorrowingLoading] = useState(false)
  const [borrowingError, setBorrowingError] = useState("")
  const [borrowingSearch, setBorrowingSearch] = useState("")
  const [borrowingStatusFilter, setBorrowingStatusFilter] = useState("all")
  const [borrowingPageNum, setBorrowingPageNum] = useState(1)

  // ===== 逾期管理 state =====
  const [overduePage, setOverduePage] = useState<BorrowingPage>(emptyBorrowingPage)
  const [overdueLoading, setOverdueLoading] = useState(false)
  const [overdueError, setOverdueError] = useState("")
  const [overdueSearch, setOverdueSearch] = useState("")
  const [overduePageNum, setOverduePageNum] = useState(1)

  // ===== 统计报表 state =====
  const [hotBooks, setHotBooks] = useState<HotBook[]>([])
  const [reportsLoading, setReportsLoading] = useState(false)

  const token = useAuthStore((state) => state.token)
  const user = useAuthStore((state) => state.user)
  const hydrated = useAuthStore((state) => state.hydrated)
  const clearSession = useAuthStore((state) => state.clearSession)
  const { toast } = useToast()
  const accessDecision = getAdminAccessDecision({ token, user, hydrated })

  const changeTab = useCallback((tab: string) => {
    setActiveNav(tab)
    setNavRequestVersion((current) => current + 1)
    if (typeof window !== "undefined") {
      const nextUrl = new URL(window.location.href)
      nextUrl.searchParams.set("tab", tab)
      window.history.replaceState(window.history.state, "", nextUrl)
    }
  }, [])

  const handleLogout = useCallback(async () => {
    try {
      if (token) {
        await authLogout()
      }
    } catch (error) {
      logError("admin.logout", error)
    } finally {
      clearSession()
      toast({ title: "已退出登录" })
      router.replace("/login")
    }
  }, [clearSession, router, toast, token])

  // Sync tab from URL on initial mount and browser back/forward
  useEffect(() => {
    const syncFromUrl = () => {
      const tab = new URLSearchParams(window.location.search).get("tab")
      if (tab && VALID_TABS.includes(tab)) {
        setActiveNav(tab)
      }
    }
    syncFromUrl()
    window.addEventListener("popstate", syncFromUrl)
    return () => window.removeEventListener("popstate", syncFromUrl)
  }, [])

  // ===== 仪表盘数据加载 =====
  const loadDashboard = useCallback(async () => {
    if (!token) return
    setDashboardLoading(true)
    setOverviewError("")
    try {
      const [ov, borrowings, overdue] = await Promise.all([
        fetchAdminStatisticsOverview(),
        fetchAdminBorrowingRecords({ page: 1, size: 5, sort: "createTime,desc" }),
        fetchAdminOverdueRecords({ page: 1, size: 5 }),
      ])
      setOverview(ov)
      setRecentBorrowings(borrowings.list)
      setRecentOverdue(overdue.list)
    } catch (error) {
      logError("admin.dashboard", error)
      setOverviewError(getErrorMessage(error))
    } finally {
      setDashboardLoading(false)
    }
  }, [token])

  // ===== 分类管理 =====
  function validateCategoryForm(form: { categoryName: string; description: string }) {
    const errors: { categoryName?: string; description?: string } = {}
    const name = form.categoryName.trim()
    if (!name) {
      errors.categoryName = "请输入分类名称"
    } else if (name.length > 50) {
      errors.categoryName = "分类名称最多 50 个字"
    }
    if (form.description.trim() && form.description.trim().length > 500) {
      errors.description = "描述最多 500 个字"
    }
    return errors
  }

  const loadCategories = useCallback(async (page: number) => {
    if (!token) return
    setCategoryLoading(true)
    setCategoryError("")
    try {
      const result = await fetchAdminCategories({ page, size: 10 })
      setCategoryPage(result)
      setCategoryPageNum(result.pageNum)
    } catch (error) {
      logError("admin.categories.load", error)
      setCategoryPage(emptyCategoryPage)
      setCategoryError(getErrorMessage(error))
    } finally {
      setCategoryLoading(false)
    }
  }, [token])

  const handleCategoryPageChange = (page: number) => {
    if (page < 1 || (categoryPage.pages > 0 && page > categoryPage.pages) || page === categoryPageNum) return
    void loadCategories(page)
  }

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    const errors = validateCategoryForm(categoryForm)
    setCategoryFormErrors(errors)
    if (Object.keys(errors).length > 0 || !token) return

    setCategorySubmitting(true)
    try {
      const payload = {
        categoryName: categoryForm.categoryName.trim(),
        description: categoryForm.description.trim() || undefined,
      }
      if (editingCategoryId) {
        await updateAdminCategory(editingCategoryId, payload)
        toast({ title: "修改成功" })
      } else {
        await createAdminCategory(payload)
        toast({ title: "新增成功" })
      }
      setCategoryDialogOpen(false)
      await loadCategories(categoryPageNum)
    } catch (error) {
      logError("admin.categories.save", error)
      toast({ title: "操作失败", description: getErrorMessage(error), variant: "destructive" })
    } finally {
      setCategorySubmitting(false)
    }
  }

  const handleDeleteCategory = async (cat: CategoryItem) => {
    if (!token) return
    if (!window.confirm(`确定删除分类「${cat.categoryName}」吗？`)) return
    try {
      await deleteAdminCategory(cat.categoryId)
      toast({ title: "删除成功" })
      const targetPage = categoryPage.list.length === 1 && categoryPageNum > 1
        ? categoryPageNum - 1
        : categoryPageNum
      await loadCategories(targetPage)
    } catch (error) {
      logError("admin.categories.delete", error)
      toast({ title: "删除失败", description: getErrorMessage(error), variant: "destructive" })
    }
  }

  // ===== 借阅管理 =====
  const loadAdminBorrowings = useCallback(async (page: number, search: string, status: string) => {
    if (!token) return
    setBorrowingLoading(true)
    setBorrowingError("")
    try {
      const params: AdminBorrowingPageParams = { page, size: 10, sort: "createTime,desc" }
      if (search.trim()) params.search = search.trim()
      if (status !== "all") params.status = status
      setBorrowingPage(await fetchAdminBorrowingRecords(params))
    } catch (error) {
      logError("admin.borrowings", error)
      setBorrowingPage(emptyBorrowingPage)
      setBorrowingError(getErrorMessage(error))
    } finally {
      setBorrowingLoading(false)
    }
  }, [token])

  const loadOverdueRecords = useCallback(async (page: number, search: string) => {
    if (!token) return
    setOverdueLoading(true)
    setOverdueError("")
    try {
      const params: AdminBorrowingPageParams = { page, size: 10 }
      if (search.trim()) params.search = search.trim()
      setOverduePage(await fetchAdminOverdueRecords(params))
    } catch (error) {
      logError("admin.overdue", error)
      setOverduePage(emptyBorrowingPage)
      setOverdueError(getErrorMessage(error))
    } finally {
      setOverdueLoading(false)
    }
  }, [token])

  // ===== 统计报表 =====
  const loadReports = useCallback(async () => {
    if (!token) return
    setReportsLoading(true)
    try {
      const [ov, hot] = await Promise.all([
        fetchAdminStatisticsOverview(),
        fetchAdminHotBooks(5),
      ])
      setOverview(ov)
      setHotBooks(hot)
    } catch (error) {
      logError("admin.reports", error)
      toast({ title: "统计加载失败", description: getErrorMessage(error), variant: "destructive" })
    } finally {
      setReportsLoading(false)
    }
  }, [toast, token])

  // ===== 用户管理 =====
  const loadUsers = useCallback(async (
    page = 1,
    query: { realName: string; status: UserStatusFilter },
  ) => {
    if (!token) return
    setUserLoading(true)
    setUserError("")
    try {
      const nextPage = await fetchAdminUsers({
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
  }, [pageSize, token])

  const handleUserSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextQuery = { realName: nameInput.trim(), status: statusInput }
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
    if (page < 1 || (userPage.pages > 0 && page > userPage.pages) || page === userPage.pageNum) return
    void loadUsers(page, userQuery)
  }

  const handleToggleStatus = async (user: AdminUser) => {
    if (!token) { router.replace("/login"); return }
    const nextStatus = user.status === 1 ? 0 : 1
    setActionUserId(user.userId)
    try {
      const updated = await updateAdminUserStatus(user.userId, nextStatus)
      setUserPage((p) => ({ ...p, list: p.list.map((item) => (item.userId === updated.userId ? updated : item)) }))
      setDetailUser((u) => (u?.userId === updated.userId ? updated : u))
      toast({ title: "操作成功" })
    } catch (error) {
      logError("admin.users.status", error)
      toast({ title: "操作失败", description: getErrorMessage(error), variant: "destructive" })
    } finally {
      setActionUserId(null)
    }
  }

  const handleResetPassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!token || !passwordUser) return
    setActionUserId(passwordUser.userId)
    try {
      await resetAdminUserPassword(passwordUser.userId, { newPassword, confirmPassword })
      setPasswordUser(null)
      setNewPassword("")
      setConfirmPassword("")
      toast({ title: "操作成功" })
    } catch (error) {
      logError("admin.users.reset-password", error)
      toast({ title: "重置失败", description: getErrorMessage(error), variant: "destructive" })
    } finally {
      setActionUserId(null)
    }
  }

  // ===== Auth guard + data loading =====
  useEffect(() => {
    if (accessDecision.kind === "wait") {
      return
    }

    if (accessDecision.kind === "redirect") {
      router.replace(accessDecision.href)
      return
    }

    const timer = window.setTimeout(() => {
      if (activeNav === "users") {
        void loadUsers(1, { realName: "", status: "all" })
      } else if (activeNav === "dashboard") {
        void loadDashboard()
      } else if (activeNav === "categories") {
        void loadCategories(1)
      } else if (activeNav === "borrows") {
        void loadAdminBorrowings(1, "", "all")
      } else if (activeNav === "overdue") {
        void loadOverdueRecords(1, "")
      } else if (activeNav === "reports") {
        void loadReports()
      }
    }, 0)

    return () => window.clearTimeout(timer)
  }, [accessDecision, activeNav, loadUsers, loadDashboard, loadCategories, loadAdminBorrowings, loadOverdueRecords, loadReports, navRequestVersion, router])

  const visibleUserPages = getVisiblePages(userPage.pageNum, userPage.pages)

  // ===== Stats card helpers =====
  const statsCards = [
    { label: "图书总数", value: overview.bookTotal.toLocaleString(), icon: BookOpen, color: "text-primary" },
    { label: "注册用户", value: overview.userTotal.toLocaleString(), icon: Users, color: "text-chart-2" },
    { label: "今日借阅", value: overview.todayBorrowCount.toString(), icon: BookMarked, color: "text-accent" },
    { label: "逾期图书", value: overview.overdueBorrowingTotal.toString(), icon: AlertTriangle, color: "text-destructive" },
  ]

  if (accessDecision.kind !== "allow") {
    return null
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card hidden lg:block">
        <div className="flex flex-col h-full">
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

          <nav className="flex-1 p-4 space-y-1">
            <button onClick={() => changeTab("dashboard")} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${activeNav === "dashboard" ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`}>
              <Home className="h-4 w-4" />仪表盘
            </button>
            <button onClick={() => changeTab("books")} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${activeNav === "books" ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`}>
              <BookOpen className="h-4 w-4" />图书管理
            </button>
            <button onClick={() => changeTab("categories")} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${activeNav === "categories" ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`}>
              <FolderTree className="h-4 w-4" />分类管理
            </button>
            <button onClick={() => changeTab("borrows")} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${activeNav === "borrows" ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`}>
              <BookMarked className="h-4 w-4" />借阅管理
            </button>
            <button onClick={() => changeTab("users")} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${activeNav === "users" ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`}>
              <Users className="h-4 w-4" />用户管理
            </button>
            <button onClick={() => changeTab("overdue")} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${activeNav === "overdue" ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`}>
              <Clock className="h-4 w-4" />逾期管理
              <Badge variant="destructive" className="ml-auto text-xs">{overview.overdueBorrowingTotal}</Badge>
            </button>
            <button onClick={() => changeTab("reports")} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${activeNav === "reports" ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`}>
              <BarChart3 className="h-4 w-4" />统计报表
            </button>
            <button onClick={() => changeTab("settings")} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${activeNav === "settings" ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`}>
              <Settings className="h-4 w-4" />系统设置
            </button>
          </nav>

          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-primary/10 text-primary">管</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.realName?.trim() || "管理员"}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email || user?.username || "管理员账户"}</p>
              </div>
              <Button variant="ghost" size="icon" className="shrink-0" onClick={() => { void handleLogout() }}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
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
            {activeNav === "reports" && (
              <Button variant="outline" size="sm" className="gap-2" onClick={() => toast({ title: "导出报表", description: "功能开发中..." })}>
                <Download className="h-4 w-4" />导出报表
              </Button>
            )}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
            </Button>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto">
          {/* ===== 仪表盘 ===== */}
          {activeNav === "dashboard" && (
            <div className="space-y-6">
              {dashboardLoading ? (
                <div className="text-center text-sm text-muted-foreground py-12">正在加载统计数据...</div>
              ) : overviewError ? (
                <div className="text-center text-sm text-destructive py-12">{overviewError}</div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {statsCards.map((stat) => (
                      <Card key={stat.label} className="bg-card">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-muted-foreground">{stat.label}</p>
                              <p className="text-3xl font-bold mt-1">{stat.value}</p>
                            </div>
                            <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center">
                              <stat.icon className={`h-6 w-6 ${stat.color}`} />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="bg-card">
                      <CardHeader>
                        <CardTitle className="text-lg">最近借阅</CardTitle>
                        <CardDescription>最新借阅记录</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {recentBorrowings.length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-4">暂无借阅记录</p>
                          )}
                          {recentBorrowings.map((item) => (
                            <div key={item.borrowId} className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback className="bg-secondary text-xs">
                                    {(item.realName || item.username || "?")[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="text-sm font-medium">{item.realName || item.username}</p>
                                  <p className="text-xs text-muted-foreground">{item.bookTitle}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                {getBorrowingStatusBadge(item.status)}
                                <p className="text-xs text-muted-foreground mt-1">{formatDate(item.borrowDate)}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-card">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-destructive" />逾期图书
                        </CardTitle>
                        <CardDescription>正在逾期的借阅</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {recentOverdue.length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-4">暂无逾期记录</p>
                          )}
                          {recentOverdue.map((item) => (
                            <div key={item.borrowId} className="flex items-center justify-between p-3 rounded-lg bg-destructive/5">
                              <div>
                                <p className="text-sm font-medium">{item.bookTitle}</p>
                                <p className="text-xs text-muted-foreground">
                                  借阅人：{item.realName || item.username} · 应还：{formatDate(item.dueDate)}
                                </p>
                              </div>
                              <div className="text-right">
                                <Badge variant="destructive">逾期 {getDaysOverdue(item.dueDate)} 天</Badge>
                                <p className="text-xs text-destructive mt-1">罚款 ¥{item.overdueFine?.toFixed(2) ?? "0.00"}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ===== 图书管理 ===== */}
          {activeNav === "books" && <BookManagement refreshKey={navRequestVersion} />}

          {/* ===== 分类管理 ===== */}
          {activeNav === "categories" && (
            <div className="space-y-6">
              <Card className="bg-card">
                <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle className="text-lg">分类列表</CardTitle>
                    <CardDescription>管理系统图书分类。</CardDescription>
                  </div>
                  <Button
                    onClick={() => {
                      setEditingCategoryId(null)
                      setCategoryForm({ categoryName: "", description: "" })
                      setCategoryFormErrors({})
                      setCategoryDialogOpen(true)
                    }}
                  >
                    新增分类
                  </Button>
                </CardHeader>
                <CardContent className="p-0">
                  {categoryError && (
                    <div className="mx-4 mt-4 rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                      {categoryError}
                    </div>
                  )}
                  {categoryLoading ? (
                    <div className="py-12 text-center text-sm text-muted-foreground">正在加载分类数据...</div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[100px]">ID</TableHead>
                          <TableHead>分类名称</TableHead>
                          <TableHead className="hidden md:table-cell">描述</TableHead>
                          <TableHead className="w-[160px] text-right">操作</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {categoryPage.list.map((cat) => (
                          <TableRow key={cat.categoryId}>
                            <TableCell className="font-mono text-sm">{cat.categoryId}</TableCell>
                            <TableCell className="font-medium">{cat.categoryName}</TableCell>
                            <TableCell className="hidden md:table-cell text-muted-foreground">
                              {cat.description || "-"}
                            </TableCell>
                            <TableCell>
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8"
                                  onClick={() => {
                                    setEditingCategoryId(cat.categoryId)
                                    setCategoryForm({
                                      categoryName: cat.categoryName,
                                      description: cat.description ?? "",
                                    })
                                    setCategoryFormErrors({})
                                    setCategoryDialogOpen(true)
                                  }}
                                >
                                  <Pencil className="mr-1.5 h-3.5 w-3.5" />编辑
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 text-destructive"
                                  onClick={() => void handleDeleteCategory(cat)}
                                >
                                  <Trash2 className="mr-1.5 h-3.5 w-3.5" />删除
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                        {!categoryLoading && categoryPage.list.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={4} className="h-28 text-center text-muted-foreground">
                              暂无分类数据
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
                {categoryPage.total > 0 && (
                  <div className="flex items-center justify-between border-t p-4">
                    <p className="text-sm text-muted-foreground">
                      每页 10 条，共 {categoryPage.total} 条
                    </p>
                    <Pagination className="mx-0 w-auto">
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            href="#"
                            className={categoryPageNum <= 1 ? "pointer-events-none opacity-50" : ""}
                            onClick={(e) => { e.preventDefault(); handleCategoryPageChange(categoryPageNum - 1) }}
                          />
                        </PaginationItem>
                        {getVisiblePages(categoryPage.pageNum, categoryPage.pages).map((p) => (
                          <PaginationItem key={p}>
                            <PaginationLink
                              href="#"
                              isActive={p === categoryPage.pageNum}
                              onClick={(e) => { e.preventDefault(); handleCategoryPageChange(p) }}
                            >
                              {p}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                        <PaginationItem>
                          <PaginationNext
                            href="#"
                            className={categoryPageNum >= categoryPage.pages ? "pointer-events-none opacity-50" : ""}
                            onClick={(e) => { e.preventDefault(); handleCategoryPageChange(categoryPageNum + 1) }}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </Card>

              <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
                <DialogContent className="bg-card border-border sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>{editingCategoryId ? "编辑分类" : "新增分类"}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSaveCategory} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="cat-name">分类名称</Label>
                      <Input
                        id="cat-name"
                        value={categoryForm.categoryName}
                        onChange={(e) => {
                          setCategoryForm((f) => ({ ...f, categoryName: e.target.value }))
                          if (categoryFormErrors.categoryName)
                            setCategoryFormErrors((prev) => ({ ...prev, categoryName: undefined }))
                        }}
                        placeholder="请输入分类名称"
                        className={`bg-secondary ${categoryFormErrors.categoryName ? "border-destructive" : ""}`}
                      />
                      {categoryFormErrors.categoryName && (
                        <p className="text-sm text-destructive">{categoryFormErrors.categoryName}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cat-desc">描述</Label>
                      <Textarea
                        id="cat-desc"
                        value={categoryForm.description}
                        onChange={(e) => {
                          setCategoryForm((f) => ({ ...f, description: e.target.value }))
                          if (categoryFormErrors.description)
                            setCategoryFormErrors((prev) => ({ ...prev, description: undefined }))
                        }}
                        placeholder="请输入分类描述"
                        className={`bg-secondary resize-none ${categoryFormErrors.description ? "border-destructive" : ""}`}
                        rows={3}
                      />
                      {categoryFormErrors.description && (
                        <p className="text-sm text-destructive">{categoryFormErrors.description}</p>
                      )}
                    </div>
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => { setCategoryDialogOpen(false); setCategoryFormErrors({}) }}
                      >
                        取消
                      </Button>
                      <Button type="submit" disabled={categorySubmitting}>
                        {categorySubmitting ? "处理中..." : editingCategoryId ? "保存" : "确认添加"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          )}

          {/* ===== 借阅管理 ===== */}
          {activeNav === "borrows" && (
            <div className="space-y-6">
              <Card className="bg-card">
                <CardHeader>
                  <CardTitle className="text-lg">借阅记录</CardTitle>
                  <CardDescription>管理全部借阅记录。</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-4 sm:flex-row">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        value={borrowingSearch}
                        onChange={(e) => setBorrowingSearch(e.target.value)}
                        placeholder="搜索用户名或书名..."
                        className="pl-10 bg-secondary"
                        onKeyDown={(e) => { if (e.key === "Enter") { setBorrowingPageNum(1); void loadAdminBorrowings(1, borrowingSearch, borrowingStatusFilter) } }}
                      />
                    </div>
                    <Select value={borrowingStatusFilter} onValueChange={(v) => { setBorrowingStatusFilter(v); setBorrowingPageNum(1); void loadAdminBorrowings(1, borrowingSearch, v) }}>
                      <SelectTrigger className="w-[140px] bg-secondary">
                        <SelectValue placeholder="全部状态" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">全部状态</SelectItem>
                        <SelectItem value="BORROWING">借出</SelectItem>
                        <SelectItem value="RETURNED">已还</SelectItem>
                        <SelectItem value="OVERDUE">逾期</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={() => { setBorrowingPageNum(1); void loadAdminBorrowings(1, borrowingSearch, borrowingStatusFilter) }}>
                      <Search className="mr-2 h-4 w-4" />搜索
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card">
                <CardHeader>
                  <CardDescription>
                    共 {borrowingPage.total} 条记录，第 {borrowingPage.pageNum} / {Math.max(borrowingPage.pages, 1)} 页
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {borrowingError && (
                    <div className="p-8 text-center text-sm text-destructive">{borrowingError}</div>
                  )}
                  {!borrowingError && (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>借阅人</TableHead>
                          <TableHead>图书</TableHead>
                          <TableHead>借阅日期</TableHead>
                          <TableHead>应还日期</TableHead>
                          <TableHead>状态</TableHead>
                          <TableHead className="text-right">罚款</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {borrowingPage.list.map((r) => (
                          <TableRow key={r.borrowId}>
                            <TableCell>
                              <p className="font-medium">{r.realName || r.username}</p>
                            </TableCell>
                            <TableCell>
                              <p className="font-medium">{r.bookTitle}</p>
                              <p className="text-xs text-muted-foreground">{r.author}</p>
                            </TableCell>
                            <TableCell className="font-mono text-sm">{formatDate(r.borrowDate)}</TableCell>
                            <TableCell className="font-mono text-sm">{formatDate(r.dueDate)}</TableCell>
                            <TableCell>{getBorrowingStatusBadge(r.status)}</TableCell>
                            <TableCell className="text-right font-mono text-sm">
                              ¥{r.overdueFine?.toFixed(2) ?? "0.00"}
                            </TableCell>
                          </TableRow>
                        ))}
                        {!borrowingLoading && borrowingPage.list.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={6} className="h-28 text-center text-muted-foreground">暂无借阅记录</TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  )}
                  {borrowingLoading && (
                    <div className="py-12 text-center text-sm text-muted-foreground">正在加载借阅数据...</div>
                  )}
                  <div className="flex items-center justify-between border-t p-4">
                    <p className="text-sm text-muted-foreground">每页 10 条，共 {borrowingPage.total} 条</p>
                    <Pagination className="mx-0 w-auto">
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious href="#" className={borrowingPageNum <= 1 ? "pointer-events-none opacity-50" : ""}
                            onClick={(e) => { e.preventDefault(); const p = borrowingPageNum - 1; setBorrowingPageNum(p); void loadAdminBorrowings(p, borrowingSearch, borrowingStatusFilter) }} />
                        </PaginationItem>
                        {getVisiblePages(borrowingPageNum, borrowingPage.pages).map((p) => (
                          <PaginationItem key={p}>
                            <PaginationLink href="#" isActive={p === borrowingPageNum}
                              onClick={(e) => { e.preventDefault(); setBorrowingPageNum(p); void loadAdminBorrowings(p, borrowingSearch, borrowingStatusFilter) }}>
                              {p}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                        <PaginationItem>
                          <PaginationNext href="#" className={borrowingPageNum >= borrowingPage.pages ? "pointer-events-none opacity-50" : ""}
                            onClick={(e) => { e.preventDefault(); const p = borrowingPageNum + 1; setBorrowingPageNum(p); void loadAdminBorrowings(p, borrowingSearch, borrowingStatusFilter) }} />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ===== 用户管理 ===== */}
          {activeNav === "users" && (
            <div className="space-y-6">
              <Card className="bg-card">
                <CardHeader>
                  <CardTitle className="text-lg">条件搜索</CardTitle>
                  <CardDescription>按真实姓名模糊匹配用户，并可限定账号状态。</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUserSearch} className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(260px,1fr)_280px_auto]">
                    <div className="space-y-2">
                      <Label htmlFor="user-name-search">姓名</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input id="user-name-search" value={nameInput} onChange={(e) => setNameInput(e.target.value)}
                          placeholder="请输入用户姓名" className="pl-10 bg-secondary" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>状态</Label>
                      <Select value={statusInput} onValueChange={(v) => setStatusInput(v as UserStatusFilter)}>
                        <SelectTrigger className="w-full bg-secondary"><SelectValue placeholder="请选择状态" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">全部状态</SelectItem>
                          <SelectItem value="1">激活</SelectItem>
                          <SelectItem value="0">禁用</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end gap-2">
                      <Button type="submit" className="w-full md:w-auto"><Search className="mr-2 h-4 w-4" />搜索</Button>
                      <Button type="button" variant="outline" size="icon" aria-label="重置搜索" onClick={handleResetUserSearch}>
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
                  {userError && (<div className="border-t border-border p-8 text-center text-sm text-destructive">{userError}</div>)}
                  {!userError && (
                    <>
                      <div className="hidden overflow-x-auto lg:block">
                        <Table className="block w-full">
                          <TableHeader className="block">
                            <TableRow className="flex w-full">
                              <TableHead className="flex-[2_1_0%] text-left">用户信息</TableHead>
                              <TableHead className="flex-[2_1_0%] text-left">联系方式</TableHead>
                              <TableHead className="flex-[1_1_0%] text-center">角色</TableHead>
                              <TableHead className="flex-[1_1_0%] text-center">账号状态</TableHead>
                              <TableHead className="flex-[1.6_1_0%] text-center">最后操作时间</TableHead>
                              <TableHead className="flex-[2.4_1_0%] text-right">操作</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody className="block">
                            {userPage.list.map((user) => (
                              <TableRow key={user.userId} className="flex w-full">
                                <TableCell className="flex-[2_1_0%] text-left">
                                  <div className="flex items-center gap-2">
                                    <Avatar className="h-8 w-8"><AvatarFallback className="bg-primary/10 text-primary text-xs">{(user.realName || user.username).slice(0, 1)}</AvatarFallback></Avatar>
                                    <div><p className="font-medium">{user.username}</p><p className="text-xs text-muted-foreground">{user.realName || "-"}</p></div>
                                  </div>
                                </TableCell>
                                <TableCell className="flex-[2_1_0%] text-left"><p className="font-mono text-sm">{user.phone || "-"}</p><p className="text-xs text-muted-foreground">{user.email || "-"}</p></TableCell>
                                <TableCell className="flex-[1_1_0%] text-center"><span className={`inline-flex rounded-md px-2.5 py-1 text-xs font-medium ${user.role === "admin" ? "bg-purple-500/15 text-purple-300" : "bg-blue-500/15 text-blue-300"}`}>{user.role || "-"}</span></TableCell>
                                <TableCell className="flex-[1_1_0%] text-center"><span className="inline-flex rounded-md px-2.5 py-1 text-xs font-medium text-white" style={{ backgroundColor: user.status === 1 ? "#52c41a" : "#ff4d4f" }}>{getUserStatusLabel(user.status)}</span></TableCell>
                                <TableCell className="flex-[1.6_1_0%] text-center font-mono text-sm text-muted-foreground">{formatDateTime(user.lastOperationTime)}</TableCell>
                                <TableCell className="flex-[2.4_1_0%] text-right">
                                  <div className="flex justify-end gap-2">
                                    <Button variant="outline" size="sm" className="h-8" onClick={() => setDetailUser(user)}><Eye className="mr-1.5 h-3.5 w-3.5" />详情</Button>
                                    <Button variant="outline" size="sm" className="h-8" onClick={() => { setPasswordUser(user); setNewPassword(""); setConfirmPassword("") }}><KeyRound className="mr-1.5 h-3.5 w-3.5" />重置</Button>
                                    <Button variant={user.status === 1 ? "destructive" : "secondary"} size="sm" className="h-8" disabled={actionUserId === user.userId} onClick={() => { void handleToggleStatus(user) }}>
                                      <Ban className="mr-1.5 h-3.5 w-3.5" />{user.status === 1 ? "禁用" : "启用"}
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                            {!userLoading && userPage.list.length === 0 && (
                              <TableRow className="flex w-full"><TableCell colSpan={6} className="h-28 flex-1 text-center text-muted-foreground">暂无匹配用户</TableCell></TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                      {/* Mobile cards */}
                      <div className="space-y-3 border-t border-border p-4 lg:hidden">
                        {userPage.list.map((user) => (
                          <div key={user.userId} className="rounded-lg bg-secondary/50 p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-9 w-9"><AvatarFallback className="bg-primary/10 text-primary text-xs">{(user.realName || user.username).slice(0, 1)}</AvatarFallback></Avatar>
                                <div><p className="font-medium">{user.username}</p><p className="text-xs text-muted-foreground">{user.realName || "-"}</p></div>
                              </div>
                              <span className="inline-flex rounded-md px-2.5 py-1 text-xs font-medium text-white" style={{ backgroundColor: user.status === 1 ? "#52c41a" : "#ff4d4f" }}>{getUserStatusLabel(user.status)}</span>
                            </div>
                            <div className="mt-4 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                              <span>电话：{user.phone || "-"}</span><span>角色：{user.role || "-"}</span>
                              <span className="sm:col-span-2">最后操作：{formatDateTime(user.lastOperationTime)}</span>
                            </div>
                            <div className="mt-4 flex flex-wrap gap-2">
                              <Button variant="outline" size="sm" onClick={() => setDetailUser(user)}><Eye className="mr-1.5 h-3.5 w-3.5" />详情</Button>
                              <Button variant="outline" size="sm" onClick={() => { setPasswordUser(user); setNewPassword(""); setConfirmPassword("") }}><KeyRound className="mr-1.5 h-3.5 w-3.5" />重置</Button>
                              <Button variant={user.status === 1 ? "destructive" : "secondary"} size="sm" disabled={actionUserId === user.userId} onClick={() => { void handleToggleStatus(user) }}><Ban className="mr-1.5 h-3.5 w-3.5" />{user.status === 1 ? "禁用" : "启用"}</Button>
                            </div>
                          </div>
                        ))}
                        {!userLoading && userPage.list.length === 0 && (<div className="rounded-lg bg-secondary/40 p-8 text-center text-sm text-muted-foreground">暂无匹配用户</div>)}
                      </div>
                    </>
                  )}
                  {userLoading && (<div className="border-t border-border p-6 text-center text-sm text-muted-foreground">正在加载用户数据...</div>)}
                  <div className="flex flex-col gap-3 border-t border-border p-4 md:flex-row md:items-center md:justify-between">
                    <p className="text-sm text-muted-foreground">第 {userPage.pageNum || 1} 页，每页 {userPage.pageSize || pageSize} 条，共 {userPage.total} 条</p>
                    <Pagination className="mx-0 w-auto justify-start md:justify-end">
                      <PaginationContent>
                        <PaginationItem><PaginationPrevious href="#" className={userPage.pageNum <= 1 ? "pointer-events-none opacity-50" : ""} onClick={(e) => { e.preventDefault(); handleUserPageChange(userPage.pageNum - 1) }} /></PaginationItem>
                        {visibleUserPages.map((page) => (
                          <PaginationItem key={page}><PaginationLink href="#" isActive={page === userPage.pageNum} onClick={(e) => { e.preventDefault(); handleUserPageChange(page) }}>{page}</PaginationLink></PaginationItem>
                        ))}
                        <PaginationItem><PaginationNext href="#" className={userPage.pageNum >= userPage.pages ? "pointer-events-none opacity-50" : ""} onClick={(e) => { e.preventDefault(); handleUserPageChange(userPage.pageNum + 1) }} /></PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ===== 逾期管理 ===== */}
          {activeNav === "overdue" && (
            <div className="space-y-6">
              <OverdueNotificationPanel />

              <Card className="bg-card">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-destructive" />逾期记录</CardTitle>
                  <CardDescription>管理全部逾期借阅记录。</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input value={overdueSearch} onChange={(e) => setOverdueSearch(e.target.value)}
                        placeholder="搜索用户名或书名..." className="pl-10 bg-secondary"
                        onKeyDown={(e) => { if (e.key === "Enter") { setOverduePageNum(1); void loadOverdueRecords(1, overdueSearch) } }} />
                    </div>
                    <Button onClick={() => { setOverduePageNum(1); void loadOverdueRecords(1, overdueSearch) }}>
                      <Search className="mr-2 h-4 w-4" />搜索
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card">
                <CardHeader>
                  <CardDescription>
                    共 {overduePage.total} 条逾期记录，第 {overduePage.pageNum} / {Math.max(overduePage.pages, 1)} 页
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {overdueError && (<div className="p-8 text-center text-sm text-destructive">{overdueError}</div>)}
                  {!overdueError && (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>借阅人</TableHead>
                          <TableHead>图书</TableHead>
                          <TableHead>应还日期</TableHead>
                          <TableHead>逾期天数</TableHead>
                          <TableHead className="text-right">罚款</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {overduePage.list.map((r) => (
                          <TableRow key={r.borrowId}>
                            <TableCell><p className="font-medium">{r.realName || r.username}</p></TableCell>
                            <TableCell><p className="font-medium">{r.bookTitle}</p><p className="text-xs text-muted-foreground">{r.author}</p></TableCell>
                            <TableCell className="font-mono text-sm">{formatDate(r.dueDate)}</TableCell>
                            <TableCell><Badge variant="destructive">{getDaysOverdue(r.dueDate)} 天</Badge></TableCell>
                            <TableCell className="text-right font-mono text-sm text-destructive">¥{r.overdueFine?.toFixed(2) ?? "0.00"}</TableCell>
                          </TableRow>
                        ))}
                        {!overdueLoading && overduePage.list.length === 0 && (
                          <TableRow><TableCell colSpan={5} className="h-28 text-center text-muted-foreground">暂无逾期记录</TableCell></TableRow>
                        )}
                      </TableBody>
                    </Table>
                  )}
                  {overdueLoading && (<div className="py-12 text-center text-sm text-muted-foreground">正在加载逾期数据...</div>)}
                  <div className="flex items-center justify-between border-t p-4">
                    <p className="text-sm text-muted-foreground">每页 10 条，共 {overduePage.total} 条</p>
                    <Pagination className="mx-0 w-auto">
                      <PaginationContent>
                        <PaginationItem><PaginationPrevious href="#" className={overduePageNum <= 1 ? "pointer-events-none opacity-50" : ""}
                          onClick={(e) => { e.preventDefault(); const p = overduePageNum - 1; setOverduePageNum(p); void loadOverdueRecords(p, overdueSearch) }} /></PaginationItem>
                        {getVisiblePages(overduePageNum, overduePage.pages).map((p) => (
                          <PaginationItem key={p}><PaginationLink href="#" isActive={p === overduePageNum}
                            onClick={(e) => { e.preventDefault(); setOverduePageNum(p); void loadOverdueRecords(p, overdueSearch) }}>{p}</PaginationLink></PaginationItem>
                        ))}
                        <PaginationItem><PaginationNext href="#" className={overduePageNum >= overduePage.pages ? "pointer-events-none opacity-50" : ""}
                          onClick={(e) => { e.preventDefault(); const p = overduePageNum + 1; setOverduePageNum(p); void loadOverdueRecords(p, overdueSearch) }} /></PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ===== 统计报表 ===== */}
          {activeNav === "reports" && (
            <div className="space-y-8">
              {reportsLoading ? (
                <div className="text-center text-sm text-muted-foreground py-12">正在加载统计数据...</div>
              ) : (
                <>
                  {/* KPI 卡片 */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="bg-card hover:border-zinc-700 transition-colors">
                      <CardContent className="p-6 flex flex-col justify-between">
                        <div className="p-3 bg-secondary rounded-xl text-muted-foreground w-fit">
                          <Library className="h-6 w-6" />
                        </div>
                        <div className="mt-4">
                          <p className="text-3xl font-bold tracking-tight">{overview.bookTotal.toLocaleString()}</p>
                          <p className="text-[10px] font-medium text-muted-foreground mt-1 uppercase tracking-widest">
                            总图书量 <span className="italic text-zinc-700 font-normal">Total</span>
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-card hover:border-green-900/40 transition-colors">
                      <CardContent className="p-6 flex flex-col justify-between">
                        <div className="p-3 bg-green-500/10 rounded-xl text-green-500 w-fit">
                          <CircleCheck className="h-6 w-6" />
                        </div>
                        <div className="mt-4">
                          <p className="text-3xl font-bold tracking-tight text-green-500">{overview.availableBookTotal.toLocaleString()}</p>
                          <p className="text-[10px] font-medium text-muted-foreground mt-1 uppercase tracking-widest">
                            总可用数量 <span className="italic text-green-700 font-normal">Available</span>
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-card hover:border-zinc-700 transition-colors">
                      <CardContent className="p-6 flex flex-col justify-between">
                        <div className="p-3 bg-secondary rounded-xl text-muted-foreground w-fit">
                          <ArrowUpRight className="h-6 w-6" />
                        </div>
                        <div className="mt-4">
                          <p className="text-3xl font-bold tracking-tight">{overview.monthBorrowCount.toLocaleString()}</p>
                          <p className="text-[10px] font-medium text-muted-foreground mt-1 uppercase tracking-widest">
                            本月借出数量 <span className="italic text-zinc-700 font-normal">Borrowed</span>
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-card hover:border-green-900/40 transition-colors">
                      <CardContent className="p-6 flex flex-col justify-between">
                        <div className="p-3 bg-green-500/10 rounded-xl text-green-500 w-fit">
                          <UserPlus className="h-6 w-6" />
                        </div>
                        <div className="mt-4">
                          <p className="text-3xl font-bold tracking-tight text-green-500">{overview.monthNewUserCount.toLocaleString()}</p>
                          <p className="text-[10px] font-medium text-muted-foreground mt-1 uppercase tracking-widest">
                            本月新增用户 <span className="italic text-green-700 font-normal">New Users</span>
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Top 5 排行榜 */}
                  <Card className="bg-card overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-border bg-secondary/30 px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="bg-amber-500/10 p-2 rounded-lg">
                          <Trophy className="h-5 w-5 text-amber-500" />
                        </div>
                        <CardTitle className="text-lg">借阅热度排行 Top 5</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      {hotBooks.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-12">暂无数据</p>
                      ) : (
                        <div className="space-y-1">
                          {hotBooks.map((book, index) => {
                            const rank = index + 1
                            const rankBadge = rank === 1
                              ? "bg-gradient-to-br from-amber-400 to-amber-600 shadow-[0_0_15px_rgba(251,191,36,0.3)]"
                              : rank === 2
                                ? "bg-gradient-to-br from-slate-300 to-slate-500 shadow-[0_0_15px_rgba(203,213,225,0.2)]"
                                : rank === 3
                                  ? "bg-gradient-to-br from-amber-800 to-amber-950 shadow-[0_0_15px_rgba(146,64,14,0.2)]"
                                  : "bg-secondary text-muted-foreground"
                            return (
                              <div key={book.bookId} className="flex items-center justify-between p-4 rounded-2xl hover:bg-secondary/50 transition-all group">
                                <div className="flex items-center gap-6">
                                  <div className={`w-8 h-8 flex items-center justify-center rounded-lg font-bold text-sm ${rankBadge} ${rank <= 3 ? "text-white" : ""}`}>
                                    {rank}
                                  </div>
                                  <div className="w-10 h-14 bg-secondary rounded shadow-lg flex items-center justify-center text-[8px] text-muted-foreground font-bold border border-border shrink-0">
                                    {book.coverUrl ? (
                                      <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover rounded" />
                                    ) : (
                                      "COVER"
                                    )}
                                  </div>
                                  <div>
                                    <p className="text-sm font-bold group-hover:text-green-500 transition-colors">{book.title}</p>
                                    <p className="text-[10px] text-muted-foreground mt-1">{book.author}{book.categoryName ? ` · ${book.categoryName}` : ""}</p>
                                  </div>
                                </div>
                                <div className="text-right shrink-0">
                                  <p className="text-lg font-bold tracking-tighter">{book.borrowCount.toLocaleString()}</p>
                                  <p className="text-[9px] text-muted-foreground font-medium uppercase italic">borrows</p>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          )}

          {/* ===== 系统设置 ===== */}
          {activeNav === "settings" && <SystemSettingsPage refreshKey={navRequestVersion} />}
        </main>
      </div>

      <AdminOverdueAckDialog />

      {/* 用户详情 Dialog */}
      <Dialog open={Boolean(detailUser)} onOpenChange={(open) => !open && setDetailUser(null)}>
        <DialogContent className="bg-card border-border sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>用户详情</DialogTitle>
            <DialogDescription>{detailUser ? `${detailUser.realName || detailUser.username} 的账号档案` : ""}</DialogDescription>
          </DialogHeader>
          {detailUser && (
            <form className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label>用户名</Label><Input value={detailUser.username} readOnly className="bg-secondary" /></div>
              <div className="space-y-2"><Label>真实姓名</Label><Input value={detailUser.realName || "-"} readOnly className="bg-secondary" /></div>
              <div className="space-y-2"><Label>性别</Label><Input value={getGenderLabel(detailUser.gender)} readOnly className="bg-secondary" /></div>
              <div className="space-y-2"><Label>手机号</Label><Input value={detailUser.phone || "-"} readOnly className="bg-secondary font-mono" /></div>
              <div className="space-y-2"><Label>角色</Label><Input value={detailUser.role || "-"} readOnly className="bg-secondary font-mono" /></div>
              <div className="space-y-2"><Label>账号状态</Label><Input value={getUserStatusLabel(detailUser.status)} readOnly className="bg-secondary" /></div>
              <div className="space-y-2"><Label>邮箱</Label><Input value={detailUser.email || "-"} readOnly className="bg-secondary" /></div>
              <div className="space-y-2"><Label>锁定至</Label><Input value={formatDateTime(detailUser.lockedUntil)} readOnly className="bg-secondary font-mono" /></div>
              <div className="space-y-2 sm:col-span-2"><Label>地址</Label><Input value={detailUser.address || "-"} readOnly className="bg-secondary" /></div>
              <div className="space-y-2 sm:col-span-2"><Label>最后操作时间</Label><Input value={formatDateTime(detailUser.lastOperationTime)} readOnly className="bg-secondary font-mono" /></div>
              <DialogFooter className="sm:col-span-2"><Button type="button" onClick={() => setDetailUser(null)}>关闭</Button></DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* 重置密码 Dialog */}
      <Dialog open={Boolean(passwordUser)} onOpenChange={(open) => { if (!open) { setPasswordUser(null); setNewPassword(""); setConfirmPassword("") } }}>
        <DialogContent className="bg-card border-border sm:max-w-md">
          <DialogHeader>
            <DialogTitle>重置密码</DialogTitle>
            <DialogDescription>{passwordUser ? `${passwordUser.realName || passwordUser.username}（${passwordUser.username}）` : ""}</DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleResetPassword}>
            <div className="space-y-2"><Label>新密码</Label><Input value={newPassword} onChange={(e) => setNewPassword(e.target.value)} type="password" placeholder="请输入新密码" className="bg-secondary" /></div>
            <div className="space-y-2"><Label>确认新密码</Label><Input value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} type="password" placeholder="请再次输入新密码" className="bg-secondary" /></div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setPasswordUser(null)}>取消</Button>
              <Button type="submit" disabled={passwordUser ? actionUserId === passwordUser.userId : false}>确认重置</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
