import { is, isNil, isEmpty as isEmptys, test, has, both, complement } from 'ramda'

export const isUndefined = isNil
export const isNull = isNil
export const isBoolean = is(Boolean)
export const isNumber = is(Number)
export const isObject = <T>(val: unknown) => both(is(Object), both(complement(is(Function)), complement(is(Array))))(val as T)
export const isFunction = is(Function)
export const isString = is(String)
export const isArray = <T>(val: unknown) => is(Array)(val as T)
export const isEmpty = isEmptys
// export const isElement = is(Element)
export const isStringNumber = test(/^\d+$/)
// export const isWindow = is(Window)
export const isDate = is(Date)
export const isPromise = is(Promise)
export const isSymbol = is(Symbol)
export const isVNode = (val: any) => is(Object, val) && has('type', val)
