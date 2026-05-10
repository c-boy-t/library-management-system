import Link from "next/link"
import { BookOpen, Mail, Phone, MapPin } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <BookOpen className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">智慧图书馆</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              现代化的学校图书管理系统，为师生提供便捷的图书借阅服务，促进知识的传播与共享。
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">快速链接</h3>
            <nav className="flex flex-col gap-2">
              <Link href="/books" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                图书浏览
              </Link>
              <Link href="/categories" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                分类目录
              </Link>
              <Link href="/new-arrivals" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                新书上架
              </Link>
              <Link href="/popular" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                热门图书
              </Link>
            </nav>
          </div>

          {/* Help */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">帮助中心</h3>
            <nav className="flex flex-col gap-2">
              <Link href="/help/borrow" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                借阅指南
              </Link>
              <Link href="/help/faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                常见问题
              </Link>
              <Link href="/help/rules" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                借阅规则
              </Link>
              <Link href="/feedback" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                意见反馈
              </Link>
            </nav>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">联系我们</h3>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0" />
                <span>校园图书馆大楼一层</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 shrink-0" />
                <span>010-12345678</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 shrink-0" />
                <span>library@school.edu.cn</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © 2026 智慧图书馆. 保留所有权利.
          </p>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              隐私政策
            </Link>
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              使用条款
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
