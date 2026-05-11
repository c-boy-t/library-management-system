import type { AuthUser } from '@/lib/auth'

/**
 * 根据用户角色获取登录后的首页。
 *
 * @param user 登录用户摘要
 * @returns 角色对应的目标路由
 */
export function getPostLoginPath(user: Pick<AuthUser, 'role'> | null | undefined) {
  return user?.role?.toUpperCase() === 'ADMIN' ? '/admin' : '/dashboard'
}
