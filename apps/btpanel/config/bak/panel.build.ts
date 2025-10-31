import humps from 'humps' // 驼峰转换
import minimist from 'minimist'

import path from 'node:path'
import aliasInfo from '../json/alias.config.json' // 别名配置
import proxyInfo from '../json/proxy.config.json' // 代理配置

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


	// 环境变量
	public prefixEnv: { [key: string]: string } = {}

	// 代理配置
	public proxyConfig: { [key: string]: AnyObject } = {
		'/api': {
			target: '',
			changeOrigin: true,
			pathRewrite: { '^/api': '' },
		},
	}

	// 别名配置
	public sourceConfig: { [key: string]: AnyObject } = {
		define: {},
		entry: {},
	}

	public aliasConfig: { [key: string]: string } = {}

	public htmlConfig: AnyObject = {}

	// 页面模板
	public pagetemplate: { [key: string]: string[] } = {
		index: ['./index.html', './src/main.ts'],
		login: ['./login.html', './src/main.ts'],
		software: ['./software.html', './src/main.ts'],
	}

	constructor() {
		// 获取命令行参数
		this.commandLineArgs = this.getCommandLineArgs(['ip', 'git'])
		// 获取代理信息
		this.proxyInfo = this.getProxyInfo(this.commandLineArgs.ip)
		// 获取环境变量
		this.prefixEnv = this.getEnvPrefixVal()
		// 是否是开发环境
		this.isDev = this.isDevelopEnv()
		// 生成代理配置
		this.proxyConfig = this.createProxyConfig()
		// 生成html模板配置
		this.htmlConfig = this.createHtmlConfig()
		// 生成入口与定义配置
		this.sourceConfig = this.createSourceConfig()
		// 生成别名配置（迁移到 rsbuild resolve.alias）
		this.aliasConfig = this.createAliasConfig()
	}

	/**
	 * @description 获取代理信息
	 */
	public getProxyInfo = (ip: string) => {
		try {
			const bag = proxyInfo as unknown as Record<string, Record<string, unknown>>
			const info = bag?.[ip]
			if (info) {
				const https = Boolean(info['HTTPS'])
				const proxyIp = String(info['IP'] ?? '')
				const proxyPort = Number(info['PORT'] ?? 0)
				const proxyKey = String(info['API'] ?? '')
				const sshPort = Number(info['SSH_PORT'] ?? 22)
				const sshUser = String(info['SSH_USER'] ?? 'root')
				const sshPassword = String(info['SSH_PASSWORD'] ?? '')
				return { https, proxyIp, proxyPort, proxyKey, sshPort, sshUser, sshPassword }
			}
		} catch {
			return this.proxyInfo
		}
		return this.proxyInfo
	}

	/**
	 * @description 是否是开发环境
	 * @returns
	 */

	private isDevelopEnv = (): boolean => {
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
		const customParams: string[] = Array.isArray(argv._) ? (argv._ as string[]) : []
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
	 * @param {string} key 环境变量key
	 */
	public getEnvPrefixVal = (prefix: string | string[] = ['RS_APP_', 'VITE_APP_']) => {
		const { env } = process
		const result: { [key: string]: string } = {}
		const prefixes = Array.isArray(prefix) ? prefix : [prefix]
		Object.keys(env).forEach(key => {
			const matched = prefixes.find(p => key.startsWith(p))
			if (matched) {
				const newKey = humps.camelize(key.replace(matched, '').toLowerCase())
				result[newKey] = env[key] as string
			}
		})
		return result
	}

	/**
	 * @description 生成代理配置
	 */
	public createProxyConfig = () => {
		const { proxyIp: ip, proxyPort: port } = this.proxyInfo // 获取代理信息
		const { https } = this.proxyInfo // 获取代理信息
		// console.log('proxyInfo', https);
		const proxyConfig = {
			'/api': {
				target: `${https ? 'https' : 'http'}://${ip || '192.168.1.196'}:${port || 8888}`, // 代理地址
				changeOrigin: false, // 是否跨域
				secure: false, // 不验证证书
				pathRewrite: { '^/api': '' }, // 重写路径
			},
		}
		return proxyConfig
	}

	/**
	 * @description 生成html模板配置
	 */
	public createHtmlConfig = () => {
		// 配置页面映射关系
		const {
			index: [index],
			software: [software],
			login: [login],
		} = this.pagetemplate
		const { prefixEnv, proxyInfo } = this
		return {
			// 根据入口文件名称，返回对应的html模板
			template({ entryName }: { entryName: string }) {
				const templates: { [key: string]: string } = { index, software, login }
				return templates[entryName] || index
			},
			// 指定标题
			title: prefixEnv.title || 'Vue App',
			// 模板参数注入
			templateParameters: (
				defaultValue: Record<string, unknown>,
				{ entryName }: { entryName: string }
			): Record<string, unknown> | void => {
				// 默认值
				const defaultVal = {
					...defaultValue,
					...prefixEnv,
					...proxyInfo,
				}
				const params: { [key: string]: Record<string, unknown> } = {
					index: defaultVal,
					software: defaultVal,
					login: defaultVal,
				}
				return params[entryName] || defaultVal
			},
		}
	}

	/**
	 * @description 生成别名配置
	 * @returns
	 */
	public createSourceConfig = () => {
		// 配置页面映射关系
		const {
			index: [, index],
			software: [, software],
			login: [, login],
		} = this.pagetemplate
		return {
			// 替换指定变量和值
			define: {},
			// 根据入口文件名称，返回对应的入口文件
			entry: { index, software, login },
		}
	}

	/**
	 * @description 生成别名配置（用于 rsbuild 的 resolve.alias）
	 */
	public createAliasConfig = () => {
		return {
			...aliasInfo,
			tslib: path.resolve(__dirname, '../node_modules/tslib'),
			'@vueuse/core': path.resolve(__dirname, '../node_modules/@vueuse/core'),
		}
	}
}
