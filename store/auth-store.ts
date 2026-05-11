import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import type { AuthUser } from '@/lib/auth'

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
      clearSession: () =>
        set({
          token: null,
          tokenType: null,
          expiresAt: null,
          user: null,
        }),
    }),
    {
      name: 'library-auth',
      storage: safeStorage,
      partialize: (state) => ({
        token: state.token,
        tokenType: state.tokenType,
        expiresAt: state.expiresAt,
        user: state.user,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.expiresAt && state.expiresAt <= Date.now()) {
          state.clearSession()
        }

        useAuthStore.setState({ hydrated: true })
      },
    },
  ),
)
