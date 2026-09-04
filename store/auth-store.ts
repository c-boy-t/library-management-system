import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import type { AuthUser } from '@/lib/auth'

const AUTH_STORAGE_KEY = 'library-auth'

export interface AuthSession {
  token: string
  tokenType: string
  expiresAt: number
  user: AuthUser
}

interface AuthState {
  token: string | null
  tokenType: string | null
  expiresAt: number | null
  user: AuthUser | null
  hydrated: boolean
  setSession: (session: AuthSession) => void
  clearSession: () => void
}

const safeStorage = createJSONStorage(() => {
  if (typeof window === 'undefined') {
    return {
      getItem: () => null,
      setItem: () => undefined,
      removeItem: () => undefined,
    }
  }

  return window.localStorage
})

/**
 * 认证状态存储。
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      tokenType: null,
      expiresAt: null,
      user: null,
      hydrated: false,
      setSession: (session) =>
        set({
          token: session.token,
          tokenType: session.tokenType,
          expiresAt: session.expiresAt,
          user: session.user,
        }),
      clearSession: () => {
        set({
          token: null,
          tokenType: null,
          expiresAt: null,
          user: null,
        })
        void safeStorage.removeItem(AUTH_STORAGE_KEY)
      },
    }),
    {
      name: AUTH_STORAGE_KEY,
      storage: safeStorage,
      partialize: (state) => ({
        token: state.token,
        tokenType: state.tokenType,
        expiresAt: state.expiresAt,
        user: state.user,
      }),
      // 同步 storage 下 persist 的自动 hydrate 会在 create() 求值期间同步执行本回调，
      // 回调内引用 useAuthStore 将触发 TDZ ReferenceError（异常被 zustand 吞掉，
      // 导致 hydrated 永远为 false）。因此用 skipHydration 跳过自动 hydrate，
      // 改为模块级手动触发（见文件末尾），此时 useAuthStore 已完成绑定。
      skipHydration: true,
      onRehydrateStorage: () => (state) => {
        if (state?.expiresAt && state.expiresAt <= Date.now()) {
          state.clearSession()
        }

        useAuthStore.setState({ hydrated: true })
      },
    },
  ),
)

// 客户端模块执行时同步完成 rehydration；SSR 环境无 localStorage，跳过。
if (typeof window !== 'undefined') {
  void useAuthStore.persist.rehydrate()
}
