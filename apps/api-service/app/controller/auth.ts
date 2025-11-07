import { Controller } from "egg";
import type { Context } from "egg";
import { setSecureSessionCookie } from "../utils/cookie";

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
      setSecureSessionCookie(ctx, result.sessionId!, maxAge);
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
      setSecureSessionCookie(ctx, result.sessionId!, maxAge);
      ctx.success(null, 'Authentication successful, session created.');
    } catch (error) {
      ctx.logger.error('验证令牌失败:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      ctx.internalError('验证令牌失败', errorMessage);
    }
  }

  /**
   * 验证密码并创建会话。
   * @summary 验证密码
   * @description 验证用户密码并创建用户会话
   * @router post /api/v1/auth/password-verify
   */
  async passwordVerify(ctx: Context) {
    try {
      const password = ctx.request.body?.password as string;
      const result = await ctx.service.auth.verifyPasswordAndCreateSession(password);
      if (!result || !result.sessionId) {
        ctx.unauthorized('Invalid password or session expired.');
        return;
      }
      const maxAge = 4 * 60 * 60 * 1000;
      setSecureSessionCookie(ctx, result.sessionId!, maxAge);
      ctx.success(null, 'Authentication successful, session created.');
    } catch (error) {
      ctx.logger.error('验证密码失败:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      ctx.internalError('验证密码失败', errorMessage);
    }
  }

  /**
   * 根据验证方式自动验证并创建会话。
   * @summary 自动验证
   * @description 根据设置的验证方式自动选择密码或TOTP验证
   * @router post /api/v1/auth/auto-verify
   */
  async autoVerify(ctx: Context) {
    try {
      const input = ctx.request.body?.input as string;
      const result = await ctx.service.auth.verifyAndCreateSession(input);
      if (!result || !result.sessionId) {
        ctx.unauthorized('Invalid input or session expired.');
        return;
      }
      const maxAge = 4 * 60 * 60 * 1000;
      setSecureSessionCookie(ctx, result.sessionId!, maxAge);
      ctx.success(null, 'Authentication successful, session created.');
    } catch (error) {
      ctx.logger.error('自动验证失败:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      ctx.internalError('自动验证失败', errorMessage);
    }
  }

  /**
   * 设置验证方式。
   * @summary 设置验证方式
   * @description 在初始化时设置验证方式（密码或2FA）和用户名
   * @router post /api/v1/auth/set-auth-method
   */
  async setAuthMethod(ctx: Context) {
    try {
      const { method, username, password, secret, token } = ctx.request.body as {
        method?: 'password' | 'totp';
        username?: string;
        password?: string;
        secret?: string;
        token?: string;
      };

      if (!method) {
        ctx.badRequest('Missing auth method');
        return;
      }

      let result;

      if (method === 'password') {
        if (!password) {
          ctx.badRequest('Password is required');
          return;
        }
        result = await ctx.service.auth.setAuthMethod(method, username, password);
      } else if (method === 'totp') {
        if (!secret || !token) {
          ctx.badRequest('Secret and token are required for TOTP');
          return;
        }
        // 验证token
        if (!ctx.service.auth.verifyTOTPToken(secret, token)) {
          ctx.unauthorized('Invalid token');
          return;
        }
        result = await ctx.service.auth.setAuthMethod(method, username, undefined, secret);
      } else {
        ctx.badRequest('Invalid auth method');
        return;
      }

      if (!result || !result.sessionId) {
        ctx.unauthorized('Failed to set auth method');
        return;
      }

      const maxAge = 4 * 60 * 60 * 1000;
      setSecureSessionCookie(ctx, result.sessionId!, maxAge);
      ctx.success(null, 'Auth method set successfully.');
    } catch (error) {
      ctx.logger.error('设置验证方式失败:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      ctx.internalError('设置验证方式失败', errorMessage);
    }
  }


}