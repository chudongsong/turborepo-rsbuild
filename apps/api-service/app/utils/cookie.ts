import { Context } from 'egg';

/**
 * Cookie 安全配置
 */
export const COOKIE_SECURITY_OPTIONS = {
  httpOnly: true,    // 防止 XSS 攻击窃取 Cookie
  secure: process.env.NODE_ENV === 'production', // 生产环境仅 HTTPS 传输
  sameSite: 'strict' as const, // 严格同站策略，防止 CSRF 攻击
  signed: true,      // 启用签名
};

/**
 * 设置安全会话 Cookie
 * 
 * @param ctx Egg 上下文
 * @param sessionId 会话 ID
 * @param maxAge 过期时间（毫秒），默认 4 小时
 */
export function setSecureSessionCookie(ctx: Context, sessionId: string, maxAge: number = 4 * 60 * 60 * 1000): void {
  ctx.cookies.set('ll_session', sessionId, {
    ...COOKIE_SECURITY_OPTIONS,
    maxAge,
  });
}

/**
 * 清除会话 Cookie
 * 
 * @param ctx Egg 上下文
 */
export function clearSessionCookie(ctx: Context): void {
  ctx.cookies.set('ll_session', null, {
    ...COOKIE_SECURITY_OPTIONS,
    maxAge: 0,
  });
}