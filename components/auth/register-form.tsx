"use client"

import { AlertCircle, Loader2, Lock, Mail, Phone, User, UserPen } from 'lucide-react'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { AuthCheckboxField } from '@/components/auth/auth-checkbox-field'
import { AuthInputField } from '@/components/auth/auth-input-field'
import { useRegisterForm } from '@/hooks/use-register-form'

/**
 * 注册表单。
 */
export function RegisterForm() {
  const { form, isSubmitting, serverError, submit } = useRegisterForm()

  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={form.handleSubmit(submit)} noValidate>
        {serverError ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        ) : null}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <AuthInputField
            control={form.control}
            name="username"
            label="用户名"
            placeholder="用户名"
            icon={User}
            autoComplete="username"
          />
          <AuthInputField
            control={form.control}
            name="realName"
            label="真实姓名"
            placeholder="真实姓名"
            icon={UserPen}
            autoComplete="name"
          />
        </div>

        <AuthInputField
          control={form.control}
          name="email"
          label="邮箱"
          placeholder="请输入邮箱地址"
          icon={Mail}
          autoComplete="email"
        />

        <AuthInputField
          control={form.control}
          name="phone"
          label="手机号码（选填）"
          placeholder="请输入手机号码"
          icon={Phone}
          autoComplete="tel"
        />

        <AuthInputField
          control={form.control}
          name="password"
          label="密码"
          placeholder="8-20 位，需包含大小写字母和数字"
          icon={Lock}
          type="password"
          autoComplete="new-password"
        />

        <AuthInputField
          control={form.control}
          name="confirmPassword"
          label="确认密码"
          placeholder="请再次输入密码"
          icon={Lock}
          type="password"
          autoComplete="new-password"
        />

        <AuthCheckboxField
          control={form.control}
          name="acceptedTerms"
          label="我已阅读并同意服务条款和隐私政策"
        />

        <Button type="submit" className="h-11 w-full" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : '注册'}
        </Button>
      </form>
    </Form>
  )
}
