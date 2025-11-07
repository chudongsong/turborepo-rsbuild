import { inputValidationMiddleware } from '../utils/validation';

/**
 * 输入验证中间件
 * 
 * 防止 SSRF 和路径遍历攻击
 */
export default inputValidationMiddleware;