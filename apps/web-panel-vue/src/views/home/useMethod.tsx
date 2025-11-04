import HOME_STORE from './store'
import { useDialog } from '@hooks/tools'
import { storeToRefs } from 'pinia'

/**
 * @description 全局公共-监听数据变化
 */
class HomeData {
	private watchList: Map<string, AnyFunction>
	private refs
	private stopWatching: (() => void) | undefined

	constructor() {
		this.watchList = new Map()
		// this.refs = useHomeStore()
		const store = HOME_STORE()
		this.refs = storeToRefs(store)
		this.useHomeData()
	}

	/**
	 * @description 执行监听列表的执行回调
	 * @param {string} name setCallback的name
	 */
	useRunCallback() {
		for (const [key, callback] of this.watchList.entries()) {
			if (key in this.refs) callback(this.refs[key].value)
		}
	}

	/**
	 * @description 监听数据变化
	 * @returns
	 */
	async useHomeData() {
		this.stopWatching = watch(
			this.refs.isRefreshData,
			val => {
				if (val) {
					this.useRunCallback()
					this.refs.isRefreshData.value = false
				}
			},
			{
				immediate: true,
			}
		)
	}

	/**
	 * @description 设置数据
	 * @param {string} name 设置名称
	 * @param {AnyFunction} callback 回调函数
	 */
	useSetCallback(name: string, callback: AnyFunction) {
		this.watchList.set(name, callback)
	}

	/**
	 * @description 停止监听数据变化
	 */
	stopUseHomeData() {
		if (this.stopWatching) {
			this.stopWatching()
		}
	}

	/**
	 * @description 卸载资源
	 */
	unload() {
		if (this.watchList.size > 0) this.watchList.clear()
		this.stopUseHomeData()
	}

	/**
	 * @description 备份进行中提示弹窗
	 */
	async getFirewallStatus() {
		useDialog({
			area: 45,
			component: () => import('@components/business/bt-recover-popup/index.vue'),
		})
	}
}

// 实例化
export const homeData = new HomeData()
