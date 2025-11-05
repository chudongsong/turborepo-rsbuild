import { Controller } from 'egg';
import type { Context } from 'egg';

/**
 * AuthController
 *
 * 负责 2FA（基于 TOTP）的绑定与验证流程：
 * - `googleAuthBind`：生成绑定用二维码 URL 与 base32 密钥（不保存）；
 * - `googleAuthConfirm`：确认绑定，验证令牌并保存密钥；
 * - `googleAuthVerify`：校验一次性口令，成功后创建会话并写入签名 Cookie。
 * @controller Auth
 */
export default class AuthController extends Controller {
  /**
   * 生成绑定信息（二维码 URL 与 base32 密钥）。
   * @summary 获取2FA绑定信息
   * @description 生成用于双因子认证的TOTP二维码URL和base32密钥
   * @router get /api/v1/auth/google-auth-bind
   */
  async googleAuthBind(ctx: Context) {
    try {
      const data = await ctx.service.auth.generateBindInfo();
      ctx.success(data);
    } catch (error) {
      ctx.logger.error('生成绑定信息失败:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      ctx.internalError('生成绑定信息失败', errorMessage);
    }
  }

  /**
   * 确认绑定 2FA。
   * @summary 确认2FA绑定
   * @description 验证TOTP令牌并确认2FA绑定，创建用户会话
   * @router post /api/v1/auth/google-auth-confirm
   */
  async googleAuthConfirm(ctx: Context) {
    try {
      const { secret, token } = ctx.request.body as { secret?: string; token?: string };
      const result = await ctx.service.auth.confirmBind(secret || '', token || '');
      if (!result || !result.sessionId) {
        ctx.unauthorized('Invalid token or binding failed.');
        return;
      }
      const maxAge = 4 * 60 * 60 * 1000;
      ctx.cookies.set('ll_session', result.sessionId!, {
        maxAge,
        httpOnly: true,
        signed: true,
      });
      ctx.success(null, '2FA binding confirmed successfully.');
    } catch (error) {
      ctx.logger.error('确认绑定失败:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      ctx.internalError('确认绑定失败', errorMessage);
    }
  }

  /**
   * 验证 2FA 令牌并创建会话。
   * @summary 验证2FA令牌
   * @description 验证TOTP令牌并创建用户会话
   * @router post /api/v1/auth/google-auth-verify
   */
  async googleAuthVerify(ctx: Context) {
    try {
      const token = ctx.request.body?.token as string;
      const result = await ctx.service.auth.verifyTokenAndCreateSession(token);
      if (!result || !result.sessionId) {
        ctx.unauthorized('Invalid token or session expired.');
        return;
      }
      const maxAge = 4 * 60 * 60 * 1000;
      ctx.cookies.set('ll_session', result.sessionId!, {
        maxAge,
        httpOnly: true,
        signed: true,
      });
      ctx.success(null, 'Authentication successful, session created.');
    } catch (error) {
      ctx.logger.error('验证令牌失败:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      ctx.internalError('验证令牌失败', errorMessage);
    }
  }


}