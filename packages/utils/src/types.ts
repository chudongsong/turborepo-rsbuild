/**
 * 类型守卫与常用类型工具
 * 仅使用原生判断，避免运行时依赖。
 */

/** 判断是否 undefined */
export const isUndefined = (val: unknown): val is undefined => val === undefined

/** 判断是否 null */
export const isNull = (val: unknown): val is null => val === null

/** 判断是否 boolean */
export const isBoolean = (val: unknown): val is boolean => typeof val === 'boolean'

/** 判断是否 number（排除 NaN）*/
export const isNumber = (val: unknown): val is number => typeof val === 'number' && !Number.isNaN(val)

/** 判断是否 string */
export const isString = (val: unknown): val is string => typeof val === 'string'

/** 判断是否 function */
export const isFunction = (val: unknown): val is (...args: any[]) => any => typeof val === 'function'

/** 判断是否 array */
export const isArray = <T = unknown>(val: unknown): val is T[] => Array.isArray(val)

/** 判断是否 object（非数组/函数）*/
export const isObject = <T extends object = Record<string, unknown>>(val: unknown): val is T => {
  return typeof val === 'object' && val !== null && !Array.isArray(val)
}

/** 判断是否日期对象 */
export const isDate = (val: unknown): val is Date => val instanceof Date

/** 判断是否 Promise */
export const isPromise = <T = unknown>(val: unknown): val is Promise<T> => {
  return !!val && typeof (val as any).then === 'function'
}

/** 判断是否 Symbol */
export const isSymbol = (val: unknown): val is symbol => typeof val === 'symbol'

/** 判断字符串是否数字组成 */
export const isStringNumber = (val: unknown): val is string => isString(val) && /^\d+$/.test(val as string)

/** 通用空判断：支持字符串、数组、对象、Map/Set */
export const isEmpty = (val: unknown): boolean => {
  if (val == null) return true
  if (isString(val) || isArray(val)) return (val as any).length === 0
  if (val instanceof Map || val instanceof Set) return val.size === 0
  if (isObject(val)) return Object.keys(val as object).length === 0
  return false
}

/** 判断是否 VNode（兼容原实现语义）*/
export const isVNode = (val: unknown): boolean => isObject(val) && 'type' in (val as any)

export type AnyObject = Record<string, any>
export type AnyFunction = (...args: any[]) => any