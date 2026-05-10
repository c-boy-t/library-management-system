import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  BookOpen,
  Clock,
  Users,
  Award,
  MapPin,
  Phone,
  Mail,
  ArrowRight,
  CheckCircle2,
} from "lucide-react"

const features = [
  {
    icon: BookOpen,
    title: "丰富馆藏",
    description: "超过5万册图书，涵盖22大类学科领域，满足各专业学习需求。",
  },
  {
    icon: Clock,
    title: "便捷服务",
    description: "在线检索、预约、续借，7x12小时开放，让阅读无时无刻。",
  },
  {
    icon: Users,
    title: "专业团队",
    description: "经验丰富的馆员团队，提供专业的信息咨询和阅读指导服务。",
  },
  {
    icon: Award,
    title: "智能推荐",
    description: "基于借阅历史的个性化推荐，发现更多优质图书资源。",
  },
]

const openingHours = [
  { day: "周一至周五", hours: "8:00 - 22:00" },
  { day: "周六", hours: "9:00 - 21:00" },
  { day: "周日", hours: "9:00 - 18:00" },
  { day: "法定节假日", hours: "另行通知" },
]

const rules = [
  "每位读者最多可同时借阅5本图书",
  "借阅期限为30天，可续借1次",
  "逾期归还需缴纳罚款（每天0.5元）",
  "请爱护图书，如有损坏需按规定赔偿",
  "图书馆内请保持安静，禁止喧哗",
  "禁止携带食品和饮料进入阅览区",
]

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 md:py-28">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1a1a1a_1px,transparent_1px),linear-gradient(to_bottom,#1a1a1a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
          
          <div className="container mx-auto px-4 relative">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 text-balance">
                关于<span className="text-primary">智慧图书馆</span>
              </h1>
              <p className="text-lg text-muted-foreground text-pretty">
                我们致力于为全校师生提供优质的图书资源和便捷的借阅服务，
                打造一个知识共享、学习交流的现代化智慧图书馆。
              </p>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 bg-card/50">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature) => (
                <Card key={feature.title} className="bg-card border-border">
                  <CardContent className="p-6 text-center">
                    <div className="inline-flex items-center justify-center h-14 w-14 rounded-xl bg-primary/10 mb-4">
                      <feature.icon className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Info Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Opening Hours */}
              <Card className="bg-card">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <h2 className="text-xl font-semibold">开放时间</h2>
                  </div>
                  
                  <div className="space-y-4">
                    {openingHours.map((item) => (
                      <div key={item.day} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                        <span className="text-muted-foreground">{item.day}</span>
                        <span className="font-medium">{item.hours}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Borrowing Rules */}
              <Card className="bg-card">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <BookOpen className="h-5 w-5 text-primary" />
                    </div>
                    <h2 className="text-xl font-semibold">借阅规则</h2>
                  </div>
                  
                  <ul className="space-y-3">
                    {rules.map((rule, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{rule}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-16 bg-card/50">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl font-semibold text-center mb-8">联系我们</h2>
              
              <Card className="bg-card">
                <CardContent className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4">
                      <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-primary/10 mb-4">
                        <MapPin className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="font-medium mb-1">地址</h3>
                      <p className="text-sm text-muted-foreground">校园图书馆大楼一层</p>
                    </div>
                    
                    <div className="text-center p-4">
                      <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-primary/10 mb-4">
                        <Phone className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="font-medium mb-1">电话</h3>
                      <p className="text-sm text-muted-foreground">010-12345678</p>
                    </div>
                    
                    <div className="text-center p-4">
                      <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-primary/10 mb-4">
                        <Mail className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="font-medium mb-1">邮箱</h3>
                      <p className="text-sm text-muted-foreground">library@school.edu.cn</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-8 md:p-12 text-center">
                <h2 className="text-2xl font-bold mb-4">开始探索知识的海洋</h2>
                <p className="text-muted-foreground max-w-xl mx-auto mb-8">
                  注册成为图书馆会员，即可享受便捷的图书借阅服务。
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
