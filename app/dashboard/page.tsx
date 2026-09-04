import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { DashboardClient } from '@/components/dashboard/dashboard-client'

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-background">
        <DashboardClient />
      </main>
      <Footer />
    </div>
  )
}
