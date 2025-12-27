import { auth } from '@/auth';

// 安全获取会话，处理 JWT 验证错误
export async function getSafeSession() {
  try {
    return await auth();
  } catch (error) {
    // 如果是 JWT 验证错误，返回 null
    if (error instanceof Error && error.name === 'JWTSessionError') {
      console.warn('JWT session validation failed, session is invalid');
      return null;
    }
    // 对于其他错误，也返回 null 以确保应用不会崩溃
    console.error('Unexpected error during authentication:', error);
    return null;
  }
}