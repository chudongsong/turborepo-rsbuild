/* eslint-disable @typescript-eslint/naming-convention */
export interface ExtensionConfigProps {
	name: string // 插件名称
	updateTime?: string // 插件更新时间
	dependencies: AnyObject // 插件依赖
}

/**
 * @description 扩展程序
 * @class ExtensionProgram
 * @constructor
 */
export default class Extension {
	// 插件名称
	name: string = ''

	// 是否兼容
	isCompatible: boolean = false

	// 版本兼容，这里用于获取当前vue的版本判断兼容性
	version: string = ''

	// 更新时间
	updateTime: string = ''

	// 依赖, 默认包含 dependencies { vue: Vue, store, hooks: {useMessage, useDialog, useAxios, useConfirm},  }
	dependencies: AnyObject = {}

	constructor(config: ExtensionConfigProps) {
		// 判断是否启用插件
		this.name = config?.name || ''
		this.updateTime = config?.updateTime || ''
		this.dependencies = config?.dependencies
		this.version = this.dependencies.vue.version
		this.checkCompatibility() // 检测兼容性
		if (!this.isCompatible) this.compatible() // 渲染提示组件, 不兼容时渲染提示组件
	}

	// 不兼容提示
	compatibleTips: () => string = (): string => `当前面板版本过低不兼容扩展 ${this.name}`

	/**
	 * @description 检测当前vue环境是否兼容
	 */
	private checkCompatibility() {
		const { useMessage } = this.dependencies.hooks
		this.isCompatible = this.version.startsWith('3.') // 判断是否为3.x版本
		if (this.isCompatible) return
		// useMessage().msg({
		// 	message: this.compatibleTips(),
		// 	duration: 3000,
		// 	type: 'error',
		// })
	}

	/**
	 * @description 检测元素是否存在
	 * @returns {Promise<void>}
	 */
	public checkElement(el: string) {
		const element = document.querySelector(el)
		return element
	}

	/**
	 * @description 渲染版本提示插件
	 */
	private async compatible() {
		const { vue } = this.dependencies
		const { default: component } = await import('./compatible.vue')
		const Compatible = vue.defineComponent(component)
		createApp(Compatible, {
			dependencies: this.dependencies,
			message: this.compatibleTips(),
		}).mount('#extension')
	}
}
