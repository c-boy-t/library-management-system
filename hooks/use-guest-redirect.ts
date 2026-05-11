"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

import { getPostLoginPath } from '@/lib/auth-routes'
import { useAuthStore } from '@/store/auth-store'

/**
 * 已登录用户访问访客页时自动跳转。
 *
 * @param targetPath 指定跳转目标，未传时按角色分流
 */
export function useGuestRedirect(targetPath?: string) {
  const router = useRouter()
  const token = useAuthStore((state) => state.token)
  const user = useAuthStore((state) => state.user)

  useEffect(() => {
    if (!token || !user) {
      return
    }

    router.replace(targetPath ?? getPostLoginPath(user))
  }, [router, targetPath, token, user])
}
