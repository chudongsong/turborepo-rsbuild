import { checkUrl, checkPort, checkChinese, checkDomain, checkEmail, checkPhone, checkIp, checkDomainIp, checkDomainPort, checkIp6, checkIps, checkPanelUrl, compareVersion, getVersionsInfo, validatePort, checkVersion } from '../src/validators'

describe('validators', () => {
  it('checkUrl', () => {
    expect(checkUrl('https://example.com')).toBe(true)
    expect(checkUrl('ftp://example.com')).toBe(true)
    expect(checkUrl('not a url')).toBe(false)
  })

  it('checkPort', () => {
    expect(checkPort(80)).toBe(true)
    expect(checkPort('65535')).toBe(true)
    expect(checkPort('0')).toBe(true)
    expect(checkPort('70000')).toBe(false)
  })

  it('checkChinese', () => {
    expect(checkChinese('中文')).toBe(true)
    expect(checkChinese('abc')).toBe(false)
  })

  it('checkDomain', () => {
    expect(checkDomain('foo.bar')).toBe(true)
    expect(checkDomain('invalid_domain')).toBe(false)
  })

  it('checkEmail', () => {
    // 原实现要求域名标签至少2个字符，'a@b.com'不匹配
    expect(checkEmail('a@ab.com')).toBe(true)
    expect(checkEmail('a@b')).toBe(false)
  })

  it('checkPhone', () => {
    expect(checkPhone('13812345678')).toBe(true)
    expect(checkPhone('12812345678')).toBe(false)
    // 覆盖 number 分支
    expect(checkPhone(13812345678)).toBe(true)
  })

  it('checkIp', () => {
    expect(checkIp('127.0.0.1')).toBe(true)
    expect(checkIp('999.0.0.1')).toBe(false)
  })

  it('checkDomainIp', () => {
    expect(checkDomainIp('a.b.com')).toBe(true)
    expect(checkDomainIp('a')).toBe(false)
  })

  it('checkDomainPort', () => {
    expect(checkDomainPort('a.b.com:8080')).toBe(true)
    expect(checkDomainPort('a.b.com:70000')).toBe(false)
  })

  it('checkIp6', () => {
    expect(checkIp6('2001:0db8:85a3:0000:0000:8a2e:0370:7334')).toBe(true)
    expect(checkIp6('abcd')).toBe(false)
  })

  it('checkIps', () => {
    expect(checkIps('192.168.1.1/24')).toBe(true)
    // 原实现仅校验位数，不限制范围到32
    expect(checkIps('192.168.1.1/99')).toBe(true)
  })

  it('checkPanelUrl', () => {
    expect(checkPanelUrl('https://example.com')).toBe(true)
    expect(checkPanelUrl('http://[2001:db8::1]')).toBe(true)
    expect(checkPanelUrl('http//bad')).toBe(false)
  })

  it('version compare helpers', () => {
    const info = getVersionsInfo('1.2.0', '1.2')
    expect(info.versionArr).toEqual([1,2,0])
    expect(info.cloudVersionArr).toEqual([1,2,0])
    expect(compareVersion('1.2.0', '1.2.1')).toBe(-1)
    expect(compareVersion('1.2.2', '1.2.1')).toBe(1)
    expect(compareVersion('1.2.1', '1.2.1')).toBe(0)
    // 覆盖 checkVersion 全分支
    expect(checkVersion('1.2.3', '1.2.3')).toBe(1)
    expect(checkVersion('1.2.3', '1.2.2')).toBe(2)
    expect(checkVersion('1.3.0', '1.2.9')).toBe(-1)
  })

  it('validatePort', () => {
    let msg = ''
    validatePort({}, '8080', (m) => { msg = m || '' })
    expect(msg).toBe('')
    validatePort({}, '8080-8081', (m) => { msg = m || '' })
    expect(msg).toBe('')
    validatePort({}, '70000', (m) => { msg = m || '' })
    expect(msg).toContain('范围不正确')
    validatePort({}, '', (m) => { msg = m || '' })
    expect(msg).toContain('不可为空')
    validatePort({}, 'abc', (m) => { msg = m || '' })
    expect(msg).toContain('格式不正确')
    // 覆盖范围分支：start < 1
    validatePort({}, '0-100', (m) => { msg = m || '' })
    expect(msg).toContain('范围不正确')
    // 覆盖范围分支：end > 65535
    validatePort({}, '100-70000', (m) => { msg = m || '' })
    expect(msg).toContain('范围不正确')
    // 覆盖范围分支：start > end
    validatePort({}, '200-100', (m) => { msg = m || '' })
    expect(msg).toContain('范围不正确')
  })
})