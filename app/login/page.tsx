"use client"

import Link from 'next/link'

import { AuthPageShell } from '@/components/auth/auth-page-shell'
import { LoginForm } from '@/components/auth/login-form'
import { useGuestRedirect } from '@/hooks/use-guest-redirect'

export default function LoginPage() {
  useGuestRedirect()

  return (
    <AuthPageShell
      title="欢迎回来"
      description="使用用户名和密码登录您的账户"
      footer={(
        <p className="text-center text-sm text-muted-foreground">
          还没有账户？{' '}
          <Link href="/register" className="font-medium text-primary hover:underline">
            立即注册
          </Link>
        </p>
      )}
    >
      <LoginForm />
    </AuthPageShell>
  )
}
