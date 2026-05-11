"use client"

import Link from 'next/link'
import type { ReactNode } from 'react'
import { BookOpen } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface AuthPageShellProps {
  title: string
  description: string
  children: ReactNode
  footer: ReactNode
}

/**
 * 认证页面外壳。
 */
export function AuthPageShell({ title, description, children, footer }: AuthPageShellProps) {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background p-4">
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#1a1a1a_1px,transparent_1px),linear-gradient(to_bottom,#1a1a1a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <BookOpen className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold">智慧图书馆</span>
          </Link>
        </div>

        <Card className="border-border bg-card">
          <CardHeader className="pb-4 text-center">
            <CardTitle className="text-2xl">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent>{children}</CardContent>
        </Card>

        <div className="mt-6">{footer}</div>
      </div>
    </div>
  )
}
