import { Context } from 'egg';

/**
 * URL 验证工具
 */
export class UrlValidator {
  /**
   * 验证 URL 是否安全，防止 SSRF 攻击
   * 
   * @param url 要验证的 URL
   * @param allowedHosts 允许的主机列表（可选）
   * @returns 验证结果
   */
  static validateUrl(url: string, allowedHosts?: string[]): { isValid: boolean; error?: string } {
    try {
      // 检查 URL 格式
      const parsedUrl = new URL(url);
      
      // 只允许 HTTP 和 HTTPS 协议
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        return { isValid: false, error: '只允许 HTTP 和 HTTPS 协议' };
      }
      
      // 检查主机名是否在允许列表中（如果提供了允许列表）
      if (allowedHosts && allowedHosts.length > 0) {
        if (!allowedHosts.includes(parsedUrl.hostname)) {
          return { isValid: false, error: `不允许的主机: ${parsedUrl.hostname}` };
        }
      }
      
      // 检查是否为内网 IP（防止 SSRF）
      const hostname = parsedUrl.hostname;
      if (this.isPrivateIP(hostname) || this.isLocalhost(hostname)) {
        return { isValid: false, error: '不允许访问内网地址' };
      }
      
      return { isValid: true };
    } catch (error) {
      return { isValid: false, error: '无效的 URL 格式' };
    }
  }
  
  /**
   * 检查是否为内网 IP
   * 
   * @param hostname 主机名
   * @returns 是否为内网 IP
   */
  private static isPrivateIP(hostname: string): boolean {
    // 私有 IP 地址范围
    const privateRanges = [
      /^10\./,           // 10.0.0.0/8
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // 172.16.0.0/12
      /^192\.168\./,     // 192.168.0.0/16
      /^127\./,          // 127.0.0.0/8 (部分本地地址)
      /^169\.254\./,     // 169.254.0.0/16 (链路本地)
      /^::1$/,           // IPv6 本地回环
      /^fc00:/,          // IPv6 唯一本地地址
      /^fe80:/,          // IPv6 链路本地地址
    ];
    
    return privateRanges.some(range => range.test(hostname));
  }
  
  /**
   * 检查是否为本地主机
   * 
   * @param hostname 主机名
   * @returns 是否为本地主机
   */
  private static isLocalhost(hostname: string): boolean {
    return ['localhost', '0.0.0.0'].includes(hostname.toLowerCase());
  }
}

/**
 * 路径验证工具
 */
export class PathValidator {
  /**
   * 验证文件路径是否安全，防止路径遍历攻击
   * 
   * @param path 要验证的路径
   * @param basePath 基础路径（可选）
   * @returns 验证结果
   */
  static validatePath(path: string, basePath?: string): { isValid: boolean; error?: string; sanitizedPath?: string } {
    // 检查是否包含危险字符
    if (path.includes('..') || path.includes('~')) {
      return { isValid: false, error: '路径包含危险字符' };
    }
    
    // 检查是否为绝对路径（除非明确允许）
    if (path.startsWith('/') && !basePath) {
      return { isValid: false, error: '不允许绝对路径' };
    }
    
    // 检查是否包含 null 字节
    if (path.includes('\0')) {
      return { isValid: false, error: '路径包含 null 字节' };
    }
    
    // 规范化路径
    let sanitizedPath = path;
    
    // 移除开头的斜杠（如果有）
    if (sanitizedPath.startsWith('/')) {
      sanitizedPath = sanitizedPath.substring(1);
    }
    
    // 如果提供了基础路径，确保规范化后的路径不会超出基础路径
    if (basePath) {
      const resolvedPath = require('path').resolve(basePath, sanitizedPath);
      if (!resolvedPath.startsWith(require('path').resolve(basePath))) {
        return { isValid: false, error: '路径超出允许范围' };
      }
      return { isValid: true, sanitizedPath: resolvedPath };
    }
    
    return { isValid: true, sanitizedPath };
  }
}

/**
 * 输入验证中间件
 * 
 * @param ctx Egg 上下文
 * @param next 下一个中间件
 */
export async function inputValidationMiddleware(ctx: Context, next: () => Promise<any>) {
  // 对代理请求进行特殊验证
  if (ctx.path.startsWith('/api/v1/proxy/')) {
    // 验证代理 URL
    if (ctx.request.body?.url) {
      const urlValidation = UrlValidator.validateUrl(ctx.request.body.url);
      if (!urlValidation.isValid) {
        ctx.badRequest(urlValidation.error);
        return;
      }
    }
    
    // 验证文件路径
    if (ctx.query.path) {
      const pathValidation = PathValidator.validatePath(ctx.query.path as string);
      if (!pathValidation.isValid) {
        ctx.badRequest(pathValidation.error);
        return;
      }
    }
  }
  
  await next();
}