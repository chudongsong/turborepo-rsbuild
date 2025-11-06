import { Service } from 'egg'

/**
 * 插件生命周期管理服务
 *
 * 提供插件的完整生命周期管理功能：
 * - 安装 (install): 下载、验证、注册插件
 * - 启用 (enable): 激活插件，允许运行
 * - 禁用 (disable): 停用插件，禁止运行
 * - 卸载 (uninstall): 完全移除插件及所有实例
 * - 实例管理 (start/stop/restart): 控制插件实例
 *
 * @service PluginLifecycle
 */
export default class PluginLifecycleService extends Service {
	/**
	 * 安装插件
	 *
	 * @param {number} pluginId 插件ID
	 * @param {number} versionId 版本ID
	 * @param {object} config 安装配置
	 * @returns {Promise<{instanceId: number}>} 初始实例ID
	 */
	async installPlugin(
		pluginId: number,
		versionId: number,
		config?: any
	): Promise<{ instanceId: number }> {
		try {
			// 1. 验证插件和版本
			const plugin = await this.ctx.service.storage.getPluginById(pluginId)
			if (!plugin) {
				throw new Error('Plugin not found')
			}

			const version = await this.ctx.service.storage.getPluginVersionById(versionId)
			if (!version) {
				throw new Error('Plugin version not found')
			}

			// 2. 解析 manifest.json
			let manifest: any
			try {
				manifest = JSON.parse(version.manifest)
			} catch (error) {
				throw new Error('Invalid manifest format')
			}

			// 3. 验证 manifest 必要字段
			this.validateManifest(manifest)

			// 4. 使用事务确保数据一致性
			return this.ctx.service.storage.transaction(() => {
				// 更新插件状态
				this.ctx.service.storage.updatePlugin(pluginId, {
					runtime: manifest.runtime || 'sandboxed',
					api_version: manifest.api?.version || '1.0',
					permissions: manifest.permissions ? JSON.stringify(manifest.permissions) : null,
					entry_point: manifest.frontend?.entry || null,
					backend_type: manifest.backend?.type || 'none',
					backend_entry: manifest.backend?.entry || null,
					status: 'installed',
					installed_at: Date.now(),
				} as any)

				// 记录安装事件
				this.ctx.service.storage.logPluginEvent({
					plugin_id: pluginId,
					event_type: 'install',
					event_data: {
						version: version.version,
						manifest: manifest,
						config: config,
					},
				})

				// 创建默认实例
				const instanceId = this.ctx.service.storage.createPluginInstance({
					plugin_id: pluginId,
					version_id: versionId,
					instance_name: 'default',
					config: config || {},
					status: 'stopped',
				})

				return { instanceId }
			})
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error)
			this.ctx.logger.error(`Failed to install plugin ${pluginId}: ${message}`)
			throw error
		}
	}

	/**
	 * 启用插件
	 *
	 * @param {number} pluginId 插件ID
	 * @returns {Promise<void>}
	 */
	async enablePlugin(pluginId: number): Promise<void> {
		try {
			// 1. 验证插件存在
			const plugin = await this.ctx.service.storage.getPluginById(pluginId)
			if (!plugin) {
				throw new Error('Plugin not found')
			}

			// 2. 检查是否已经启用
			if (plugin.status === 'enabled') {
				this.ctx.logger.warn(`Plugin ${pluginId} is already enabled`)
				return
			}

			// 3. 更新插件状态
			this.ctx.service.storage.updatePlugin(pluginId, {
				status: 'enabled',
				enabled_at: Date.now(),
			} as any)

			// 4. 启动默认实例
			const instances = this.ctx.service.storage.getPluginInstances(pluginId)
			if (instances.length > 0) {
				const defaultInstance = instances.find(i => i.instance_name === 'default') || instances[0]
				await this.startPluginInstance(defaultInstance.id)
			}

			// 5. 记录启用事件
			this.ctx.service.storage.logPluginEvent({
				plugin_id: pluginId,
				event_type: 'enable',
				event_data: {
					plugin_name: plugin.name,
				},
			})

			this.ctx.logger.info(`Plugin ${pluginId} enabled successfully`)
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error)
			this.ctx.logger.error(`Failed to enable plugin ${pluginId}: ${message}`)
			throw error
		}
	}

	/**
	 * 禁用插件
	 *
	 * @param {number} pluginId 插件ID
	 * @returns {Promise<void>}
	 */
	async disablePlugin(pluginId: number): Promise<void> {
		try {
			// 1. 验证插件存在
			const plugin = await this.ctx.service.storage.getPluginById(pluginId)
			if (!plugin) {
				throw new Error('Plugin not found')
			}

			// 2. 检查是否已经禁用
			if (plugin.status === 'disabled' || plugin.status === 'installed') {
				this.ctx.logger.warn(`Plugin ${pluginId} is not enabled`)
				return
			}

			// 3. 停止所有实例
			const instances = this.ctx.service.storage.getPluginInstances(pluginId)
			for (const instance of instances) {
				if (instance.status === 'running') {
					await this.stopPluginInstance(instance.id)
				}
			}

			// 4. 更新插件状态
			this.ctx.service.storage.updatePlugin(pluginId, {
				status: 'disabled',
			} as any)

			// 5. 记录禁用事件
			this.ctx.service.storage.logPluginEvent({
				plugin_id: pluginId,
				event_type: 'disable',
				event_data: {
					plugin_name: plugin.name,
				},
			})

			this.ctx.logger.info(`Plugin ${pluginId} disabled successfully`)
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error)
			this.ctx.logger.error(`Failed to disable plugin ${pluginId}: ${message}`)
			throw error
		}
	}

	/**
	 * 启动插件实例
	 *
	 * @param {number} instanceId 实例ID
	 * @returns {Promise<void>}
	 */
	async startPluginInstance(instanceId: number): Promise<void> {
		try {
			// 1. 获取实例信息
			const instance = await this.ctx.service.storage.getPluginInstanceById(instanceId)
			if (!instance) {
				throw new Error('Plugin instance not found')
			}

			// 2. 检查实例状态
			if (instance.status === 'running') {
				this.ctx.logger.warn(`Instance ${instanceId} is already running`)
				return
			}

			// 3. 更新状态为启动中
			this.ctx.service.storage.updatePluginInstance(instanceId, {
				status: 'starting',
			})

			// 4. 根据插件类型启动
			const plugin = await this.ctx.service.storage.getPluginById(instance.plugin_id)
			if (plugin.runtime === 'integrated') {
				// 核心插件：使用 Module Federation 加载
				await this.loadIntegratedPlugin(instance)
			} else {
				// 第三方插件：使用 iFrame 加载
				await this.loadSandboxedPlugin(instance)
			}

			// 5. 更新状态为运行中
			this.ctx.service.storage.updatePluginInstance(instanceId, {
				status: 'running',
			})

			// 6. 记录启动事件
			this.ctx.service.storage.logPluginEvent({
				plugin_id: instance.plugin_id,
				instance_id: instanceId,
				event_type: 'start',
				event_data: {
					instance_name: instance.instance_name,
					plugin_name: plugin.name,
				},
			})

			this.ctx.logger.info(`Plugin instance ${instanceId} started successfully`)
		} catch (error) {
			// 更新状态为错误
			this.ctx.service.storage.updatePluginInstance(instanceId, {
				status: 'error',
			})

			// 记录错误事件
			this.ctx.service.storage.logPluginEvent({
				plugin_id: 0, // 需要从实例获取
				instance_id: instanceId,
				event_type: 'error',
				event_data: {
					error: error instanceof Error ? error.message : String(error),
				},
			})

			const message = error instanceof Error ? error.message : String(error)
			this.ctx.logger.error(`Failed to start plugin instance ${instanceId}: ${message}`)
			throw error
		}
	}

	/**
	 * 停止插件实例
	 *
	 * @param {number} instanceId 实例ID
	 * @returns {Promise<void>}
	 */
	async stopPluginInstance(instanceId: number): Promise<void> {
		try {
			// 1. 获取实例信息
			const instance = await this.ctx.service.storage.getPluginInstanceById(instanceId)
			if (!instance) {
				throw new Error('Plugin instance not found')
			}

			// 2. 检查实例状态
			if (instance.status === 'stopped') {
				this.ctx.logger.warn(`Instance ${instanceId} is already stopped`)
				return
			}

			// 3. 更新状态为停止中
			this.ctx.service.storage.updatePluginInstance(instanceId, {
				status: 'stopping',
			})

			// 4. 根据插件类型停止
			const plugin = await this.ctx.service.storage.getPluginById(instance.plugin_id)
			if (plugin.runtime === 'integrated') {
				// 核心插件：卸载 Module Federation 模块
				await this.unloadIntegratedPlugin(instance)
			} else {
				// 第三方插件：卸载 iFrame
				await this.unloadSandboxedPlugin(instance)
			}

			// 5. 更新状态为已停止
			this.ctx.service.storage.updatePluginInstance(instanceId, {
				status: 'stopped',
			})

			// 6. 记录停止事件
			this.ctx.service.storage.logPluginEvent({
				plugin_id: instance.plugin_id,
				instance_id: instanceId,
				event_type: 'stop',
				event_data: {
					instance_name: instance.instance_name,
					plugin_name: plugin.name,
				},
			})

			this.ctx.logger.info(`Plugin instance ${instanceId} stopped successfully`)
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error)
			this.ctx.logger.error(`Failed to stop plugin instance ${instanceId}: ${message}`)
			throw error
		}
	}

	/**
	 * 重启插件实例
	 *
	 * @param {number} instanceId 实例ID
	 * @returns {Promise<void>}
	 */
	async restartPluginInstance(instanceId: number): Promise<void> {
		try {
			// 1. 获取实例信息
			const instance = await this.ctx.service.storage.getPluginInstanceById(instanceId)
			if (!instance) {
				throw new Error('Plugin instance not found')
			}

			// 2. 停止实例
			if (instance.status === 'running') {
				await this.stopPluginInstance(instanceId)
			}

			// 3. 等待一下再启动
			await new Promise(resolve => setTimeout(resolve, 1000))

			// 4. 启动实例
			await this.startPluginInstance(instanceId)

			// 5. 记录重启事件
			this.ctx.service.storage.logPluginEvent({
				plugin_id: instance.plugin_id,
				instance_id: instanceId,
				event_type: 'restart',
				event_data: {
					instance_name: instance.instance_name,
				},
			})

			this.ctx.logger.info(`Plugin instance ${instanceId} restarted successfully`)
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error)
			this.ctx.logger.error(`Failed to restart plugin instance ${instanceId}: ${message}`)
			throw error
		}
	}

	/**
	 * 卸载插件
	 *
	 * @param {number} pluginId 插件ID
	 * @returns {Promise<void>}
	 */
	async uninstallPlugin(pluginId: number): Promise<void> {
		try {
			// 1. 验证插件存在
			const plugin = await this.ctx.service.storage.getPluginById(pluginId)
			if (!plugin) {
				throw new Error('Plugin not found')
			}

			// 2. 先禁用插件
			if (plugin.status === 'enabled') {
				await this.disablePlugin(pluginId)
			}

			// 3. 删除所有实例
			const instances = this.ctx.service.storage.getPluginInstances(pluginId)
			for (const instance of instances) {
				this.ctx.service.storage.deletePluginInstance(instance.id)
			}

			// 4. 删除所有权限
			const permissions = this.ctx.service.storage.getPluginPermissions(pluginId)
			for (const permission of permissions) {
				this.ctx.service.storage.removePluginPermission(pluginId, permission.permission_name)
			}

			// 5. 记录卸载事件
			this.ctx.service.storage.logPluginEvent({
				plugin_id: pluginId,
				event_type: 'uninstall',
				event_data: {
					plugin_name: plugin.name,
				},
			})

			// 6. 注意：我们不删除插件记录，只更改状态
			// 这是为了保持版本历史和统计信息
			this.ctx.service.storage.updatePlugin(pluginId, {
				status: 'uninstalled',
			} as any)

			this.ctx.logger.info(`Plugin ${pluginId} uninstalled successfully`)
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error)
			this.ctx.logger.error(`Failed to uninstall plugin ${pluginId}: ${message}`)
			throw error
		}
	}

	/**
	 * 创建插件实例
	 *
	 * @param {number} pluginId 插件ID
	 * @param {number} versionId 版本ID
	 * @param {string} instanceName 实例名称
	 * @param {object} config 实例配置
	 * @returns {Promise<{instanceId: number}>} 实例ID
	 */
	async createPluginInstance(
		pluginId: number,
		versionId: number,
		instanceName: string,
		config?: any
	): Promise<{ instanceId: number }> {
		try {
			// 1. 验证插件存在且已启用
			const plugin = await this.ctx.service.storage.getPluginById(pluginId)
			if (!plugin) {
				throw new Error('Plugin not found')
			}
			if (plugin.status !== 'enabled') {
				throw new Error('Plugin is not enabled')
			}

			// 2. 验证版本存在
			const version = await this.ctx.service.storage.getPluginVersionById(versionId)
			if (!version) {
				throw new Error('Plugin version not found')
			}

			// 3. 创建实例
			const instanceId = this.ctx.service.storage.createPluginInstance({
				plugin_id: pluginId,
				version_id: versionId,
				instance_name: instanceName,
				config: config || {},
				status: 'stopped',
			})

			// 4. 记录创建事件
			this.ctx.service.storage.logPluginEvent({
				plugin_id: pluginId,
				event_type: 'info',
				event_data: {
					action: 'create_instance',
					instance_name: instanceName,
					instance_id: instanceId,
				},
			})

			return { instanceId }
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error)
			this.ctx.logger.error(`Failed to create plugin instance: ${message}`)
			throw error
		}
	}

	/**
	 * 删除插件实例
	 *
	 * @param {number} instanceId 实例ID
	 * @returns {Promise<void>}
	 */
	async deletePluginInstance(instanceId: number): Promise<void> {
		try {
			// 1. 获取实例信息
			const instance = await this.ctx.service.storage.getPluginInstanceById(instanceId)
			if (!instance) {
				throw new Error('Plugin instance not found')
			}

			// 2. 停止实例（如果正在运行）
			if (instance.status === 'running') {
				await this.stopPluginInstance(instanceId)
			}

			// 3. 删除实例
			this.ctx.service.storage.deletePluginInstance(instanceId)

			// 4. 记录删除事件
			this.ctx.service.storage.logPluginEvent({
				plugin_id: instance.plugin_id,
				event_type: 'info',
				event_data: {
					action: 'delete_instance',
					instance_name: instance.instance_name,
				},
			})

			this.ctx.logger.info(`Plugin instance ${instanceId} deleted successfully`)
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error)
			this.ctx.logger.error(`Failed to delete plugin instance ${instanceId}: ${message}`)
			throw error
		}
	}

	/**
	 * 加载集成插件 (Module Federation)
	 *
	 * @private
	 * @param {object} instance 实例信息
	 * @returns {Promise<void>}
	 */
	private async loadIntegratedPlugin(instance: any): Promise<void> {
		// TODO: 实现 Module Federation 加载逻辑
		// 这里应该调用 PluginRuntimeService
		this.ctx.logger.debug(`Loading integrated plugin: ${instance.plugin_name}`)
	}

	/**
	 * 卸载集成插件
	 *
	 * @private
	 * @param {object} instance 实例信息
	 * @returns {Promise<void>}
	 */
	private async unloadIntegratedPlugin(instance: any): Promise<void> {
		// TODO: 实现 Module Federation 卸载逻辑
		this.ctx.logger.debug(`Unloading integrated plugin: ${instance.plugin_name}`)
	}

	/**
	 * 加载沙箱插件 (iFrame)
	 *
	 * @private
	 * @param {object} instance 实例信息
	 * @returns {Promise<void>}
	 */
	private async loadSandboxedPlugin(instance: any): Promise<void> {
		// TODO: 实现 iFrame 加载逻辑
		this.ctx.logger.debug(`Loading sandboxed plugin: ${instance.plugin_name}`)
	}

	/**
	 * 卸载沙箱插件
	 *
	 * @private
	 * @param {object} instance 实例信息
	 * @returns {Promise<void>}
	 */
	private async unloadSandboxedPlugin(instance: any): Promise<void> {
		// TODO: 实现 iFrame 卸载逻辑
		this.ctx.logger.debug(`Unloading sandboxed plugin: ${instance.plugin_name}`)
	}

	/**
	 * 验证 manifest 格式
	 *
	 * @private
	 * @param {object} manifest manifest 对象
	 * @returns {void}
	 */
	private validateManifest(manifest: any): void {
		const required = ['id', 'name', 'version']
		for (const field of required) {
			if (!manifest[field]) {
				throw new Error(`Missing required manifest field: ${field}`)
			}
		}

		// 验证 runtime 字段
		if (manifest.runtime && !['integrated', 'sandboxed'].includes(manifest.runtime)) {
			throw new Error('Invalid runtime value, must be "integrated" or "sandboxed"')
		}

		// 验证前端配置
		if (manifest.frontend) {
			if (!manifest.frontend.entry) {
				throw new Error('Missing frontend entry point')
			}
		}

		// 验证后端配置
		if (manifest.backend) {
			const validTypes = ['shared-host', 'faas', 'none']
			if (!validTypes.includes(manifest.backend.type)) {
				throw new Error(`Invalid backend type: ${manifest.backend.type}`)
			}
		}
	}
}
