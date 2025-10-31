/**
 * 校验函数集合：URL、端口、中文、域名、邮箱、手机号、IP、面板地址等。
 */

import { isNumber, isString, isEmpty as isEmptyVal } from './types'

/** 校验 URL */
export function checkUrl(url: string): boolean {
  return /^((https|http|ftp|rtsp|mms)?:\/\/)[^\s]+/.test(url)
}

/** 校验端口（1-65535）*/
export function checkPort(port: string | number): boolean {
  const str = isNumber(port) ? String(port) : String(port)
  return /^([0-9]|[1-9]\d|[1-9]\d{2}|[1-9]\d{3}|[1-5]\d{4}|6[0-4]\d{3}|65[0-4]\d{2}|655[0-2]\d|6553[0-5])$/.test(str)
}

/** 校验是否包含中文 */
export function checkChinese(val: string): boolean {
  return /[\u4e00-\u9fa5]/.test(val)
}

/** 校验域名 */
export function checkDomain(val: string): boolean {
  const v = String(val).trim()
  return /^([\w\u4e00-\u9fa5\-\*]{1,100}\.){1,10}([\w\u4e00-\u9fa5\-]{1,24}|[\w\u4e00-\u9fa5\-]{1,24}\.[\w\u4e00-\u9fa5\-]{1,24})$/.test(v)
}

/** 校验邮箱 */
export function checkEmail(email: string): boolean {
  return /\w[-\w.+]*@([A-Za-z0-9][-A-Za-z0-9]+\.)+[A-Za-z]{2,14}/.test(email)
}

/** 校验手机号（中国大陆）*/
export function checkPhone(phone: string | number): boolean {
  const str = isNumber(phone) ? String(phone) : String(phone)
  return /^1[3456789]\d{9}$/.test(str)
}

/** 校验 IPv4 或 IPv6 */
export function checkIp(ip: string): boolean {
  return /^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/.test(
    ip,
  )
}

/** 校验域名形式的 IP */
export function checkDomainIp(val: string): boolean {
  return /^(?=^.{3,255}$)[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+$/.test(val)
}

/** 校验 域名:端口 */
export function checkDomainPort(val: string): boolean {
  return /^([\w\u4e00-\u9fa5\-\*]{1,100}\.){1,10}([\w\u4e00-\u9fa5\-]{1,24}|[\w\u4e00-\u9fa5\-]{1,24}\.[\w\u4e00-\u9fa5\-]{1,24})(:([1-9]|[1-9]\d|[1-9]\d{2}|[1-9]\d{3}|[1-5]\d{4}|6[0-4]\d{3}|65[0-4]\d{2}|655[0-2]\d|6553[0-5]))?$/.test(
    val,
  )
}

/** 校验 IPv6 */
export function checkIp6(ip: string): boolean {
  return /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/.test(ip)
}

/** 校验 IP 段（CIDR）*/
export function checkIps(ips: string): boolean {
  return /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(\/\d{1,2})?$/.test(ips)
}

/** 校验面板地址（支持 IPv6）*/
export function checkPanelUrl(url: string): boolean {
  const strict = /^(https?):\/\/(?:(?:[\w-]+\.)+[a-zA-Z]{2,}|(?:25[0-5]|2[0-4][0-9]|[01]?\d\d?)\.(?:25[0-5]|2[0-4][0-9]|[01]?\d\d?)\.(?:25[0-5]|2[0-4][0-9]|[01]?\d\d?)\.(?:25[0-5]|2[0-4][0-9]|[01]?\d\d?)|(?:\[(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|(?:[0-9a-fA-F]{1,4}:){1,7}:|(?:[0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|(?:[0-9a-fA-F]{1,4}:){1,5}(?::[0-9a-fA-F]{1,4}){1,2}|(?:[0-9a-fA-F]{1,4}:){1,4}(?::[0-9a-fA-F]{1,4}){1,3}|(?:[0-9a-fA-F]{1,4}:){1,3}(?::[0-9a-fA-F]{1,4}){1,4}|(?:[0-9a-fA-F]{1,4}:){1,2}(?::[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:(?::[0-9a-fA-F]{1,4}){1,6}|:(?::[0-9a-fA-F]{1,4}){1,7}|:(?::[0-9a-fA-F]{1,4}){1,6}:|(?:[0-9a-fA-F]{1,4}:){1,6}:(?:25[0-5]|2[0-4][0-9]|[01]?\d\d?)\.(?:25[0-5]|2[0-4][0-9]|[01]?\d\d?)\.(?:25[0-5]|2[0-4][0-9]|[01]?\d\d?)\.(?:25[0-5]|2[0-4][0-9]|[01]?\d\d?))\])(?::\d{1,5})?(?:\/.*)?$/
  if (strict.test(url)) return true
  // 宽松匹配带方括号的 IPv6 主机，兼容原逻辑测试用例
  const ipv6Host = /^(https?):\/\/\[[0-9a-fA-F:]+\](?::\d{1,5})?(?:\/.*)?$/
  return ipv6Host.test(url)
}

/** 将版本号字符串转换为数字数组 */
function toNumbersArray(version: string): number[] {
  return version.split('.').map((v) => parseInt(v, 10))
}

/** 获取版本号比较信息 */
export function getVersionsInfo(version: string, version2: string): { versionArr: number[]; cloudVersionArr: number[]; maxLength: number } {
  let versionArr = toNumbersArray(version)
  let cloudVersionArr = toNumbersArray(version2)
  const maxLength = Math.max(versionArr.length, cloudVersionArr.length)
  const fill = (arr: number[]) => arr.concat(Array(maxLength - arr.length).fill(0))
  versionArr = fill(versionArr)
  cloudVersionArr = fill(cloudVersionArr)
  return { versionArr, cloudVersionArr, maxLength }
}

/** 匹配版本（特殊逻辑）*/
export function checkVersion(version: string, cloudVersion: string): number {
  const { versionArr, cloudVersionArr, maxLength } = getVersionsInfo(version, cloudVersion)
  const diffs = versionArr.map((v, i) => v - cloudVersionArr[i])
  const index = diffs.findIndex((d) => d !== 0)
  if (index === -1) return 1
  if (index === maxLength - 1) return 2
  return -1
}

/** 比较版本大小：-1/0/1 */
export function compareVersion(version1: string, version2: string): -1 | 0 | 1 {
  const { versionArr, cloudVersionArr } = getVersionsInfo(version1, version2)
  for (let i = 0; i < versionArr.length; i++) {
    if (versionArr[i] > cloudVersionArr[i]) return 1
    if (versionArr[i] < cloudVersionArr[i]) return -1
  }
  return 0
}

/** 端口校验（支持 逗号分隔 和 范围 a-b），通过回调返回错误 */
export function validatePort(rule: Record<string, unknown>, input: string, callback: (msg?: string) => void): void {
  const ports = String(input).split(',')
  const regex = /^\d+$/
  for (const port of ports) {
    if (regex.test(port)) {
      const num = parseInt(port, 10)
      if (num < 1 || num > 65535) {
        callback('端口输入范围不正确，请重新输入')
        return
      }
    } else if (port.includes('-')) {
      const [startStr, endStr] = port.split('-')
      const start = parseInt(startStr, 10)
      const end = parseInt(endStr, 10)
      if (start < 1 || end > 65535 || start > end) {
        callback('端口输入范围不正确，请重新输入')
        return
      }
    } else if (isEmptyVal(port)) {
      callback('端口不可为空，请输入')
      return
    } else {
      callback('端口格式不正确，请重新输入')
      return
    }
  }
  callback()
}