import { Service } from 'egg'
import { spawn, ChildProcess } from 'node:child_process'
import path from 'node:path'

/**
 * 插件运行时环境管理服务
 *
 * 负责管理插件的两种运行时环境：
 * 1. 集成运行时 (Integrated Runtime) - 核心插件
 *    - 使用 Module Federation 加载
 *    - 运行在共享插件主机进程
 *    - 高性能，深度集成
 *
 * 2. 沙箱运行时 (Sandboxed Runtime) - 第三方插件
 *    - 使用 iFrame 隔离
 *    - 运行在独立的沙箱环境
 *    - 高安全，强隔离
 *
 * @service PluginRuntime
 */
export default class PluginRuntimeService extends Service {
	/** 核心插件主机端口 */
	private static readonly CORE_HOST_PORT = 4001

	/** 用户插件主机端口 */
	private static readonly USER_HOST_PORT = 4002

	/** 插件主机超时时间 (毫秒) */
	private static readonly HOST_TIMEOUT = 30000

	/** 沙箱默认端口起始 */
	private static readonly SANDBOX_PORT_START = 5000

	/** 沙箱端口范围 */
	private static readonly SANDBOX_PORT_RANGE = 1000

	/** 已使用的沙箱端口 */
	private usedSandboxPorts: Set<number> = new Set()

	/**
	 * 加载核心插件 (集成运行时)
	 *
	 * @param {number} pluginId 插件ID
	 * @returns {Promise<{remoteName: string, port: number}>} 远程模块信息和端口
	 */
	async loadIntegratedPlugin(pluginId: number): Promise<{ remoteName: string; port: number }> {
		try {
			// 1. 获取插件信息
			const plugin = await this.ctx.service.storage.getPluginById(pluginId)
			if (!plugin) {
				throw new Error('Plugin not found')
			}

			if (plugin.runtime !== 'integrated') {
				throw new Error('Plugin is not an integrated plugin')
			}

			// 2. 启动核心插件主机（如果未启动）
			await this.ensureCoreHostRunning()

			// 3. 准备 Module Federation 配置
			const remoteName = this.generateRemoteName(plugin.name)
			const port = PluginRuntimeService.CORE_HOST_PORT

			// 4. 通知插件主机加载插件
			await this.notifyHostLoadPlugin('core-host', {
				plugin_id: pluginId,
				plugin_name: plugin.name,
				remote_name: remoteName,
				backend_entry: plugin.backend_entry,
			})

			// 5. 记录加载事件
			this.ctx.service.storage.logPluginEvent({
				plugin_id: pluginId,
				event_type: 'info',
				event_data: {
					action: 'load_integrated_plugin',
					remote_name: remoteName,
					port: port,
				},
			})

			this.ctx.logger.info(`Integrated plugin ${plugin.name} loaded successfully`)

			return { remoteName, port }
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error)
			this.ctx.logger.error(`Failed to load integrated plugin ${pluginId}: ${message}`)
			throw error
		}
	}

	/**
	 * 卸载核心插件
	 *
	 * @param {number} pluginId 插件ID
	 * @returns {Promise<void>}
	 */
	async unloadIntegratedPlugin(pluginId: number): Promise<void> {
		try {
			// 1. 获取插件信息
			const plugin = await this.ctx.service.storage.getPluginById(pluginId)
			if (!plugin) {
				throw new Error('Plugin not found')
			}

			// 2. 通知插件主机卸载插件
			await this.notifyHostUnloadPlugin('core-host', {
				plugin_id: pluginId,
				plugin_name: plugin.name,
			})

			// 3. 记录卸载事件
			this.ctx.service.storage.logPluginEvent({
				plugin_id: pluginId,
				event_type: 'info',
				event_data: {
					action: 'unload_integrated_plugin',
				},
			})

			this.ctx.logger.info(`Integrated plugin ${plugin.name} unloaded successfully`)
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error)
			this.ctx.logger.error(`Failed to unload integrated plugin ${pluginId}: ${message}`)
			throw error
		}
	}

	/**
	 * 加载第三方插件 (沙箱运行时)
	 *
	 * @param {number} pluginId 插件ID
	 * @returns {Promise<{sandboxUrl: string, port: number}>} 沙箱URL和端口
	 */
	async loadSandboxedPlugin(pluginId: number): Promise<{ sandboxUrl: string; port: number }> {
		try {
			// 1. 获取插件信息
			const plugin = await this.ctx.service.storage.getPluginById(pluginId)
			if (!plugin) {
				throw new Error('Plugin not found')
			}

			if (plugin.runtime !== 'sandboxed') {
				throw new Error('Plugin is not a sandboxed plugin')
			}

			// 2. 分配沙箱端口
			const port = this.allocateSandboxPort()

			// 3. 启动独立的沙箱服务
			const sandboxUrl = await this.startSandboxService(plugin, port)

			// 4. 记录加载事件
			this.ctx.service.storage.logPluginEvent({
				plugin_id: pluginId,
				event_type: 'info',
				event_data: {
					action: 'load_sandboxed_plugin',
					sandbox_url: sandboxUrl,
					port: port,
				},
			})

			this.ctx.logger.info(`Sandboxed plugin ${plugin.name} loaded successfully`)

			return { sandboxUrl, port }
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error)
			this.ctx.logger.error(`Failed to load sandboxed plugin ${pluginId}: ${message}`)
			throw error
		}
	}

	/**
	 * 卸载第三方插件
	 *
	 * @param {number} pluginId 插件ID
	 * @returns {Promise<void>}
	 */
	async unloadSandboxedPlugin(pluginId: number): Promise<void> {
		try {
			// 1. 获取插件信息
			const plugin = await this.ctx.service.storage.getPluginById(pluginId)
			if (!plugin) {
				throw new Error('Plugin not found')
			}

			// 2. 停止沙箱服务（如果有）
			const instances = this.ctx.service.storage.getPluginInstances(pluginId)
			for (const instance of instances) {
				if (instance.sandbox_url) {
					await this.stopSandboxService(instance.sandbox_url)
					this.releaseSandboxPort(instance.port)
				}
			}

			// 3. 记录卸载事件
			this.ctx.service.storage.logPluginEvent({
				plugin_id: pluginId,
				event_type: 'info',
				event_data: {
					action: 'unload_sandboxed_plugin',
				},
			})

			this.ctx.logger.info(`Sandboxed plugin ${plugin.name} unloaded successfully`)
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error)
			this.ctx.logger.error(`Failed to unload sandboxed plugin ${pluginId}: ${message}`)
			throw error
		}
	}

	/**
	 * 启动插件主机
	 *
	 * @param {string} hostName 主机名称
	 * @returns {Promise<void>}
	 */
	async startPluginHost(hostName: string): Promise<void> {
		try {
			// 1. 检查主机是否已运行
			const host = this.ctx.service.storage.getPluginHostByName(hostName)
			if (host && host.status === 'running') {
				this.ctx.logger.warn(`Host ${hostName} is already running`)
				return
			}

			// 2. 确定主机配置
			const config = this.getHostConfig(hostName)

			// 3. 启动主机进程
			const process = this.spawnHostProcess(hostName, config)

			// 4. 更新主机状态
			this.ctx.service.storage.updatePluginHost(hostName, {
				process_id: process.pid?.toString(),
				status: 'starting',
			})

			// 5. 等待主机启动
			await this.waitForHostReady(hostName, PluginRuntimeService.HOST_TIMEOUT)

			// 6. 更新状态为运行中
			this.ctx.service.storage.updatePluginHost(hostName, {
				status: 'running',
				last_heartbeat: Date.now(),
			})

			// 7. 记录启动事件
			this.ctx.service.storage.logPluginEvent({
				plugin_id: 0,
				event_type: 'info',
				event_data: {
					action: 'start_host',
					host_name: hostName,
					process_id: process.pid,
				},
			})

			this.ctx.logger.info(`Plugin host ${hostName} started successfully`)
		} catch (error) {
			// 更新状态为错误
			this.ctx.service.storage.updatePluginHost(hostName, {
				status: 'error',
			})

			const message = error instanceof Error ? error.message : String(error)
			this.ctx.logger.error(`Failed to start plugin host ${hostName}: ${message}`)
			throw error
		}
	}

	/**
	 * 停止插件主机
	 *
	 * @param {string} hostName 主机名称
	 * @returns {Promise<void>}
	 */
	async stopPluginHost(hostName: string): Promise<void> {
		try {
			// 1. 获取主机信息
			const host = this.ctx.service.storage.getPluginHostByName(hostName)
			if (!host) {
				throw new Error('Plugin host not found')
			}

			// 2. 检查主机状态
			if (host.status !== 'running') {
				this.ctx.logger.warn(`Host ${hostName} is not running`)
				return
			}

			// 3. 终止进程
			if (host.process_id) {
				process.kill(parseInt(host.process_id))
			}

			// 4. 更新状态为已停止
			this.ctx.service.storage.updatePluginHost(hostName, {
				status: 'stopped',
			})

			// 5. 记录停止事件
			this.ctx.service.storage.logPluginEvent({
				plugin_id: 0,
				event_type: 'info',
				event_data: {
					action: 'stop_host',
					host_name: hostName,
				},
			})

			this.ctx.logger.info(`Plugin host ${hostName} stopped successfully`)
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error)
			this.ctx.logger.error(`Failed to stop plugin host ${hostName}: ${message}`)
			throw error
		}
	}

	/**
	 * 重启插件主机
	 *
	 * @param {string} hostName 主机名称
	 * @returns {Promise<void>}
	 */
	async restartPluginHost(hostName: string): Promise<void> {
		try {
			// 1. 停止主机
			await this.stopPluginHost(hostName)

			// 2. 等待一下再启动
			await new Promise(resolve => setTimeout(resolve, 2000))

			// 3. 启动主机
			await this.startPluginHost(hostName)

			// 4. 记录重启事件
			this.ctx.service.storage.logPluginEvent({
				plugin_id: 0,
				event_type: 'info',
				event_data: {
					action: 'restart_host',
					host_name: hostName,
				},
			})

			this.ctx.logger.info(`Plugin host ${hostName} restarted successfully`)
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error)
			this.ctx.logger.error(`Failed to restart plugin host ${hostName}: ${message}`)
			throw error
		}
	}

	/**
	 * 更新主机心跳
	 *
	 * @param {string} hostName 主机名称
	 * @returns {Promise<void>}
	 */
	async updateHostHeartbeat(hostName: string): Promise<void> {
		try {
			this.ctx.service.storage.updatePluginHost(hostName, {
				last_heartbeat: Date.now(),
			})
		} catch (error) {
			this.ctx.logger.error(`Failed to update heartbeat for ${hostName}`)
		}
	}

	/**
	 * 获取所有主机状态
	 *
	 * @returns {Promise<object>} 主机状态信息
	 */
	async getHostsStatus(): Promise<any> {
		return this.ctx.service.storage.getPluginHostStatus()
	}

	/**
	 * 确保核心主机运行中
	 *
	 * @private
	 * @returns {Promise<void>}
	 */
	private async ensureCoreHostRunning(): Promise<void> {
		const host = this.ctx.service.storage.getPluginHostByName('core-host')
		if (!host || host.status !== 'running') {
			await this.startPluginHost('core-host')
		}
	}

	/**
	 * 生成 Module Federation 远程模块名称
	 *
	 * @private
	 * @param {string} pluginName 插件名称
	 * @returns {string} 远程模块名称
	 */
	private generateRemoteName(pluginName: string): string {
		// 将插件名称转换为有效的 JavaScript 标识符
		return pluginName
			.replace(/[^a-zA-Z0-9]/g, '_')
			.replace(/^_+/, '')
			.toLowerCase()
	}

	/**
	 * 通知主机加载插件
	 *
	 * @private
	 * @param {string} hostName 主机名称
	 * @param {object} pluginData 插件数据
	 * @returns {Promise<void>}
	 */
	private async notifyHostLoadPlugin(hostName: string, pluginData: any): Promise<void> {
		// TODO: 实现与插件主机的通信（HTTP/WebSocket）
		this.ctx.logger.debug(`Notifying host ${hostName} to load plugin: ${pluginData.plugin_name}`)
	}

	/**
	 * 通知主机卸载插件
	 *
	 * @private
	 * @param {string} hostName 主机名称
	 * @param {object} pluginData 插件数据
	 * @returns {Promise<void>}
	 */
	private async notifyHostUnloadPlugin(hostName: string, pluginData: any): Promise<void> {
		// TODO: 实现与插件主机的通信
		this.ctx.logger.debug(`Notifying host ${hostName} to unload plugin: ${pluginData.plugin_name}`)
	}

	/**
	 * 分配沙箱端口
	 *
	 * @private
	 * @returns {number} 端口号
	 */
	private allocateSandboxPort(): number {
		for (let i = 0; i < PluginRuntimeService.SANDBOX_PORT_RANGE; i++) {
			const port = PluginRuntimeService.SANDBOX_PORT_START + i
			if (!this.usedSandboxPorts.has(port)) {
				this.usedSandboxPorts.add(port)
				return port
			}
		}
		throw new Error('No available sandbox ports')
	}

	/**
	 * 释放沙箱端口
	 *
	 * @private
	 * @param {number} port 端口号
	 * @returns {void}
	 */
	private releaseSandboxPort(port: number): void {
		this.usedSandboxPorts.delete(port)
	}

	/**
	 * 启动沙箱服务
	 *
	 * @private
	 * @param {object} plugin 插件信息
	 * @param {number} port 端口号
	 * @returns {Promise<string>} 沙箱URL
	 */
	private async startSandboxService(plugin: any, port: number): Promise<string> {
		// TODO: 实现沙箱服务启动逻辑
		// 这里应该启动一个独立的 HTTP 服务器来提供插件前端资源
		const sandboxUrl = `http://localhost:${port}`
		this.ctx.logger.debug(`Starting sandbox service for ${plugin.name} on port ${port}`)
		return sandboxUrl
	}

	/**
	 * 停止沙箱服务
	 *
	 * @private
	 * @param {string} sandboxUrl 沙箱URL
	 * @returns {Promise<void>}
	 */
	private async stopSandboxService(sandboxUrl: string): Promise<void> {
		// TODO: 实现沙箱服务停止逻辑
		this.ctx.logger.debug(`Stopping sandbox service: ${sandboxUrl}`)
	}

	/**
	 * 获取主机配置
	 *
	 * @private
	 * @param {string} hostName 主机名称
	 * @returns {object} 主机配置
	 */
	private getHostConfig(hostName: string): any {
		const configs: Record<string, any> = {
			'core-host': {
				port: PluginRuntimeService.CORE_HOST_PORT,
				max_memory: '512MB',
				log_level: 'info',
				plugin_timeout: 30000,
			},
			'user-host': {
				port: PluginRuntimeService.USER_HOST_PORT,
				max_memory: '256MB',
				log_level: 'info',
				plugin_timeout: 15000,
			},
		}

		return configs[hostName] || configs['user-host']
	}

	/**
	 * 启动主机进程
	 *
	 * @private
	 * @param {string} hostName 主机名称
	 * @param {object} config 主机配置
	 * @returns {ChildProcess} 子进程
	 */
	private spawnHostProcess(hostName: string, config: any): ChildProcess {
		const hostPath = path.join(this.app.baseDir, 'apps/plugin-host/dist/index.js')

		const childProcess = spawn('node', [hostPath], {
			env: {
				...process.env,
				HOST_NAME: hostName,
				HOST_PORT: config.port.toString(),
				HOST_CONFIG: JSON.stringify(config),
			},
			stdio: ['pipe', 'pipe', 'pipe'],
		})

		// 监听进程输出
		childProcess.stdout?.on('data', (data) => {
			this.ctx.logger.info(`[${hostName}] ${data.toString().trim()}`)
		})

		childProcess.stderr?.on('data', (data) => {
			this.ctx.logger.error(`[${hostName}] ${data.toString().trim()}`)
		})

		childProcess.on('exit', (code) => {
			this.ctx.logger.warn(`[${hostName}] Process exited with code ${code}`)
			// 更新主机状态为已停止
			this.ctx.service.storage.updatePluginHost(hostName, {
				status: 'stopped',
			})
		})

		return childProcess
	}

	/**
	 * 等待主机就绪
	 *
	 * @private
	 * @param {string} hostName 主机名称
	 * @param {number} timeout 超时时间
	 * @returns {Promise<void>}
	 */
	private async waitForHostReady(hostName: string, timeout: number): Promise<void> {
		const startTime = Date.now()

		while (Date.now() - startTime < timeout) {
			const host = this.ctx.service.storage.getPluginHostByName(hostName)
			if (host && host.status === 'running') {
				return
			}

			await new Promise(resolve => setTimeout(resolve, 500))
		}

		throw new Error(`Host ${hostName} failed to start within timeout`)
	}
}
