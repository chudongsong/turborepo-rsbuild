import { Service } from 'egg'
import axios from 'axios'

/**
 * 插件 API 网关智能路由服务
 *
 * 负责智能路由插件的 API 调用：
 * 1. 核心插件 (集成运行时)
 *    - 路由到共享插件主机
 *    - 使用本地 RPC 调用
 *    - 高性能，低延迟
 *
 * 2. 第三方插件 (沙箱隔离)
 *    - 路由到独立的 FaaS 函数
 *    - 使用 HTTP 请求
 *    - 强隔离，安全性高
 *
 * @service PluginGateway
 */
export default class PluginGatewayService extends Service {
	/** API 调用超时时间 (毫秒) */
	private static readonly API_TIMEOUT = 10000

	/** 最大重试次数 */
	private static readonly MAX_RETRIES = 3

	/** 插件主机基础 URL */
	private static readonly HOST_BASE_URL = 'http://localhost'

	/**
	 * 路由插件 API 调用
	 *
	 * @param {number} pluginId 插件ID
	 * @param {string} method API 方法名
	 * @param {any} data 请求数据
	 * @param {object} options 调用选项
	 * @returns {Promise<any>} API 响应
	 */
	async routePluginCall(
		pluginId: number,
		method: string,
		data?: any,
		options?: {
			timeout?: number
			retry?: number
			userId?: string
		}
	): Promise<any> {
		try {
			// 1. 获取插件信息
			const plugin = await this.ctx.service.storage.getPluginById(pluginId)
			if (!plugin) {
				throw new Error('Plugin not found')
			}

			// 2. 检查插件是否启用
			if (plugin.status !== 'enabled') {
				throw new Error('Plugin is not enabled')
			}

			// 3. 检查插件权限
			const hasPermission = this.ctx.service.storage.checkPluginPermission(
				pluginId,
				'api:call',
				method
			)
			if (!hasPermission) {
				throw new Error(`Permission denied for API call: ${method}`)
			}

			// 4. 根据插件类型路由调用
			let result
			if (plugin.runtime === 'integrated') {
				// 核心插件：路由到共享主机
				result = await this.routeToSharedHost(plugin.name, method, data, options)
			} else {
				// 第三方插件：路由到 FaaS
				result = await this.routeToFaaS(plugin, method, data, options)
			}

			// 5. 记录 API 调用事件
			this.ctx.service.storage.logPluginEvent({
				plugin_id: pluginId,
				event_type: 'api_call',
				event_data: {
					method: method,
					data: data,
					result: result,
				},
			})

			return result
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error)
			this.ctx.logger.error(`Failed to route plugin call: ${message}`)

			// 记录 API 错误事件
			this.ctx.service.storage.logPluginEvent({
				plugin_id: pluginId,
				event_type: 'api_error',
				event_data: {
					method: method,
					error: message,
				},
			})

			throw error
		}
	}

	/**
	 * 路由到共享插件主机 (核心插件)
	 *
	 * @private
	 * @param {string} pluginName 插件名称
	 * @param {string} method API 方法名
	 * @param {any} data 请求数据
	 * @param {object} options 调用选项
	 * @returns {Promise<any>} API 响应
	 */
	private async routeToSharedHost(
		pluginName: string,
		method: string,
		data?: any,
		options?: {
			timeout?: number
			retry?: number
			userId?: string
		}
	): Promise<any> {
		const retryCount = options?.retry || 0
		const timeout = options?.timeout || PluginGatewayService.API_TIMEOUT

		try {
			// 1. 获取核心主机信息
			const host = this.ctx.service.storage.getPluginHostByName('core-host')
			if (!host || host.status !== 'running') {
				throw new Error('Core host is not running')
			}

			// 2. 构造请求 URL
			const url = `${PluginGatewayService.HOST_BASE_URL}:${4001}/rpc/${pluginName}/${method}`

			// 3. 发送 RPC 调用
			const response = await axios.post(
				url,
				{
					data: data,
					user_id: options?.userId,
					timestamp: Date.now(),
				},
				{
					timeout: timeout,
					headers: {
						'Content-Type': 'application/json',
						'X-Plugin-Name': pluginName,
						'X-API-Method': method,
					},
				}
			)

			// 4. 处理响应
			if (response.data?.error) {
				throw new Error(response.data.error)
			}

			return response.data?.result || response.data
		} catch (error) {
			// 重试逻辑
			if (retryCount < PluginGatewayService.MAX_RETRIES) {
				this.ctx.logger.warn(
					`Retrying shared host call (attempt ${retryCount + 1}/${PluginGatewayService.MAX_RETRIES})`
				)
				await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000))
				return this.routeToSharedHost(pluginName, method, data, {
					...options,
					retry: retryCount + 1,
				})
			}

			const message = error instanceof Error ? error.message : String(error)
			throw new Error(`Shared host RPC call failed: ${message}`)
		}
	}

	/**
	 * 路由到 FaaS 函数 (第三方插件)
	 *
	 * @private
	 * @param {object} plugin 插件信息
	 * @param {string} method API 方法名
	 * @param {any} data 请求数据
	 * @param {object} options 调用选项
	 * @returns {Promise<any>} API 响应
	 */
	private async routeToFaaS(
		plugin: any,
		method: string,
		data?: any,
		options?: {
			timeout?: number
			retry?: number
			userId?: string
		}
	): Promise<any> {
		const retryCount = options?.retry || 0
		const timeout = options?.timeout || PluginGatewayService.API_TIMEOUT

		try {
			// 1. 获取 FaaS 端点
			const endpoint = plugin.backend_entry
			if (!endpoint) {
				throw new Error('No FaaS endpoint configured for plugin')
			}

			// 2. 构造请求 URL
			const url = `${endpoint.replace(/\/$/, '')}/${method}`

			// 3. 发送 HTTP 请求
			const response = await axios.post(
				url,
				{
					data: data,
					user_id: options?.userId,
					timestamp: Date.now(),
					plugin_id: plugin.id,
					plugin_name: plugin.name,
				},
				{
					timeout: timeout,
					headers: {
						'Content-Type': 'application/json',
						'User-Agent': 'LinglongOS-PluginGateway/1.0',
						'X-Plugin-ID': plugin.id.toString(),
						'X-Plugin-Name': plugin.name,
						'X-API-Method': method,
					},
				}
			)

			// 4. 处理响应
			if (response.data?.status === 'error') {
				throw new Error(response.data.message || 'FaaS call failed')
			}

			return response.data?.result || response.data
		} catch (error) {
			// 重试逻辑
			if (retryCount < PluginGatewayService.MAX_RETRIES) {
				this.ctx.logger.warn(
					`Retrying FaaS call (attempt ${retryCount + 1}/${PluginGatewayService.MAX_RETRIES})`
				)
				await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000))
				return this.routeToFaaS(plugin, method, data, {
					...options,
					retry: retryCount + 1,
				})
			}

			const message = error instanceof Error ? error.message : String(error)
			throw new Error(`FaaS call failed: ${message}`)
		}
	}

	/**
	 * 插件间通信
	 *
	 * @param {number} fromPluginId 源插件ID
	 * @param {number} toPluginId 目标插件ID
	 * @param {string} method API 方法名
	 * @param {any} data 请求数据
	 * @returns {Promise<any>} API 响应
	 */
	async interPluginCall(
		fromPluginId: number,
		toPluginId: number,
		method: string,
		data?: any
	): Promise<any> {
		try {
			// 1. 验证源插件有权限调用其他插件
			const fromHasPermission = this.ctx.service.storage.checkPluginPermission(
				fromPluginId,
				'plugin:interact'
			)
			if (!fromHasPermission) {
				throw new Error('Source plugin does not have inter-plugin communication permission')
			}

			// 2. 验证目标插件存在且启用
			const toPlugin = await this.ctx.service.storage.getPluginById(toPluginId)
			if (!toPlugin) {
				throw new Error('Target plugin not found')
			}
			if (toPlugin.status !== 'enabled') {
				throw new Error('Target plugin is not enabled')
			}

			// 3. 添加调用上下文
			const enhancedData = {
				...data,
				_caller: {
					plugin_id: fromPluginId,
					plugin_name: (await this.ctx.service.storage.getPluginById(fromPluginId))?.name,
					timestamp: Date.now(),
				},
			}

			// 4. 路由到目标插件
			const result = await this.routePluginCall(toPluginId, method, enhancedData)

			// 5. 记录插件间调用事件
			this.ctx.service.storage.logPluginEvent({
				plugin_id: fromPluginId,
				event_type: 'info',
				event_data: {
					action: 'inter_plugin_call',
					target_plugin_id: toPluginId,
					method: method,
				},
			})

			return result
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error)
			this.ctx.logger.error(`Inter-plugin call failed: ${message}`)
			throw error
		}
	}

	/**
	 * 批量调用插件 API
	 *
	 * @param {Array} calls 调用列表
	 * @returns {Promise<Array>} 结果列表
	 */
	async batchCall(
		calls: Array<{
			pluginId: number
			method: string
			data?: any
			options?: {
				timeout?: number
				retry?: number
				userId?: string
			}
		}>
	): Promise<Array<{ pluginId: number; method: string; result: any; error?: string }>> {
		const results = await Promise.allSettled(
			calls.map(async (call) => {
				try {
					const result = await this.routePluginCall(
						call.pluginId,
						call.method,
						call.data,
						call.options
					)
					return {
						pluginId: call.pluginId,
						method: call.method,
						result,
					}
				} catch (error) {
					return {
						pluginId: call.pluginId,
						method: call.method,
						result: null,
						error: error instanceof Error ? error.message : String(error),
					}
				}
			})
		)

		return results.map((result, index) =>
			result.status === 'fulfilled'
				? result.value
				: {
						pluginId: calls[index].pluginId,
						method: calls[index].method,
						result: null,
						error: result.reason?.message || 'Unknown error',
				  }
		)
	}

	/**
	 * 获取插件 API 列表
	 *
	 * @param {number} pluginId 插件ID
	 * @returns {Promise<Array<string>>} API 方法列表
	 */
	async getPluginAPIs(pluginId: number): Promise<string[]> {
		try {
			const plugin = await this.ctx.service.storage.getPluginById(pluginId)
			if (!plugin) {
				throw new Error('Plugin not found')
			}

			// 从 manifest 中解析 API 方法
			const version = await this.ctx.service.storage.getPluginVersions(pluginId)
			if (!version || version.length === 0) {
				return []
			}

			const latestVersion = version.find((v: any) => v.is_latest) || version[0]
			const manifest = JSON.parse(latestVersion.manifest)

			return manifest.api?.methods || []
		} catch (error) {
			this.ctx.logger.error(`Failed to get plugin APIs: ${error}`)
			return []
		}
	}

	/**
	 * 健康检查
	 *
	 * @returns {Promise<object>} 健康状态
	 */
	async healthCheck(): Promise<any> {
		const status = {
			hosts: {},
			plugins: {},
			overall: 'healthy',
		}

		// 1. 检查插件主机
		const hostsStatus = await this.ctx.service.storage.getPluginHostStatus()
		status.hosts = hostsStatus

		// 2. 检查运行中的插件
		const plugins = this.ctx.service.storage.getPlugins({ limit: 100 })
		for (const plugin of plugins) {
			if (plugin.status === 'enabled') {
				const instances = this.ctx.service.storage.getPluginInstances(plugin.id)
				status.plugins[plugin.name] = {
					runtime: plugin.runtime,
					enabled_instances: instances.filter((i: any) => i.status === 'running').length,
					total_instances: instances.length,
				}
			}
		}

		// 3. 判断整体健康状态
		if (hostsStatus.timeout > 0 || hostsStatus.no_heartbeat > 0) {
			status.overall = 'degraded'
		}

		return status
	}
}
