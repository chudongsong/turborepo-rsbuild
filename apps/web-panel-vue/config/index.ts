/* eslint-disable @typescript-eslint/naming-convention */
import humps from 'humps' // 驼峰转换
import { loadEnv } from 'vite'
import minimist from 'minimist' // 命令行参数解析
import aliasInfo from './json/alias.config.json' // 别名配置
import proxyInfo from './json/proxy.config.json' // 代理配置
// import dockerInfo from '../.temp/dockerPanel.config.json' // docker配置

// 代理信息类型
type ProxyInfoType = {
	[key: string]: {
		HTTPS: boolean
		IP: string
		API: string
		PORT: number
		SSH_PORT: number
		SSH_USER: string
		SSH_PASSWORD: string
	}
}

// 在类外部添加类型定义

/**
 * @description 开发工具类
 */
export default class DevTools {
	// 命令行参数
	public commandLineArgs: { [key: string]: string }

	// 代理信息
	public proxyInfo = {
		https: true,
		proxyIp: '192.168.1.196',
		proxyPort: 8888,
		proxyKey: '',
		sshPort: 22,
		sshUser: 'root',
		sshPassword: 'www.bt.cn',
	}

	// 是否是开发环境
	public isDev = process.env.NODE_ENV === 'development'

	public isHttps = false

	// 环境变量
	public prefixEnv: { [key: string]: string } = {}

	// 默认别名
	public aliasInfo: { find: string; replacement: string }[] = []

	// 代理配置
	public proxyConfig: { [key: string]: AnyObject } = {
		'/api': {
			target: '',
			changeOrigin: true,
			rewrite: { '^/api': '' },
		},
	}

	constructor() {
		// 获取命令行参数
		this.commandLineArgs = this.getCommandLineArgs(['ip', 'git'])

		// 获取代理信息
		this.proxyInfo = this.getProxyInfo(this.commandLineArgs.ip)

		this.isHttps = this.proxyInfo.https
		// 获取环境变量
		this.prefixEnv = this.getEnvPrefixVal()
		// 获取默认别名
		this.aliasInfo = this.getdefaultAlias()
		// 是否是开发环境
		// eslint-disable-next-line no-underscore-dangle
		this.isDev = this._isDevelop()
		// 代理配置
		this.proxyConfig = this.createProxyConfig()
	}

	public isDevelop = () => {
		const type = process.argv[process.argv.length - 1]
		return type === 'develop'
	}

	/**
	 * @description 获取代理信息
	 */
	public getProxyInfo = (ip: string) => {
		try {
			const info = (proxyInfo as unknown as ProxyInfoType)[ip] // 获取代理信息，非标准写法
			if (info) {
				const { HTTPS, IP, PORT, SSH_PORT, SSH_USER, SSH_PASSWORD, API } = info
				return {
					https: HTTPS,
					proxyIp: IP,
					proxyPort: PORT,
					proxyKey: API,
					sshPort: SSH_PORT,
					sshUser: SSH_USER,
					sshPassword: SSH_PASSWORD,
				}
			}
			// 检查JSON文件内容是否为空
			// if (Object.keys(dockerInfo).length > 0) return dockerInfo
		} catch (error) {
			return this.proxyInfo
		}
		return this.proxyInfo
	}

	/**
	 * @description 是否是开发环境
	 * @returns
	 */

	private _isDevelop = (): boolean => {
		return process.env.NODE_ENV === 'development'
	}

	/**
	 * @description 获取命令行参数
	 * @param {string[]} config 配置
	 */
	public getCommandLineArgs = (config: string[] = ['ip', 'git']) => {
		// 获取命令所有的参数
		const argv = minimist(process.argv.slice(3))
		const params: { [key: string]: string } = {}
		// 获取自定义参数
		const customParams: string[] = argv._
		// eslint-disable-next-line no-restricted-syntax
		for (const item of config) {
			const index = customParams.indexOf(`--${item}`)
			const value = customParams[index + 1]
			// 如果存在参数,并且参数不为空，就添加到参数中
			if (index > -1 && value && !value?.includes('--')) {
				params[item] = customParams[index + 1]
			}
		}
		return params
	}

	/**
	 * @description 获取环境变量
	 * @param {string} prefix 前缀
	 */
	public getEnvPrefixVal = (prefix = 'VITE_APP_') => {
		const envs = loadEnv(this.getMode(), process.cwd())
		const result: { [key: string]: string } = {}
		Object.keys(envs).forEach(key => {
			const newKey = humps.camelize(key.replace(prefix, '').toLowerCase())
			result[newKey] = envs[key] as string
		})
		return result
	}

	/**
	 * @description 生成代理配置
	 */
	public getMode = (): string => {
		return process.env.NODE_ENV || 'development'
	}

	/**
	 * @description 生成代理配置
	 */
	public createProxyConfig = () => {
		const { proxyIp: ip, proxyPort: port } = this.proxyInfo // 获取代理信息
		const { https } = this.proxyInfo // 获取代理信息
		const proxyConfig = (() => {
			const config = {
				target: `${https ? 'https' : 'http'}://${ip || '192.168.1.196'}:${port || 8888}`,
				changeOrigin: false,
				rewrite: (path: string) => path.replace(/^\/api/, ''),
			}
			return { '/api': { ...(https ? { ...config, secure: false, ws: false } : config) } }
		})()
		return proxyConfig
	}

	/**
	 * @description 获取默认别名
	 * @param {string} src 源目录
	 */
	public getdefaultAlias = (src: string = 'src') => {
		const list: { find: string; replacement: string }[] = []
		// eslint-disable-next-line no-restricted-syntax
		for (const item in aliasInfo) {
			if (Object.prototype.hasOwnProperty.call(aliasInfo, item)) {
				const element = (aliasInfo as { [key: string]: string })[item]
				list.push({
					find: item,
					replacement: `${src}/${element}`,
				})
			}
		}
		return list
	}
}
