/* eslint-disable @typescript-eslint/naming-convention */
import Extension, { ExtensionConfigProps } from '../index'

export default class Aliyun extends Extension {
	// 内容组件实例
	contentRefs: any = {}

	constructor(config: ExtensionConfigProps) {
		super(config)
		if (!this.isCompatible) return
		this.name = '阿里云专项版'
	}

	/**
	 * @description 检查元素是否存在
	 */
	public extensionElement(dependencies: any = {}) {
		const { vue } = this.dependencies
		if (dependencies) this.dependencies = { ...this.dependencies, ...dependencies }
		return [
			// this.statusbar(vue),
			this.productIntroduce(vue),
			this.productFreeTag(vue),
			// this.bindUser(vue),
		]
	}

	// /**
	//  * @description 检查元素是否存在
	//  */
	// public extensionBind(dependencies: any = {}) {
	// 	const { vue } = this.dependencies
	// 	if (dependencies) this.dependencies = { ...this.dependencies, ...dependencies }
	// 	return [this.bindUserForm(vue)]
	// }

	/**
	 * @description 创建组件-状态栏
	 */
	// eslint-disable-next-line consistent-return
	private async statusbar(vue: AnyObject) {
		try {
			const element = this.checkElement('#extension')
			if (!element) return false
			const { default: component } = await import(`./components/statusbar.vue`)
			const Statusbar = vue.defineComponent(component)
			return createApp(Statusbar, {
				dependencies: this.dependencies,
			}).mount(element)
			// return new Statusbar({
			// 	propsData: {
			// 		dependencies: this.dependencies,
			// 	},
			// }).$mount(element)
		} catch (error) {}
	}

	/**
	 * @description 创建组件-状态栏
	 */
	// eslint-disable-next-line consistent-return
	private async productIntroduce(vue: AnyObject) {
		try {
			const element = this.checkElement('#productIntroduce')
			console.log(element,'2323')
			if (!element) return false
			const { default: component } = await import(`./components/product-introduce.vue`)
			// const component = vue.defineComponent({
			// 	// @click="pluginPayEvent(isActivePay ? 30 : 29)"
			// 	render: () => (
			// 		<span class="free-ex-tag" onClick={this.dependencies.custom.openPay}>
			// 			<span class="ali-icon"></span>阿里云专版特权，宝塔产品享8折优惠，立即前往
			// 		</span>
			// 	),
			// })
			const Statusbar = vue.defineComponent(component)
			return createApp(Statusbar, {
				dependencies: this.dependencies,
			}).mount(element)
			// return new Statusbar({
			// 	propsData: {
			// 		dependencies: this.dependencies,
			// 	},
			// }).$mount(element)
		} catch (error) {}
	}

	/**
	 * @description 创建组件-绑定界面弹窗
	 * @param {AnyObject} vue vue实例
	 */
	// eslint-disable-next-line consistent-return
	private async binduserPopup() {
		try {
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
	private async productFreeTag(vue: AnyObject) {
		try {
			// const element = this.checkElement('#freeTagCon')
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
				// new Statusbar({
				// 	propsData: {
				// 		dependencies: this.dependencies,
				// 	},
				// }).$mount(element)
			}
		} catch (error) {}
	}

	/**
	 * @description 创建组件-绑定界面
	 */
	// eslint-disable-next-line consistent-return
	private async bindUser(vue: AnyObject) {
		try {
			const element = this.checkElement('#otherBind')
			if (!element) return false
			const { default: component } = await import(`./components/bind-user.vue`)
			const Statusbar = vue.defineComponent(component)
			return createApp(Statusbar, {
				compData:{
					dependencies: this.dependencies,
				}
			}).mount(element)
		} catch (error) {}
	}
	// /**
	//  * @description 创建组件-状态栏
	//  */
	// // eslint-disable-next-line consistent-return
	// private async bindUser(vue: AnyObject) {
	// 	try {
	// 		const element = this.checkElement('#bindUserCon')
	// 		if (!element) return false
	// 		const { default: component } = await import(`./components/bindUserView.vue`)
	// 		const Statusbar = vue.extend(component)
	// 		// document.querySelector('#defaultBindUser')?.remove()
	// 		return new Statusbar({
	// 			propsData: {
	// 				dependencies: this.dependencies,
	// 			},
	// 		}).$mount(element)
	// 	} catch (error) {}
	// }

	// /**
	//  * @description 创建组件-状态栏
	//  */
	// // eslint-disable-next-line consistent-return
	// private async bindUserForm(vue: AnyObject) {
	// 	try {
	// 		const element = this.checkElement('#bindUserForm')
	// 		if (!element) return false
	// 		const { default: component } = await import(`./components/bindUserForm.vue`)
	// 		const Statusbar = vue.extend(component)
	// 		// document.querySelector('#defaultBindUser')?.remove()
	// 		return new Statusbar({
	// 			propsData: {
	// 				dependencies: this.dependencies,
	// 			},
	// 		}).$mount(element)
	// 	} catch (error) {}
	// }
	// /**
	//  * @description 创建组件-轻量云防火墙规则
	//  */
	// private async rulesTable() {
	// 	const { vue } = this.dependencies
	// 	const { default: component } = await import('./rulesTable.vue')
	// 	const Statusbar = vue.extend(component)
	// 	return new Statusbar({
	// 		propsData: {
	// 			dependencies: this.dependencies,
	// 		},
	// 	}).$mount(this.el)
	// }

	// /**
	//  * @description 创建组件-腾讯云COSFS挂载工具
	//  */
	// private async cosfs() {
	// 	const { vue } = this.dependencies
	// 	const { default: component } = await import('./cosfsMount.vue')
	// 	const Statusbar = vue.extend(component)
	// 	return new Statusbar({
	// 		propsData: {
	// 			dependencies: this.dependencies,
	// 		},
	// 	}).$mount(this.el)
	// }
}
