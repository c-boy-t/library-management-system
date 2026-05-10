import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Star,
  BookOpen,
  Calendar,
  Building2,
  Barcode,
  ArrowLeft,
  Heart,
  Share2,
  BookMarked,
  Clock,
} from "lucide-react"

const book = {
  id: 1,
  title: "深度学习入门：基于Python的理论与实现",
  author: "斋藤康毅",
  translator: "陆宇杰",
  publisher: "人民邮电出版社",
  publishDate: "2018-07-01",
  isbn: "9787115485588",
  category: "计算机科学",
  code: "TP",
  pages: 285,
  rating: 4.8,
  ratingCount: 1256,
  available: true,
  stock: 5,
  totalStock: 8,
  location: "三楼 A区 12排 3层",
  description: `本书是深度学习真正意义上的入门书，深入浅出地剖析了深度学习的原理和相关技术。书中使用Python 3，尽量不依赖外部库或工具，从基本的数学知识出发，带领读者从零创建一个经典的深度学习网络，使读者在此过程中逐步理解深度学习。

本书的内容包括：神经网络的基本框架、神经网络的学习、误差反向传播法、激活函数、损失函数、梯度下降法、卷积神经网络、批处理、Dropout、超参数的设定等。

本书适合深度学习初学者阅读，也可作为高校相关专业的教学参考书。`,
  tableOfContents: [
    "第1章 Python入门",
    "第2章 感知机",
    "第3章 神经网络",
    "第4章 神经网络的学习",
    "第5章 误差反向传播法",
    "第6章 与学习相关的技巧",
    "第7章 卷积神经网络",
    "第8章 深度学习",
  ],
  relatedBooks: [
    { id: 2, title: "机器学习实战", author: "Peter Harrington", code: "TP" },
    { id: 3, title: "Python机器学习", author: "Sebastian Raschka", code: "TP" },
    { id: 4, title: "统计学习方法", author: "李航", code: "TP" },
  ],
}

export default function BookDetailPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground transition-colors">首页</Link>
            <span>/</span>
            <Link href="/books" className="hover:text-foreground transition-colors">图书浏览</Link>
            <span>/</span>
            <span className="text-foreground">{book.title}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Book Cover & Actions */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Book Cover */}
                <Card className="bg-card overflow-hidden">
                  <div className="aspect-[3/4] bg-secondary flex items-center justify-center">
                    <span className="text-6xl font-bold text-muted-foreground/50">{book.code}</span>
                  </div>
                </Card>

                {/* Actions */}
                <div className="space-y-3">
                  <Button className="w-full h-12 text-base" disabled={!book.available}>
                    <BookMarked className="mr-2 h-5 w-5" />
                    {book.available ? "借阅此书" : "已借出"}
                  </Button>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" className="h-10">
                      <Heart className="mr-2 h-4 w-4" />
                      收藏
                    </Button>
                    <Button variant="outline" className="h-10">
                      <Share2 className="mr-2 h-4 w-4" />
                      分享
                    </Button>
                  </div>
                </div>

                {/* Stock Info */}
                <Card className="bg-card">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">馆藏数量</span>
                      <span className="font-medium">{book.totalStock} 本</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">可借数量</span>
                      <span className="font-medium text-primary">{book.stock} 本</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">馆藏位置</span>
                      <span className="font-medium text-sm">{book.location}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Book Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Title & Meta */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="secondary">{book.category}</Badge>
                  {book.available ? (
                    <Badge className="bg-primary/10 text-primary">可借阅</Badge>
                  ) : (
                    <Badge variant="destructive">已借出</Badge>
                  )}
                </div>
                
                <h1 className="text-2xl md:text-3xl font-bold text-balance">{book.title}</h1>
                
                <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-accent text-accent" />
                    <span className="font-medium text-foreground">{book.rating}</span>
                    <span>({book.ratingCount} 评价)</span>
                  </div>
                </div>
              </div>

              {/* Basic Info */}
              <Card className="bg-card">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                        <BookOpen className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">作者</p>
                        <p className="font-medium">{book.author}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">出版社</p>
                        <p className="font-medium">{book.publisher}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">出版日期</p>
                        <p className="font-medium">{book.publishDate}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                        <Barcode className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">ISBN</p>
                        <p className="font-medium">{book.isbn}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tabs */}
              <Tabs defaultValue="description" className="w-full">
                <TabsList className="w-full justify-start bg-card border border-border h-auto p-1">
                  <TabsTrigger value="description" className="px-4">内容简介</TabsTrigger>
                  <TabsTrigger value="toc" className="px-4">目录</TabsTrigger>
                </TabsList>
                
                <TabsContent value="description" className="mt-4">
                  <Card className="bg-card">
                    <CardContent className="p-6">
                      <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                        {book.description}
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="toc" className="mt-4">
                  <Card className="bg-card">
                    <CardContent className="p-6">
                      <ul className="space-y-3">
                        {book.tableOfContents.map((item, index) => (
                          <li key={index} className="flex items-center gap-3 text-muted-foreground">
                            <span className="h-6 w-6 rounded bg-secondary flex items-center justify-center text-xs font-medium">
                              {index + 1}
                            </span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              {/* Borrow Info */}
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-6">
                  <h3 className="font-semibold flex items-center gap-2 mb-4">
                    <Clock className="h-5 w-5 text-primary" />
                    借阅须知
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• 借阅期限：30天</li>
                    <li>• 可续借次数：1次（续借后重新计算借阅期限）</li>
                    <li>• 逾期罚款：每天0.5元</li>
                    <li>• 每位用户最多同时借阅5本图书</li>
                  </ul>
                </CardContent>
              </Card>

              {/* Related Books */}
              <Card className="bg-card">
                <CardHeader>
                  <CardTitle className="text-lg">相关推荐</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {book.relatedBooks.map((related) => (
                      <Link key={related.id} href={`/books/${related.id}`}>
                        <Card className="bg-secondary/50 hover:bg-secondary transition-colors">
                          <CardContent className="p-4">
                            <div className="aspect-[3/4] rounded bg-secondary flex items-center justify-center mb-3">
                              <span className="text-2xl font-bold text-muted-foreground/50">{related.code}</span>
                            </div>
                            <h4 className="font-medium text-sm line-clamp-1">{related.title}</h4>
                            <p className="text-xs text-muted-foreground mt-1">{related.author}</p>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Button variant="ghost" asChild className="mt-4">
                <Link href="/books">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  返回图书列表
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
