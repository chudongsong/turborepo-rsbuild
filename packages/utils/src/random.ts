/** 随机相关工具函数 */

/** 生成随机字符串 */
export function getRandomChart(len: number = 10, type: 'default' | 'password' | 'wp' | 'letter' = 'default'): string {
  let result = ''
  const chartObj: Record<string, string> = {
    default: 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz123456789',
    password: 'AaBbCcDdEeFfGHhiJjKkLMmNnPpRSrTsWtXwYxZyz2345678',
    wp: 'AaBbCcDdEeFfGHhiJjKkLMmNnPpRSrTsWtXwYxZyz12345678!@#$%^&*?',
    letter: 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz',
  }
  const str = chartObj[type]
  for (let i = 0; i < len; i++) {
    result += str.charAt(Math.floor(Math.random() * str.length))
  }
  return result
}

/** 生成随机密码 */
export function getRandomPwd(len: number = 16): string {
  return getRandomChart(len, 'password')
}

/** 生成随机十六进制字符串（长度默认 8）*/
export function getRandom(length: number = 8): string {
  return Math.random().toString(16).slice(2, 2 + length)
}