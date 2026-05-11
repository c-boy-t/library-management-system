"use client"

import Link from 'next/link'

import { AuthPageShell } from '@/components/auth/auth-page-shell'
import { RegisterForm } from '@/components/auth/register-form'
import { useGuestRedirect } from '@/hooks/use-guest-redirect'

export default function RegisterPage() {
  useGuestRedirect()

  return (
    <AuthPageShell
      title="创建账户"
      description="注册成为图书馆会员"
      footer={(
        <p className="text-center text-sm text-muted-foreground">
          已有账户？{' '}
          <Link href="/login" className="font-medium text-primary hover:underline">
            立即登录
          </Link>
        </p>
      )}
    >
      <RegisterForm />
    </AuthPageShell>
  )
}
