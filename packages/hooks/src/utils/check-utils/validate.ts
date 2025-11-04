import { pipe, ifElse, is, test, toString, identity } from 'ramda'

/**
 * Check if a string is a valid URL
 * @param url - The URL to validate
 * @returns true if valid URL, false otherwise
 */
export const checkUrl = test(/^((https|http|ftp|rtsp|mms)?:\/\/)[^\s]+/)

/**
 * Check if a value is a valid port number
 * @param port - Port number as string or number
 * @returns true if valid port, false otherwise
 */
export const checkPort = pipe(
	ifElse(is(Number), toString, identity),
	test(/^([0-9]|[1-9]\d|[1-9]\d{2}|[1-9]\d{3}|[1-5]\d{4}|6[0-4]\d{3}|65[0-4]\d{2}|655[0-2]\d|6553[0-5])$/)
)

/**
 * Check if a string contains Chinese characters
 * @param val - The string to check
 * @returns true if contains Chinese, false otherwise
 */
export const checkChinese = test(/[\u4e00-\u9fa5]/)

/**
 * Check if a string is a valid domain name
 * @param val - The domain to validate
 * @returns true if valid domain, false otherwise
 */
export const checkDomain = pipe(
	test(/^([\w\u4e00-\u9fa5\-\*]{1,100}\.){1,10}([\w\u4e00-\u9fa5\-]{1,24}|[\w\u4e00-\u9fa5\-]{1,24}\.[\w\u4e00-\u9fa5\-]{1,24})$/)
)

/**
 * Check if a string is a valid email address
 * @param email - The email to validate
 * @returns true if valid email, false otherwise
 */
export const checkEmail = test(/\w[-\w.+]*@([A-Za-z0-9][-A-Za-z0-9]+\.)+[A-Za-z]{2,14}/)

/**
 * Check if a value is a valid Chinese mobile phone number
 * @param phone - Phone number as string or number
 * @returns true if valid phone, false otherwise
 */
export const checkPhone = pipe(
	ifElse(is(Number), toString, identity),
	test(/^1[3456789]\d{9}$/)
)

/**
 * Check if a string is a valid IP address (IPv4 or IPv6)
 * @param ip - The IP address to validate
 * @returns true if valid IP, false otherwise
 */
export const checkIp = test(
	/^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/
)

/**
 * Check if a string is a domain-format IP address
 * @param val - The string to check
 * @returns true if valid domain IP, false otherwise
 */
export const checkDomainIp = test(/^(?=^.{3,255}$)[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+$/)

/**
 * Check if a string is a valid domain:port format
 * @param val - The domain:port string to validate
 * @returns true if valid format, false otherwise
 */
export const checkDomainPort = test(
	/^([\w\u4e00-\u9fa5\-\*]{1,100}\.){1,10}([\w\u4e00-\u9fa5\-]{1,24}|[\w\u4e00-\u9fa5\-]{1,24}\.[\w\u4e00-\u9fa5\-]{1,24})(:([1-9]|[1-9]\d|[1-9]\d{2}|[1-9]\d{3}|[1-5]\d{4}|6[0-4]\d{3}|65[0-4]\d{2}|655[0-2]\d|6553[0-5]))?$/
)

/**
 * Check if a string is a valid IPv6 address
 * @param ip - The IPv6 address to validate
 * @returns true if valid IPv6, false otherwise
 */
export const checkIp6 = test(/^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/)

/**
 * Check if a string is a valid IP range (CIDR notation)
 * @param ips - The IP range to validate
 * @returns true if valid IP range, false otherwise
 */
export const checkIps = test(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(\/\d{1,2})?$/)

/**
 * Check if a string is a valid panel URL
 * @param url - The panel URL to validate
 * @returns true if valid panel URL, false otherwise
 */
export const checkPanelUrl = test(
	/^(https?):\/\/(?:(?:[\w-]+\.)+[a-zA-Z]{2,}|(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)|(?:\[(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|(?:[0-9a-fA-F]{1,4}:){1,7}:|(?:[0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|(?:[0-9a-fA-F]{1,4}:){1,5}(?::[0-9a-fA-F]{1,4}){1,2}|(?:[0-9a-fA-F]{1,4}:){1,4}(?::[0-9a-fA-F]{1,4}){1,3}|(?:[0-9a-fA-F]{1,4}:){1,3}(?::[0-9a-fA-F]{1,4}){1,4}|(?:[0-9a-fA-F]{1,4}:){1,2}(?::[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:(?::[0-9a-fA-F]{1,4}){1,6}|:(?::[0-9a-fA-F]{1,4}){1,7}|:(?::[0-9a-fA-F]{1,4}){1,6}:|(?:[0-9a-fA-F]{1,4}:){1,6}:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?))\])(?::\d{1,5})?(?:\/.*)?$/
)
