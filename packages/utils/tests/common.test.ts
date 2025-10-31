import { clearBlankSpace, getByteUnit, getStyleUnit, getPageTotal } from '../src/common'

describe('common utils', () => {
  it('clearBlankSpace', () => {
    expect(clearBlankSpace('a b c')).toBe('abc')
    expect(clearBlankSpace(' a b  c ')).toBe('abc')
  })
  it('getByteUnit', () => {
    expect(getByteUnit(1024)).toBe('1.00 KB')
    expect(getByteUnit(1024, false)).toBe('1.00')
    expect(getByteUnit(1024, true, 0, 'KB')).toBe('1 KB')
    expect(getByteUnit(0, true, 2, 'B')).toBe('0 B')
    // 额外覆盖：默认参数、fixed=0 四舍五入、未匹配单位
    expect(getByteUnit()).toBe('0 B')
    expect(getByteUnit(1536, true, 0)).toBe('2 KB')
    expect(getByteUnit(2048, false, 0, 'KB')).toBe('2')
    expect(getByteUnit(1024, true, 2, 'XB')).toBe('')
  })
  it('getStyleUnit', () => {
    expect(getStyleUnit(10, 'px')).toBe('10px')
    expect(getStyleUnit('1.2', 'rem')).toBe('1.2rem')
    // 默认单位 rem 分支覆盖
    expect(getStyleUnit(2)).toBe('2rem')
    expect(getStyleUnit(null as unknown as string, 'px')).toBe('null')
  })
  it('getPageTotal', () => {
    const html = "<span class='Pcount'>共100条</span>"
    expect(getPageTotal(html)).toBe(100)
    expect(getPageTotal('n/a')).toBe(0)
  })
})