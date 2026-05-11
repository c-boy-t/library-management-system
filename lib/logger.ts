/**
 * 记录错误日志。
 *
 * <p>只输出堆栈和受控上下文，不输出任何密码、验证码或其他敏感输入。</p>
 *
 * @param context 错误上下文
 * @param error 错误对象
 */
export function logError(context: string, error: unknown) {
  if (error instanceof Error) {
    console.error(`[ERROR] ${context}`, error.stack ?? error.message)
    return
  }

  console.error(`[ERROR] ${context}`, error)
}
