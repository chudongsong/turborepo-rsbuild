import { Context, Application } from 'egg';

/**
 * 请求频率限制配置
 */
interface RateLimitConfig {
  /** 窗口时间（毫秒） */
  windowMs: number;
  /** 最大请求数 */
  maxRequests: number;
  /** 跳过成功的请求计数 */
  skipSuccessfulRequests?: boolean;
  /** 跳过失败的请求计数 */
  skipFailedRequests?: boolean;
  /** 自定义键生成器 */
  keyGenerator?: (ctx: Context) => string;
  /** 自定义跳过检查 */
  skip?: (ctx: Context) => boolean;
  /** 错误消息 */
  message?: string;
  /** 状态码 */
  statusCode?: number;
}

/**
 * 请求记录
 */
interface RequestRecord {
  /** 请求次数 */
  count: number;
  /** 窗口开始时间 */
  windowStart: number;
}

/**
 * 内存存储的请求记录
 */
const requestRecords = new Map<string, RequestRecord>();

/**
 * 清理过期记录
 */
function cleanExpiredRecords(): void {
  const now = Date.now();
  for (const [key, record] of requestRecords.entries()) {
    // 如果记录超过窗口时间的2倍，则删除
    if (now - record.windowStart > 60000) { // 1分钟后清理
      requestRecords.delete(key);
    }
  }
}

// 定期清理过期记录
setInterval(cleanExpiredRecords, 30000); // 每30秒清理一次

/**
 * 创建请求频率限制中间件
 * 
 * @param config 限制配置
 * @returns 中间件函数
 */
export function createRateLimitMiddleware(config: RateLimitConfig) {
  const {
    windowMs = 60 * 1000, // 默认1分钟
    maxRequests = 100, // 默认100次请求
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
    keyGenerator = (ctx: Context) => ctx.ip,
    skip = () => false,
    message = '请求过于频繁，请稍后再试',
    statusCode = 429,
  } = config;

  return async function rateLimitMiddleware(ctx: Context, next: () => Promise<void>) {
    // 检查是否跳过限制
    if (skip(ctx)) {
      await next();
      return;
    }

    const key = keyGenerator(ctx);
    const now = Date.now();

    // 获取或创建请求记录
    let record = requestRecords.get(key);
    if (!record || now - record.windowStart > windowMs) {
      // 创建新记录或重置过期记录
      record = {
        count: 0,
        windowStart: now,
      };
      requestRecords.set(key, record);
    }

    // 增加请求计数
    record.count++;

    // 检查是否超过限制
    if (record.count > maxRequests) {
      ctx.status = statusCode;
      ctx.body = {
        code: statusCode,
        message,
        data: {
          limit: maxRequests,
          windowMs,
          retryAfter: Math.ceil((record.windowStart + windowMs - now) / 1000),
        },
      };
      return;
    }

    // 执行下一个中间件
    await next();

    // 根据配置决定是否减少计数
    const shouldDecrement = 
      (skipSuccessfulRequests && ctx.status < 400) ||
      (skipFailedRequests && ctx.status >= 400);

    if (shouldDecrement && record.count > 0) {
      record.count--;
    }
  };
}

/**
 * 默认的API请求频率限制中间件
 * 限制：每分钟100次请求
 */
export const apiRateLimit = createRateLimitMiddleware({
  windowMs: 60 * 1000, // 1分钟
  maxRequests: 100,
  message: 'API请求过于频繁，请稍后再试',
});

/**
 * 严格的API请求频率限制中间件
 * 限制：每分钟30次请求
 */
export const strictApiRateLimit = createRateLimitMiddleware({
  windowMs: 60 * 1000, // 1分钟
  maxRequests: 30,
  message: '请求过于频繁，请稍后再试',
});

/**
 * 认证相关的请求频率限制中间件
 * 限制：每分钟10次请求
 */
export const authRateLimit = createRateLimitMiddleware({
  windowMs: 60 * 1000, // 1分钟
  maxRequests: 10,
  message: '登录尝试过于频繁，请稍后再试',
  keyGenerator: (ctx: Context) => `${ctx.ip}:auth`,
});

/**
 * 代理请求频率限制中间件
 * 限制：每分钟60次请求
 */
export const proxyRateLimit = createRateLimitMiddleware({
  windowMs: 60 * 1000, // 1分钟
  maxRequests: 60,
  message: '代理请求过于频繁，请稍后再试',
  keyGenerator: (ctx: Context) => `${ctx.ip}:proxy`,
});

/**
 * 请求频率限制中间件
 * 
 * 防止 DDoS 攻击
 */
export default apiRateLimit;