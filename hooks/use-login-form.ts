"use client"

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { authLogin } from '@/lib/auth'
import { getPostLoginPath } from '@/lib/auth-routes'
import { loginFormSchema } from '@/lib/auth-schemas'
import { logError } from '@/lib/logger'
import { toast } from '@/hooks/use-toast'
import { useAuthStore } from '@/store/auth-store'

export type LoginFormValues = z.infer<typeof loginFormSchema>

/**
 * 登录表单逻辑。
 */
export function useLoginForm() {
  const router = useRouter()
  const setSession = useAuthStore((state) => state.setSession)
  const [serverError, setServerError] = useState<string | null>(null)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  })

  const onSubmit = useCallback(async (values: LoginFormValues) => {
    setServerError(null)

    try {
      const response = await authLogin(values)
      setSession({
        token: response.token,
        tokenType: response.tokenType,
        expiresAt: Date.now() + response.expiresIn * 1000,
        user: response.user,
      })
      toast({
        title: '登录成功',
        description: `欢迎回来，${response.user.realName || response.user.username}`,
      })
      router.replace(getPostLoginPath(response.user))
    } catch (error) {
      const message = error instanceof Error ? error.message : '登录失败，请稍后重试'
      setServerError(message)
      logError('auth.login', error)
    }
  }, [router, setSession])

  return {
    form,
    isSubmitting: form.formState.isSubmitting,
    serverError,
    submit: onSubmit,
  }
}
