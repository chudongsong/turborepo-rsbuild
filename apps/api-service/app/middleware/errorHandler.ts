import { Context } from 'egg';
import { ErrorHandler } from '../utils/errorHandler';

/**
 * 全局错误处理中间件
 *
 * 捕获所有未处理的错误，并返回统一的错误响应格式
 */
export default () => {
  return async (ctx: Context, next: () => Promise<any>) => {
    try {
      await next();
    } catch (err: any) {
      // 记录详细的错误日志，包括请求上下文
      const errorContext = {
        requestId: ctx.id,
        method: ctx.method,
        url: ctx.url,
        query: ctx.query,
        headers: ctx.headers,
        body: ctx.request.body,
        userAgent: ctx.get('User-Agent'),
        ip: ctx.ip,
        timestamp: new Date().toISOString(),
        error: {
          name: err.name,
          message: err.message,
          code: err.code,
          stack: err.stack,
        }
      };

      // 根据错误级别记录不同级别的日志
      if (err.code >= 990001 && err.code < 995000) {
        // 客户端错误，记录为警告级别
        ctx.logger.warn('Client error occurred', errorContext);
      } else {
        // 服务器错误，记录为错误级别
        ctx.logger.error('Server error occurred', errorContext);
      }

      // 使用统一的错误处理工具处理错误
      const errorResponse = ErrorHandler.handleError(err, ctx);
      
      // 根据错误码设置HTTP状态码
      if (err.code === 990002 || err.code === 010012 || err.code === 010013) {
        // 未授权
        ctx.status = 401;
      } else if (err.code === 990003) {
        // 禁止访问
        ctx.status = 403;
      } else if (err.code === 990004) {
        // 资源不存在
        ctx.status = 404;
      } else if (err.code === 990001 || err.code === 990007) {
        // 参数错误或验证失败
        ctx.status = 400;
      } else if (err.code === 990006) {
        // 请求频率限制
        ctx.status = 429;
      } else if (err.code >= 990001 && err.code < 995000) {
        // 客户端错误
        ctx.status = 400;
      } else {
        // 服务器内部错误
        ctx.status = 500;
      }
        
      // 返回错误响应
      // 在生产环境中，不暴露详细的错误堆栈和敏感信息
      if (process.env.NODE_ENV === 'production') {
        ctx.body = {
          code: errorResponse.code,
          message: errorResponse.message,
          success: errorResponse.success,
          data: errorResponse.data
        };
      } else {
        // 开发环境中提供更详细的错误信息
        ctx.body = {
          ...errorResponse,
          stack: err.stack,
          originalError: {
            name: err.name,
            message: err.message
          }
        };
      }
    }
  };
};