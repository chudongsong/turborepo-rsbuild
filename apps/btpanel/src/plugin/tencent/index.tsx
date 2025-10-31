/* eslint-disable @typescript-eslint/naming-convention */
import Extension, { ExtensionConfigProps } from '../index'

export default class Tencent extends Extension {
	// 内容组件实例
	contentRefs: any = {}

	constructor(config: ExtensionConfigProps) {
		super(config)
		// 判断是否启用插件和是否兼容vue版本。
		if (!this.isCompatible) return
		this.name = '腾讯云专项版'
	}

	/**
	 * @description 检查元素是否存在
	 */
	public extensionElement(dependencies: any = {}) {
		const { vue } = this.dependencies
		if (dependencies) this.dependencies = { ...this.dependencies, ...dependencies }
		return [
			this.statusbar(vue), 
			this.rulesTable(vue),
			this.cosfs(vue),
			this.productIntroduce(vue),
			this.productFreeTag(vue),
			// this.binduser(vue),
		]
	}

	/**
	 * @description 创建组件-状态栏
	 * @param {AnyObject} vue vue实例
	 */
	// eslint-disable-next-line consistent-return
	private async statusbar(vue: AnyObject) {
		try {
			const element = this.checkElement('#extension')
			console.log('element', element)
			if (!element) return false
			const { default: component } = await import(`./components/statusbar.vue`)
			const Statusbar = vue.defineComponent(component)
			return createApp(Statusbar, {
				dependencies: this.dependencies,
			}).mount(element)
		} catch (error) {
			console.log('error', error)
		}
	}

	/**
	 * @description 创建组件-轻量云防火墙规则
	 * @param {AnyObject} vue vue实例
	 */
	// eslint-disable-next-line consistent-return
	private async rulesTable(vue: AnyObject) {
		try {
			const element = this.checkElement('#extension-rulesTable')
			if (!element) return false
			const { default: component } = await import('./components/rules-table.vue')
			const Statusbar = vue.defineComponent(component)
			return createApp(Statusbar, {
				dependencies: this.dependencies,
			}).mount(element)
		} catch (error) {
			console.log('error', error)
		}
	}

	/**
	 * @description 创建组件-腾讯云COSFS挂载工具
	 * @param {AnyObject} vue vue实例
	 */
	// eslint-disable-next-line consistent-return
	private async cosfs(vue: AnyObject) {
		try {
			const element = this.checkElement('#extension-cosfs')
			if (!element) return false
			const { default: component } = await import('./components/cosfs-mount.vue')
			const Statusbar = vue.defineComponent(component)
			return createApp(Statusbar, {
				dependencies: this.dependencies,
			}).mount(element)
		} catch (error) {
			console.log('error', error)
		}
	}
	/**
	 * @description 创建组件-绑定界面
	 * @param {AnyObject} vue vue实例
	 */
	// eslint-disable-next-line consistent-return
	private async binduser(vue: AnyObject) {
		try {
			const element = this.checkElement('#otherBind')
			if (!element) return false
			const { default: component } = await import(`./components/bind-user.vue`)
			const componentInstance = vue.defineComponent(component)
		return createApp(componentInstance, {
				compData:{
					dependencies: this.dependencies,
				}
			}).mount(element)
		} catch (error) {
			console.log('error', error)
		}
	}
	/**
	 * @description 创建组件-绑定界面弹窗
	 * @param {AnyObject} vue vue实例
	 */
	// eslint-disable-next-line consistent-return
	private async binduserPopup() {
		try {
			console.log(this.dependencies)
			return this.dependencies.hooks.useDialog({
				area: 40,
				component: () => import('./components/bind-user.vue'),
				compData: {
					dependencies: this.dependencies,
				}
			})
		} catch (error) {
			console.log('error', error)
		}
	}
	/**
		 * @description 创建组件-状态栏
		 */
		// eslint-disable-next-line consistent-return
		private async productIntroduce(vue: AnyObject) {
			try {
				const element = this.checkElement('#productIntroduce')
				if (!element) return false
				const { default: component } = await import(`./components/product-introduce.vue`)
				const Statusbar = vue.defineComponent(component)
				return createApp(Statusbar, {
					dependencies: this.dependencies,
				}).mount(element)
			} catch (error) {

				console.log(error)
			}
		}
	
		/**
		 * @description 创建组件-状态栏
		 */
		// eslint-disable-next-line consistent-return
		private async productFreeTag(vue: AnyObject) {
			try {
				const elementAll = document.querySelectorAll('#freeTagCon')
				if (!elementAll.length) return false
				const { default: component } = await import(`./components/free-tag.vue`)
	
				for (let i = 0; i < elementAll.length; i++) {
					const element = elementAll[i]
					// if (!(element.getAttribute('data-tag') === 'true')) {
					// 	continue
					// }
					const Statusbar = vue.defineComponent(component)
					createApp(Statusbar, {
						dependencies: this.dependencies,
					}).mount(element)
				}
			} catch (error) {}
		}
}