import { authRateLimit } from './rateLimit';

/**
 * 认证频率限制中间件
 * 
 * 防止暴力破解攻击
 */
export default authRateLimit;