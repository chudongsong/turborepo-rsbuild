/**
 * @linglongos/utils - 通用工具库
 *
 * 提供TypeScript/JavaScript开发的常用工具函数，包括：
 * - 数据处理和验证
 * - 日期时间处理
 * - 字符串和数字工具
 * - 文件和URL处理
 * - 颜色和格式化工具
 * - 通用工具函数
 */

// 类型定义
export * from './types'

// 数据处理工具
export * from './data'

// 字符串工具
export * from './string'

// 数字工具
export * from './number'

// 日期时间工具
export * from './date'

// 文件处理工具
export * from './file'

// URL处理工具
export * from './url'

// 正则验证工具
export * from './validators'

// 通用工具
export * from './common'

// 随机数工具
export * from './random'

// 颜色工具
export { type ColorFormat } from './color'
export * from './color'

// 文件图标工具
export * from './file-icons'

// 格式化工具
export * from './format'

/**
 * 工具库版本信息
 */
export const version = '2.0.0'

/**
 * 工具库信息
 */
export const info = {
  name: '@linglongos/utils',
  version,
  description: '通用工具库 - 提供常用的工具方法',
  author: 'Org Team',
} as const
