import type { App } from 'vue'
import type { HomeOverviewProps } from '@home/types.d'

import { useGlobalStore } from '@store/global'
import { defineStore } from 'pinia'
import { useSortable } from '@vueuse/integrations/useSortable' // 拖拽
import { useDialog, useDataHandle, useHandleError, Message } from '@hooks/tools'
import { addOverview, delOverview, getOverview, indexSshInfo, setOverview, sortOverview } from '@api/home'
import { openPathEvent } from '@hooks/tools/table/event'
import { isUndefined, setCookie, setSessionStorage } from '@utils/index'
import { fileSelectionDialog, productPaymentDialog, openPluginView } from '@/public/index'
import { useRouter } from 'vue-router'
import { getMemoBody, getTemplateOverview, saveFileBody } from '@/api/global'

const HOME_OVERVIEW_STORE = defineStore('HOME-OVERVIEW-STORE', () => {
	const router = useRouter()

	const { mainWidth, payment } = useGlobalStore() // 获取全局持久化数据-宽度
	const { authType } = toRefs(payment.value) // 获取权限类型

	const overviewShowList = ref<HomeOverviewProps[]>([]) // 概览数据
	const loading = ref<boolean>(true) // 加载状态

	const isSshLoading = ref<boolean>(false) // ssh日志加载状态

	/**
	 * @description 获取概览数据
	 * @returns {HomeOverviewProps[]} 概览数据
	 */
	const getOverviewData = async () => {
		try {
			const res: any = await useDataHandle({
				request: getOverview(),
				data: {
					data: [Array, overviewShowList],
				},
			})
			getSshData() // 获取ssh日志数据
			return Promise.resolve(res.data as HomeOverviewProps[])
		} catch (error) {
			useHandleError(error)
		} finally {
			loading.value = false
			nextTick(() => {
				rowDrop()
			})
		}
	}

	/**
	 * @description 获取SSH登录日志数据
	 * @returns {HomeOverviewProps[]} 概览数据
	 */
	const getSshData = () => {
		const findIndex = overviewShowList.value.findIndex((item: any) => item.name === 'ssh_log')
		if (findIndex !== -1) {
			// 获取ssh日志数据
			useDataHandle({
				loading: isSshLoading,
				request: indexSshInfo({
					log_type: overviewShowList.value[findIndex].params[0].source,
				}),
				success: (res: any) => {
					if (Array.isArray(res.data)) {
						overviewShowList.value[findIndex].value = res.data
					}
				},
			})
		}
	}

	/**
	 * @description 打开自定义概览弹窗
	 * @returns {} void
	 */
	const openOverviewTemplate = () => {
		customOverviewDialog({ getOverviewData })
	}

	/**
	 * @description 自定义概览弹窗
	 * @param {Function} data.getOverviewData 获取概览数据
	 * @returns
	 */
	const customOverviewDialog = async (data: { getOverviewData: AnyFunction }): Promise<App> =>
		useDialog({
			title: '自定义概览模块',
			area: 100,
			compData: data,
			component: () => import('@home/views/overview/custom-overview/index.vue'),
		})

	/**
	 * @description 获取类型内容
	 * @param {} item 拖拽元素
	 */
	const getModelTips = (item: HomeOverviewProps) => {
		// 获取类型内容
		switch (item.template) {
			case 'base':
				if (item.name === 'memo' || item.name === 'safety_risk') return `打开${item.title}模块`
				return `跳转至${item.title}页面`
			case 'browse':
				if (item.type === 'plugin') return `打开${item.title}插件`
				return `打开${item.title}模块`
			case 'open_dir':
				return `打开${item.title}`
		}
	}

	/**
	 * @description 获取模块标题
	 * @param item
	 */
	const getModelTitle = (item: HomeOverviewProps) => {
		let title = item.title,
			num = 0,
			len = item.params.length || 0,
			excludeType = ['ssh_log'] // 排除的类型
		if (!item.status) return title // 未安装时，直接使用标题
		if (item.name === 'open_dir') return title // 打开目录时，直接使用标题
		if (len >= 2) title = '' // 两个标题以上时，不显示初始化标题
		for (let i = len - 1; i >= 0; i--) {
			let element = item.params[i]
			if (title === element.name || excludeType.indexOf(item.name) > -1) title = '' // 两个标题相同时，直接使用第一个标题，排除ssh_log日志显示的标题
			if (num !== 2) {
				if (len === 1 && title != '') title += ` - ` // 只有一个标题时，不显示分隔符
				title += `${element.name}` + (i === len - 1 && len > 1 ? ' - ' : '') //获取最后两个标题
				num++
			}
			num = 0
		}
		return title.replace(' - 全部', '')
	}

	/**
	 * @description 打开模块弹窗
	 * @param {} item 拖拽元素
	 * @returns {} void
	 */
	const openModelDialog = async (item: HomeOverviewProps) => {
		switch (item.type) {
			case 'base':
				const source = item.params[0].source
				const sourceSpecial = ['ftps', 'sites', 'databases']
				const routerName = '/' + (sourceSpecial.includes(item.name) && source === 'all' ? '' : source).replace('proxy', 'nginx')
				return router.push({ path: item.source.href + routerName }) // 跳转至对应页面路由
			case 'model':
				if (item.name === 'memo') return homeMemoDialog() // 备忘录
				if (item.name === 'safety_risk') return securityRisksDialog() // 安全风险
				if (item.name === 'ssh_log') {
					// const { getFirewallStore } = await import('@firewall/useStore')
					// const {
					// 	refs: { sshTabActive },
					// } = getFirewallStore()
					// sshTabActive.value = 'login'
					// setSessionStorage('Router-Key', { path: 'ssh', children: 'loginLog' })
					return router.push({ path: `/logs/ssh` }) // ssh日志 改为新地址
				}
			case 'plugin':
				return handleOpenPlugin(item) // 打开插件/安装插件
			default:
				if (item.name === 'search_file') return searchFile() // 扫描文件
				if (item.name === 'open_dir') return openPathEvent({ path: item.params[0].name }) // 打开目录
		}
	}

	/**
	 * @description 拖拽元素移动完成触发
	 */
	const dragSortEvent = async () => {
		// await useDataHandle({
		// 	request: setOverview({ overview: JSON.stringify(overviewShowList.value) }),
		// 	message: true,
		// 	success: (res: any) => {
		// 		if (!res.status) getOverviewData()
		// 	},
		// })

		const overview = overviewShowList.value.map((item: any, index: number) => item.id)
		await useDataHandle({
			request: sortOverview({ overview: JSON.stringify(overview) }),
			message: true,
			success: (res: any) => {
				if (!res.status) getOverviewData()
			},
		})
	}

	/**
	 * @description 备忘录
	 * @returns {Promise<App>}
	 */
	const homeMemoDialog = async (): Promise<App> =>
		useDialog({
			title: '备忘录',
			area: [70, 60],
			component: () => import('@home/views/overview/memo/index.vue'),
		})

	/**
	 * @description 安全风险
	 * @returns {Promise<App>}
	 */
	const securityRisksDialog = async (): Promise<App> =>
		useDialog({
			area: [90, 60],
			component: () => import('@home/views/overview/security-risks/index.vue'),
		})

	/**
	 * @description 购买提示
	 * @param {HomeOverviewProps} item 选中元素
	 */
	const getPayStatus = (item: HomeOverviewProps) => {
		const { type } = item.plugin_info
		if ((authType.value === 'free' && (type === 8 || type === 12)) || (authType.value !== 'ltd' && type === 12)) {
			return true
		} else {
			return false
		}
	}

	/**
	 * @description: 打开插件/安装插件
	 * @param {string} obj 对象信息
	 */
	const handleOpenPlugin = (item: any) => {
		const { type, endtime, setup } = item.plugin_info // 插件类型、到期时间、是否安装
		const sourceId = item.name === 'total' ? 41 : item.name === 'btwaf' ? 366 : 42 // 转换入口
		if (getPayStatus(item)) {
			if (endtime < 0) {
				return productPaymentDialog({
					disablePro: true,
					sourceId,
				})
			}
		}
		openPluginView({ name: item.name })
	}

	/**
	 * @description: 行拖拽
	 * @return {void}
	 */
	const rowDrop = () => {
		useSortable('.overview-wrapper', overviewShowList, {
			animation: 500,
			handle: '.move-icon',
			chosenClass: 'ghost',
			onUpdate: async (e: any) => {
				// 将overviewShowList.value的e.oldIndex位置的元素移动到e.newIndex位置
				const oldIndex = e.oldIndex
				const newIndex = e.newIndex
				const temp = overviewShowList.value[oldIndex]
				overviewShowList.value.splice(oldIndex, 1)
				overviewShowList.value.splice(newIndex, 0, temp)
				dragSortEvent()
			},
		})
	}
	/**
	 * @description: 搜索文件
	 */
	const searchFile = () => {
		setCookie('searchFile', 'true')
		router.push({ path: `/files` })
	}

	const content = ref<string>('')
	const path = ref<string>('/www/server/panel/data/memo.txt')

	/**
	 * @description 保存文件
	 */
	const saveFileEvent = async () => {
		useDataHandle({
			loading: '正在保存备忘录，请稍后...',
			request: saveFileBody({
				path: path.value,
				data: content.value,
				encoding: 'utf-8',
			}),
			message: true,
			success: (res: any) => {
				if (res.status) getOverviewData()
			},
		})
	}

	/**
	 * @description 获取备忘录数据
	 */
	const getMemoData = async () => {
		useDataHandle({
			loading: '正在获取备忘录数据，请稍后...',
			request: getMemoBody(),
			data: [String, content],
		})
	}

	const overviewTemplateList = shallowRef<any>([]) // 概览模板列表
	const overviewModelList = ref<any>([])
	const isLoading = shallowRef(false) // 加载状态
	const active = shallowRef(0) // 当前激活的模块
	const form = ref<any>({
		val0: 0,
		val1: 0,
		val2: 0,
		val3: 0,
	})

	const supportConfig = ref(['sites', 'databases', 'total', 'ssh_log', 'monitor']) // 支持配置参数的模块
	const supportPath = ref(['open_dir']) // 支持目录选择的模块

	/**
	 * @description 渲染模块和显示模块的对应关系
	 */
	const dataAlignment = () => {
		let tempGroup: { [key: string]: any } = {}
		overviewModelList.value = []

		// 生成模板对应的对象，用过name来区分
		overviewShowList.value.forEach((item: any) => {
			tempGroup[item.name] = item
		})

		// 遍历基础模板配置，生成可以显示的模板列表
		overviewTemplateList.value.forEach((item: any) => {
			const template = item.template // 模板名称
			item.option.forEach((itemx: any) => {
				const showItem = tempGroup[itemx.name] || false
				overviewModelList.value.push({
					...itemx,
					...{ isShow: Boolean(showItem), showItem, template, overviewPopover: false },
				})
			})
		})
	}

	/**
	 * @description 设置概览模板配置显示
	 * @param {number} item 模板id
	 */
	const setOverviewTemplateShow = async (item: any) => {
		try {
			if (item.isShow && overviewShowList.value.length === 6) {
				nextTick(() => (item.isShow = false))
				return Message.warn('最多只能显示6个模块')
			}
			const overviewParams = getModelParams(item) // 获取模块配置参数

			if (!item.isShow && isUndefined(item.showItem.id)) {
				// 点击删除模块时，如果id不存在重新获取id
				await getOverviewTemplateData()
				item = overviewModelList.value.find((items: any) => items.name === item.name)
				item.isShow = !item.isShow
			}

			const requestFun = !item.isShow ? delOverview : addOverview
			const params: any = !item.isShow
				? {
						overview_id: item.showItem.id,
				  }
				: {
						overview: JSON.stringify(overviewParams),
				  }

			useDataHandle({
				loading: `正在${item.isShow ? '删除' : '添加'}模块，请稍后...`,
				request: requestFun(params),
				message: true,
				data: {
					data: Array,
					msg: String,
					status: Boolean,
				},
				success: async (rdata: any) => {
					if (rdata.status) {
						if (item.isShow) {
							item.showItem = rdata.data.length ? rdata.data[rdata.data.length - 1] : item.showItem
						}
						await getOverviewData()
						dataAlignment()
						// openNps() 移除简易版本的nps体验收集
					}
				},
			})
		} catch (error) {
			useHandleError(error)
		}
	}

	/**
	 * @description 获取模块配置参数，用于设置模块
	 * @param {} item 模块信息
	 */
	const getModelParams = (item: any, isEdit: boolean = false) => {
		let params: any = { ...item } // 拷贝模块信息
		let templateParams = [] // 模板参数
		let selected: any[] = [] // 选中的下标

		for (const key in form.value) {
			if (item.params.length) selected.push(form.value[key])
		}
		if (selected.length === 0) selected = [0]
		if (item.name === 'open_dir') {
			const path = form.value.val0 || item.params[0].option[0].source
			templateParams = [{ name: path, source: path }]
		} else {
			// 遍历模板参数下拉元素
			templateParams = params.params.map((items: any, index: number) => {
				if (items.type === 'select') return items.option[selected[index]] // 获取选中的元素内容
				if (item.params) return item.params[index]
			})
		}

		delete params.overviewPopover // 删除显示的模块信息
		if (!isEdit) {
			delete params.showItem // 删除显示的模块信息
			params.params = templateParams
		} else {
			item.showItem.params = templateParams
			params = { ...item.showItem }
		}
		return params
	}

	/**
	 * @description: 添加概览
	 * @param {object} item 概览数据
	 */
	const addOverviewFun = async (item: AnyObject) => {
		const isEdit = Boolean(item.showItem)
		if (!isEdit && overviewShowList.value.length === 6) {
			item.overviewPopover = false
			nextTick(() => (item.isShow = false))
			return Message.warn('最多只能显示6个模块')
		}
		const params = {
			overview: JSON.stringify(getModelParams(item, isEdit)),
		}

		const requestFun = isEdit && item.isShow ? setOverview : addOverview

		useDataHandle({
			loading: `正在${isEdit ? '修改' : '添加'}模块，请稍后...`,
			request: requestFun(params),
			message: true,
			success: async (res: any) => {
				item.overviewPopover = false
				item.isShow = true
				initForm() // 初始化表单
				if (res.status) {
					await getOverviewData()
					dataAlignment()
				}
			},
		})
	}

	/**
	 * @description: 初始化表单
	 */
	const initForm = () => {
		form.value = {
			val0: 0,
			val1: 0,
			val2: 0,
			val3: 0,
		}
	}

	/**
	 * @description: 触发目录选择
	 */
	const onPathChange = (item: any) => {
		fileSelectionDialog({
			type: 'dir',
			change: (path: string) => {
				form.value.val0 = path
				addOverviewFun(item)
			},
		})
	}

	/**
	 * @description 获取概览数据
	 */
	const getOverviewTemplateData = async () => {
		await useDataHandle({
			loading: isLoading,
			request: getTemplateOverview(),
			data: {
				data: [Array, overviewTemplateList],
			},
		})
	}

	/**
	 * @description 设置弹窗显示
	 * @param {AnyObject} item 模块信息
	 * @param {number} index 模块下标
	 */
	const setPopoverShow = (item: any, index: number) => {
		overviewModelList.value[index].overviewPopover = true
		active.value = index
		const params = item.showItem.params
		const entries = Object.entries(form.value)
		for (let i = 0; i < entries.length; i++) {
			if (!(i < item.params.length)) break // 判断当前字段是否小于配置的字段，如果小于则跳出循环，防止越界
			const itemParams: any = item.params[i] // 获取当前可以配置字段
			// 判断当前字段是否是下拉框，如果不是则跳过
			if (itemParams.type === 'select') {
				const options = itemParams.option
				const index = options.findIndex((items: any) => {
					if (!params) return true
					if (!params[i]) return true
					return items.source === params[i].source
				}) // 获取当前选中的下标
				form.value['val' + i] = index // 设置当前选中的下标
			} else {
				form.value['val' + i] = !params ? itemParams.option[i].source : params[i].source
			}
		}
	}

	/**
	 * @description 打开NPS弹窗
	 */
	const openNps = () => {
		// // 正式版不弹出
		// // if (isRelease) return
		// const endtime = Number(localStorage.getItem('NPS-TIME'))
		// const expArr: any = localStorage.getItem('NPS-EXP') || []
		// if (endtime < new Date().getTime() && !expArr.includes(29)) {
		// 	useDialog({
		// 		title: false,
		// 		area: 36,
		// 		component: () => import('@public/bt-experience-nps/index.vue'),
		// 		modal: false,
		// 		compData: {
		// 			name: '首页',
		// 			type: 29,
		// 		},
		// 	})
		// }
	}

	return {
		mainWidth,
		loading,
		isSshLoading,
		overviewShowList,
		getOverviewData,
		openOverviewTemplate,
		openModelDialog,
		securityRisksDialog,
		getModelTitle,
		getPayStatus,
		getModelTips,

		content,
		path,
		saveFileEvent,
		getMemoData,

		// custom-overview
		isLoading,
		overviewModelList,
		supportConfig,
		supportPath,
		form,
		onPathChange,
		getOverviewTemplateData,
		dataAlignment,
		setOverviewTemplateShow,
		addOverviewFun,
		setPopoverShow,
	}
})

export default HOME_OVERVIEW_STORE
