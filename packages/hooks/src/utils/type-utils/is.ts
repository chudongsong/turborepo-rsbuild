import { is, isNil, isEmpty as isEmptys, test, has, both, complement } from 'ramda'

/**
 * Checks if a value is undefined or null
 * @param val - The value to check
 * @returns true if the value is undefined or null, false otherwise
 */
export const isUndefined = isNil

/**
 * Checks if a value is null
 * @param val - The value to check
 * @returns true if the value is null, false otherwise
 */
export const isNull = isNil

/**
 * Checks if a value is a boolean
 * @param val - The value to check
 * @returns true if the value is a boolean, false otherwise
 */
export const isBoolean = is(Boolean)

/**
 * Checks if a value is a number
 * @param val - The value to check
 * @returns true if the value is a number, false otherwise
 */
export const isNumber = is(Number)

/**
 * Checks if a value is an object (but not an array or function)
 * @param val - The value to check
 * @returns true if the value is an object, false otherwise
 */
export const isObject = <T>(val: unknown): val is object =>
	both(is(Object), both(complement(is(Function)), complement(is(Array))))(val as T)

/**
 * Checks if a value is a function
 * @param val - The value to check
 * @returns true if the value is a function, false otherwise
 */
export const isFunction = is(Function)

/**
 * Checks if a value is a string
 * @param val - The value to check
 * @returns true if the value is a string, false otherwise
 */
export const isString = is(String)

/**
 * Checks if a value is an array
 * @param val - The value to check
 * @returns true if the value is an array, false otherwise
 */
export const isArray = <T>(val: unknown): val is T[] => is(Array)(val as T)

/**
 * Checks if a value is empty (null, undefined, empty string, empty array, or empty object)
 * @param val - The value to check
 * @returns true if the value is empty, false otherwise
 */
export const isEmpty = (val: unknown): boolean => {
	if (val === null || val === undefined) return true
	if (typeof val === 'string') return val.length === 0
	if (Array.isArray(val)) return val.length === 0
	if (typeof val === 'object') return Object.keys(val).length === 0
	return false
}

/**
 * Checks if a string is a numeric string
 * @param val - The string to check
 * @returns true if the string is numeric, false otherwise
 */
export const isStringNumber = test(/^\d+$/)

/**
 * Checks if a value is a Date object
 * @param val - The value to check
 * @returns true if the value is a Date, false otherwise
 */
export const isDate = is(Date)

/**
 * Checks if a value is a Promise
 * @param val - The value to check
 * @returns true if the value is a Promise, false otherwise
 */
export const isPromise = is(Promise)

/**
 * Checks if a value is a Symbol
 * @param val - The value to check
 * @returns true if the value is a Symbol, false otherwise
 */
export const isSymbol = is(Symbol)

/**
 * Checks if a value is a Vue vNode
 * @param val - The value to check
 * @returns true if the value is a vNode, false otherwise
 */
export const isVNode = (val: any): val is object =>
	is(Object, val) && has('type', val)
