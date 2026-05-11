"use client"

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { authRegister } from '@/lib/auth'
import { registerFormSchema } from '@/lib/auth-schemas'
import { logError } from '@/lib/logger'
import { toast } from '@/hooks/use-toast'

export type RegisterFormValues = z.infer<typeof registerFormSchema>

/**
 * 注册表单逻辑。
 */
export function useRegisterForm() {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      username: '',
      realName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      acceptedTerms: false,
    },
  })

  const onSubmit = useCallback(async (values: RegisterFormValues) => {
    setServerError(null)

    try {
      await authRegister({
        username: values.username,
        email: values.email,
        password: values.password,
        confirmPassword: values.confirmPassword,
        realName: values.realName,
        phone: values.phone?.trim() || undefined,
      })
      toast({
        title: '注册成功',
        description: '请使用新账号登录系统',
      })
      router.replace('/login')
    } catch (error) {
      const message = error instanceof Error ? error.message : '注册失败，请稍后重试'
      setServerError(message)
      logError('auth.register', error)
    }
  }, [router])

  return {
    form,
    isSubmitting: form.formState.isSubmitting,
    serverError,
    submit: onSubmit,
  }
}
