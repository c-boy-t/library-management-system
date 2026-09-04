import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { buildBooksPageHref } from "@/lib/book-discovery"

const categories = [
  { code: "A", name: "马克思主义、列宁主义、毛泽东思想、邓小平理论", count: 156 },
  { code: "B", name: "哲学、宗教", count: 720 },
  { code: "C", name: "社会科学总论", count: 480 },
  { code: "D", name: "政治、法律", count: 650 },
  { code: "E", name: "军事", count: 120 },
  { code: "F", name: "经济", count: 1240 },
  { code: "G", name: "文化、科学、教育、体育", count: 890 },
  { code: "H", name: "语言、文字", count: 560 },
  { code: "I", name: "文学", count: 2850 },
  { code: "J", name: "艺术", count: 890 },
  { code: "K", name: "历史、地理", count: 1560 },
  { code: "N", name: "自然科学总论", count: 320 },
  { code: "O", name: "数理科学和化学", count: 780 },
  { code: "P", name: "天文学、地球科学", count: 240 },
  { code: "Q", name: "生物科学", count: 380 },
  { code: "R", name: "医药、卫生", count: 560 },
  { code: "S", name: "农业科学", count: 180 },
  { code: "T", name: "工业技术", count: 420 },
  { code: "TP", name: "计算机科学", count: 980 },
  { code: "U", name: "交通运输", count: 150 },
  { code: "V", name: "航空、航天", count: 90 },
  { code: "Z", name: "综合性图书", count: 280 },
]

export default function CategoriesPage() {
  const totalBooks = categories.reduce((sum, cat) => sum + cat.count, 0)

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold">图书分类</h1>
            <p className="text-muted-foreground mt-1">
              按中国图书馆分类法（中图法）浏览图书，共 {totalBooks.toLocaleString()} 本
            </p>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <Link key={category.code} href={buildBooksPageHref({ category: category.name })}>
                <Card className="bg-card hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5 h-full">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-xl font-bold text-primary">{category.code}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold line-clamp-2 leading-tight">{category.name}</h3>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary">{category.count.toLocaleString()} 本</Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Info Section */}
          <Card className="bg-card mt-12">
            <CardContent className="p-8">
              <h2 className="text-xl font-semibold mb-4">关于中国图书馆分类法</h2>
              <p className="text-muted-foreground leading-relaxed">
                中国图书馆分类法（简称中图法）是我国图书馆和情报单位普遍使用的一部综合性文献分类法。
                它采用字母与数字混合标记，共分为22个基本大类，以A-Z（其中没有L、M、W、X、Y）为标记符号。
                每个大类下又细分若干小类，形成完整的分类体系，便于图书的组织、检索和管理。
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
