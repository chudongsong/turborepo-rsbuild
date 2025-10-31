import {
  isUndefined,
  isNull,
  isBoolean,
  isNumber,
  isString,
  isFunction,
  isArray,
  isObject,
  isDate,
  isPromise,
  isSymbol,
  isStringNumber,
  isEmpty,
  isVNode,
} from '../src/types'

describe('types', () => {
  it('basic type guards', () => {
    expect(isUndefined(undefined)).toBe(true)
    expect(isUndefined(null)).toBe(false)
    expect(isNull(null)).toBe(true)
    expect(isNull(undefined)).toBe(false)
    expect(isBoolean(true)).toBe(true)
    expect(isBoolean('true')).toBe(false)
    expect(isNumber(1)).toBe(true)
    expect(isNumber(NaN)).toBe(false)
    expect(isString('a')).toBe(true)
    expect(isString(1)).toBe(false)
    expect(isFunction(() => {})).toBe(true)
    expect(isFunction({})).toBe(false)
    expect(isArray([])).toBe(true)
    expect(isArray({})).toBe(false)
    expect(isObject({})).toBe(true)
    expect(isObject([])).toBe(false)
    expect(isObject(null)).toBe(false)
    expect(isDate(new Date())).toBe(true)
    expect(isDate('2020-01-01')).toBe(false)
    expect(isPromise(Promise.resolve())).toBe(true)
    expect(isPromise({ then: () => {} })).toBe(true)
    expect(isPromise(null)).toBe(false)
    expect(isSymbol(Symbol('x'))).toBe(true)
  })

  it('string number and empties', () => {
    expect(isStringNumber('123')).toBe(true)
    expect(isStringNumber('abc')).toBe(false)
    expect(isEmpty('')).toBe(true)
    expect(isEmpty([])).toBe(true)
    expect(isEmpty({})).toBe(true)
    expect(isEmpty(new Map())).toBe(true)
    expect(isEmpty(new Set())).toBe(true)
    expect(isEmpty('a')).toBe(false)
    // 额外覆盖：null/undefined 与非对象分支
    expect(isEmpty(null as unknown as string)).toBe(true)
    expect(isEmpty(undefined as unknown as string)).toBe(true)
    expect(isEmpty(0 as unknown as string)).toBe(false)
    expect(isEmpty(true as unknown as string)).toBe(false)
  })

  it('vnode check', () => {
    expect(isVNode({ type: 'div' })).toBe(true)
    expect(isVNode({})).toBe(false)
  })
})