import { z } from 'zod'

export const loginFormSchema = z.object({
  username: z.string().trim().min(1, '请输入用户名'),
  password: z.string().min(1, '请输入密码'),
})

export const registerFormSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(4, '用户名至少 4 位')
      .max(20, '用户名最多 20 位')
      .regex(/^[a-zA-Z0-9_]+$/, '用户名只能包含字母、数字和下划线'),
    realName: z.string().trim().min(1, '请输入真实姓名').max(50, '真实姓名最多 50 字'),
    email: z.string().trim().email('请输入有效邮箱'),
    phone: z
      .string()
      .trim()
      .optional()
      .or(z.literal(''))
      .refine((value) => !value || /^1\d{10}$/.test(value), '手机号格式不正确'),
    password: z
      .string()
      .min(8, '密码至少 8 位')
      .max(20, '密码最多 20 位')
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, '密码需包含大小写字母和数字'),
    confirmPassword: z.string().min(1, '请再次输入密码'),
    acceptedTerms: z.boolean().refine((value) => value, '请先阅读并同意相关条款'),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: '两次输入的密码不一致',
    path: ['confirmPassword'],
  })

