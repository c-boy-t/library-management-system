"use client"

import { AlertCircle, Loader2, Lock, User } from 'lucide-react'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { AuthInputField } from '@/components/auth/auth-input-field'
import { useLoginForm } from '@/hooks/use-login-form'

/**
 * 登录表单。
 */
export function LoginForm() {
  const { form, isSubmitting, serverError, submit } = useLoginForm()

  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={form.handleSubmit(submit)} noValidate>
        {serverError ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        ) : null}

        <AuthInputField
          control={form.control}
          name="username"
          label="用户名"
          placeholder="请输入用户名"
          icon={User}
          autoComplete="username"
        />

        <AuthInputField
          control={form.control}
          name="password"
          label="密码"
          placeholder="请输入密码"
          icon={Lock}
          type="password"
          autoComplete="current-password"
        />

        <Button type="submit" className="h-11 w-full" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : '登录'}
        </Button>
      </form>
    </Form>
  )
}
