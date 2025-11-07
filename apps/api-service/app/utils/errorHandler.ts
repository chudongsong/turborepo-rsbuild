import { Context } from 'egg';
import { COMMON, AUTH, PROXY, STORAGE, SYSTEM, getErrorMessage, isClientError, isServerError } from '../constants/errorCodes';

/**
 * API响应接口
 */
export interface ApiResponse<T = any> {
  success: boolean;
  code: number;
  message: string;
  data?: T;
  timestamp?: number;
  requestId?: string;
}

/**
 * 错误详情接口
 */
export interface ErrorDetail {
  field?: string;
  message: string;
  code?: number;
}

/**
 * 错误处理工具类
 */
export class ErrorHandler {
  /**
   * 创建成功响应
   * @param data 响应数据
   * @param ctx 上下文
   * @returns API响应
   */
  static success<T>(data?: T, ctx?: Context): ApiResponse<T> {
    return {
      success: true,
      code: COMMON.SUCCESS,
      message: getErrorMessage(COMMON.SUCCESS),
      data,
      timestamp: Date.now(),
      requestId: ctx?.id,
    };
  }

  /**
   * 创建错误响应
   * @param code 错误码
   * @param message 自定义错误消息（可选）
   * @param data 响应数据（可选）
   * @param ctx 上下文
   * @returns API响应
   */
  static error(
    code: number,
    message?: string,
    data?: any,
    ctx?: Context
  ): ApiResponse {
    return {
      success: false,
      code,
      message: message || getErrorMessage(code),
      data,
      timestamp: Date.now(),
      requestId: ctx?.id,
    };
  }

  /**
   * 创建验证错误响应
   * @param details 错误详情列表
   * @param ctx 上下文
   * @returns API响应
   */
  static validationError(
    details: ErrorDetail[],
    ctx?: Context
  ): ApiResponse {
    return {
      success: false,
      code: COMMON.VALIDATION_FAILED,
      message: getErrorMessage(COMMON.VALIDATION_FAILED),
      data: { details },
      timestamp: Date.now(),
      requestId: ctx?.id,
    };
  }

  /**
   * 处理并返回错误响应
   * @param error 错误对象
   * @param ctx 上下文
   * @returns API响应
   */
  static handleError(error: Error | any, ctx?: Context): ApiResponse {
    // 记录错误日志
    if (ctx) {
      ctx.logger.error(`Error occurred: ${error.message}`, {
        stack: error.stack,
        requestId: ctx.id,
        url: ctx.url,
        method: ctx.method,
        headers: ctx.headers,
        body: ctx.request.body,
      });
    }

    // 如果是自定义错误，使用其错误码和消息
    if (error.code && getErrorMessage(error.code)) {
      // 在生产环境中，使用预定义的错误消息，避免泄露敏感信息
      const message = process.env.NODE_ENV === 'production' 
        ? getErrorMessage(error.code) 
        : (error.message || getErrorMessage(error.code));
      
      return ErrorHandler.error(error.code, message, error.data, ctx);
    }

    // 根据错误类型判断错误码
    if (error.name === 'ValidationError') {
      const message = process.env.NODE_ENV === 'production' 
        ? getErrorMessage(COMMON.VALIDATION_FAILED) 
        : error.message;
      
      return ErrorHandler.error(COMMON.VALIDATION_FAILED, message, null, ctx);
    }

    if (error.name === 'UnauthorizedError') {
      const message = process.env.NODE_ENV === 'production' 
        ? getErrorMessage(AUTH.UNAUTHORIZED_ACCESS) 
        : error.message;
      
      return ErrorHandler.error(AUTH.UNAUTHORIZED_ACCESS, message, null, ctx);
    }

    if (error.name === 'ForbiddenError') {
      const message = process.env.NODE_ENV === 'production' 
        ? getErrorMessage(COMMON.FORBIDDEN) 
        : error.message;
      
      return ErrorHandler.error(COMMON.FORBIDDEN, message, null, ctx);
    }

    if (error.name === 'NotFoundError') {
      const message = process.env.NODE_ENV === 'production' 
        ? getErrorMessage(COMMON.NOT_FOUND) 
        : error.message;
      
      return ErrorHandler.error(COMMON.NOT_FOUND, message, null, ctx);
    }

    // 默认返回内部错误
    const message = process.env.NODE_ENV === 'production' 
      ? getErrorMessage(COMMON.INTERNAL_ERROR) 
      : error.message;
    
    return ErrorHandler.error(COMMON.INTERNAL_ERROR, message, null, ctx);
  }

  /**
   * 抛出业务错误
   * @param code 错误码
   * @param message 自定义错误消息（可选）
   * @param data 响应数据（可选）
   */
  static throw(code: number, message?: string, data?: any): never {
    const error = new Error(message || getErrorMessage(code)) as any;
    error.code = code;
    error.data = data;
    throw error;
  }

  /**
   * 抛出参数错误
   * @param message 错误消息
   * @param field 错误字段（可选）
   */
  static throwParamError(message: string, field?: string): never {
    ErrorHandler.throw(COMMON.INVALID_PARAMS, message, { field });
  }

  /**
   * 抛出未授权错误
   * @param message 错误消息
   */
  static throwUnauthorized(message?: string): never {
    ErrorHandler.throw(AUTH.UNAUTHORIZED_ACCESS, message);
  }

  /**
   * 抛出禁止访问错误
   * @param message 错误消息
   */
  static throwForbidden(message?: string): never {
    ErrorHandler.throw(COMMON.FORBIDDEN, message);
  }

  /**
   * 抛出资源不存在错误
   * @param message 错误消息
   */
  static throwNotFound(message?: string): never {
    ErrorHandler.throw(COMMON.NOT_FOUND, message);
  }

  /**
   * 抛出内部错误
   * @param message 错误消息
   */
  static throwInternalError(message?: string): never {
    ErrorHandler.throw(COMMON.INTERNAL_ERROR, message);
  }

  /**
   * 检查条件，如果不满足则抛出错误
   * @param condition 条件
   * @param code 错误码
   * @param message 错误消息
   */
  static assert(condition: any, code: number, message?: string): void {
    if (!condition) {
      ErrorHandler.throw(code, message);
    }
  }

  /**
   * 检查参数是否存在，如果不存在则抛出错误
   * @param value 参数值
   * @param paramName 参数名称
   */
  static assertParam(value: any, paramName: string): void {
    if (value === undefined || value === null || value === '') {
      ErrorHandler.throwParamError(`参数 ${paramName} 不能为空`, paramName);
    }
  }

  /**
   * 检查用户是否已登录，如果未登录则抛出错误
   * @param ctx 上下文
   */
  static assertLoggedIn(ctx: Context): void {
    if (!ctx.session || !ctx.session.userId) {
      ErrorHandler.throwUnauthorized('请先登录');
    }
  }

  /**
   * 检查用户是否有权限，如果无权限则抛出错误
   * @param hasPermission 是否有权限
   * @param message 错误消息
   */
  static assertPermission(hasPermission: boolean, message?: string): void {
    if (!hasPermission) {
      ErrorHandler.throwForbidden(message || '权限不足');
    }
  }

  /**
   * 检查资源是否存在，如果不存在则抛出错误
   * @param resource 资源
   * @param resourceName 资源名称
   */
  static assertExists(resource: any, resourceName: string): void {
    if (!resource) {
      ErrorHandler.throwNotFound(`${resourceName} 不存在`);
    }
  }
}

/**
 * 自定义错误类
 */
export class AppError extends Error {
  public code: number;
  public data?: any;

  constructor(code: number, message?: string, data?: any) {
    super(message || getErrorMessage(code));
    this.name = 'AppError';
    this.code = code;
    this.data = data;
  }
}

/**
 * 验证错误类
 */
export class ValidationError extends AppError {
  public details?: ErrorDetail[];

  constructor(message?: string, details?: ErrorDetail[]) {
    super(COMMON.VALIDATION_FAILED, message, { details });
    this.name = 'ValidationError';
    this.details = details;
  }
}

/**
 * 未授权错误类
 */
export class UnauthorizedError extends AppError {
  constructor(message?: string) {
    super(AUTH.UNAUTHORIZED_ACCESS, message);
    this.name = 'UnauthorizedError';
  }
}

/**
 * 禁止访问错误类
 */
export class ForbiddenError extends AppError {
  constructor(message?: string) {
    super(COMMON.FORBIDDEN, message);
    this.name = 'ForbiddenError';
  }
}

/**
 * 资源不存在错误类
 */
export class NotFoundError extends AppError {
  constructor(message?: string) {
    super(COMMON.NOT_FOUND, message);
    this.name = 'NotFoundError';
  }
}