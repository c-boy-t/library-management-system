"use client"

import { useState } from "react"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Search,
  Filter,
  Star,
  Grid3X3,
  List,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

const books = [
  { id: 1, title: "深度学习入门", author: "斋藤康毅", category: "计算机科学", code: "TP", rating: 4.8, year: 2018, available: true, stock: 5 },
  { id: 2, title: "人类简史", author: "尤瓦尔·赫拉利", category: "历史", code: "K", rating: 4.9, year: 2017, available: true, stock: 3 },
  { id: 3, title: "百年孤独", author: "加西亚·马尔克斯", category: "文学", code: "I", rating: 4.7, year: 2011, available: false, stock: 0 },
  { id: 4, title: "经济学原理", author: "曼昆", category: "经济学", code: "F", rating: 4.6, year: 2019, available: true, stock: 8 },
  { id: 5, title: "Python编程：从入门到实践", author: "埃里克·马瑟斯", category: "计算机科学", code: "TP", rating: 4.5, year: 2020, available: true, stock: 6 },
  { id: 6, title: "活着", author: "余华", category: "文学", code: "I", rating: 4.9, year: 2012, available: true, stock: 4 },
  { id: 7, title: "三体", author: "刘慈欣", category: "文学", code: "I", rating: 4.8, year: 2008, available: true, stock: 7 },
  { id: 8, title: "算法导论", author: "Thomas H. Cormen", category: "计算机科学", code: "TP", rating: 4.7, year: 2013, available: true, stock: 2 },
  { id: 9, title: "乌合之众", author: "古斯塔夫·勒庞", category: "社会学", code: "C", rating: 4.4, year: 2015, available: false, stock: 0 },
  { id: 10, title: "时间简史", author: "史蒂芬·霍金", category: "物理学", code: "O", rating: 4.6, year: 2010, available: true, stock: 3 },
  { id: 11, title: "设计模式", author: "Erich Gamma", category: "计算机科学", code: "TP", rating: 4.5, year: 2000, available: true, stock: 4 },
  { id: 12, title: "红楼梦", author: "曹雪芹", category: "文学", code: "I", rating: 4.9, year: 2016, available: true, stock: 10 },
]

const categories = [
  { name: "全部", code: "all" },
  { name: "文学", code: "I" },
  { name: "历史", code: "K" },
  { name: "计算机", code: "TP" },
  { name: "经济学", code: "F" },
  { name: "社会学", code: "C" },
  { name: "物理学", code: "O" },
]

export default function BooksPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedCategory, setSelectedCategory] = useState("all")

  const filteredBooks = selectedCategory === "all" 
    ? books 
    : books.filter(book => book.code === selectedCategory)

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold">图书浏览</h1>
            <p className="text-muted-foreground mt-1">浏览并搜索馆藏图书</p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters - Desktop */}
            <aside className="hidden lg:block w-64 shrink-0">
              <Card className="bg-card sticky top-24">
                <CardContent className="p-6 space-y-6">
                  <div>
                    <h3 className="font-semibold mb-4">图书分类</h3>
                    <div className="space-y-2">
                      {categories.map((cat) => (
                        <button
                          key={cat.code}
                          onClick={() => setSelectedCategory(cat.code)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                            selectedCategory === cat.code 
                              ? "bg-primary text-primary-foreground" 
                              : "hover:bg-secondary"
                          }`}
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-4">出版年份</h3>
                    <div className="space-y-2">
                      {["2020-2026", "2015-2019", "2010-2014", "2010年以前"].map((range) => (
                        <label key={range} className="flex items-center gap-2 text-sm cursor-pointer">
                          <Checkbox />
                          <span>{range}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-4">借阅状态</h3>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <Checkbox />
                        <span>可借阅</span>
                      </label>
                      <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <Checkbox />
                        <span>已借出</span>
                      </label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </aside>

            {/* Main Content */}
            <div className="flex-1">
              {/* Search & Toolbar */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="搜索书名、作者、ISBN..."
                    className="pl-10 bg-card"
                  />
                </div>
                
                <div className="flex gap-2">
                  {/* Mobile Filter */}
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="outline" className="lg:hidden">
                        <Filter className="h-4 w-4 mr-2" />
                        筛选
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-80">
                      <SheetHeader>
                        <SheetTitle>筛选条件</SheetTitle>
                      </SheetHeader>
                      <div className="mt-6 space-y-6">
                        <div>
                          <Label className="mb-3 block">图书分类</Label>
                          <div className="space-y-2">
                            {categories.map((cat) => (
                              <button
                                key={cat.code}
                                onClick={() => setSelectedCategory(cat.code)}
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                                  selectedCategory === cat.code 
                                    ? "bg-primary text-primary-foreground" 
                                    : "hover:bg-secondary"
                                }`}
                              >
                                {cat.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </SheetContent>
                  </Sheet>

                  <Select defaultValue="latest">
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="排序" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="latest">最新上架</SelectItem>
                      <SelectItem value="popular">最受欢迎</SelectItem>
                      <SelectItem value="rating">评分最高</SelectItem>
                      <SelectItem value="title">书名排序</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex border border-border rounded-lg overflow-hidden">
                    <Button
                      variant={viewMode === "grid" ? "secondary" : "ghost"}
                      size="icon"
                      onClick={() => setViewMode("grid")}
                      className="rounded-none"
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "secondary" : "ghost"}
                      size="icon"
                      onClick={() => setViewMode("list")}
                      className="rounded-none"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Results Count */}
              <div className="mb-4 text-sm text-muted-foreground">
                共找到 <span className="text-foreground font-medium">{filteredBooks.length}</span> 本图书
              </div>

              {/* Books Grid/List */}
              {viewMode === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredBooks.map((book) => (
                    <Link key={book.id} href={`/books/${book.id}`}>
                      <Card className="group h-full hover:border-primary/50 transition-colors bg-card">
                        <CardContent className="p-5">
                          <div className="aspect-[3/4] rounded-lg bg-secondary flex items-center justify-center mb-4 group-hover:bg-secondary/80 transition-colors">
                            <span className="text-4xl font-bold text-muted-foreground/50">{book.code}</span>
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
                            <div className="flex items-center justify-between pt-2">
                              {book.available ? (
                                <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
                                  可借阅 ({book.stock})
                                </Badge>
                              ) : (
                                <Badge variant="secondary">已借出</Badge>
                              )}
                              <span className="text-xs text-muted-foreground">{book.year}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredBooks.map((book) => (
                    <Link key={book.id} href={`/books/${book.id}`}>
                      <Card className="group hover:border-primary/50 transition-colors bg-card">
                        <CardContent className="p-4 flex gap-4">
                          <div className="w-20 h-28 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                            <span className="text-xl font-bold text-muted-foreground/50">{book.code}</span>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <h3 className="font-semibold group-hover:text-primary transition-colors">
                                  {book.title}
                                </h3>
                                <p className="text-sm text-muted-foreground mt-1">{book.author}</p>
                              </div>
                              <div className="flex items-center gap-1 text-sm shrink-0">
                                <Star className="h-3.5 w-3.5 fill-accent text-accent" />
                                <span>{book.rating}</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 mt-3">
                              <Badge variant="secondary" className="text-xs">{book.category}</Badge>
                              <span className="text-xs text-muted-foreground">{book.year}</span>
                            </div>
                            
                            <div className="mt-3">
                              {book.available ? (
                                <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
                                  可借阅 (库存: {book.stock})
                                </Badge>
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
              )}

              {/* Pagination */}
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button variant="outline" size="icon" disabled>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="secondary" size="sm">1</Button>
                <Button variant="ghost" size="sm">2</Button>
                <Button variant="ghost" size="sm">3</Button>
                <span className="text-muted-foreground">...</span>
                <Button variant="ghost" size="sm">10</Button>
                <Button variant="outline" size="icon">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
