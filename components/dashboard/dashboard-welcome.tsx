import Link from 'next/link'
import { memo } from 'react'
import { Settings } from 'lucide-react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

interface DashboardWelcomeProps {
  avatarText: string
  realName: string
  username: string
}

function DashboardWelcomeComponent({ avatarText, realName, username }: DashboardWelcomeProps) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16 border-2 border-primary">
          <AvatarFallback className="bg-primary/10 text-xl text-primary">
            {avatarText}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold">你好，{realName}</h1>
          <p className="text-muted-foreground">{username}</p>
        </div>
      </div>
      <Button variant="outline" asChild>
        <Link href="/dashboard/settings">
          <Settings className="mr-2 h-4 w-4" />
          账户设置
        </Link>
      </Button>
    </div>
  )
}

export const DashboardWelcome = memo(DashboardWelcomeComponent)
