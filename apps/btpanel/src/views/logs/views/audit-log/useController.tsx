// import { useGlobalStore } from '@/store/global'
import { LogMenuData } from '@/types/log'
import { isArray, isObject } from '@/utils'
import { useLogStore } from '../../useStore'
import { LOG_AUDIT_STORE, useAuditLogStore } from './useStore'
const { selectedItem } = useLogStore()

const { currentItem, isInit, isRefreshList } = useAuditLogStore()
const { getLogData, getMenuList } = LOG_AUDIT_STORE()

// const { payment } = useGlobalStore()

export const tableColumn = ref<any>([]) // 表格列
export const logsMsg = ref('') // 日志信息
export const menuOptions = ref([]) // 菜单选项
export const tableView = ref(true) // 是否表格视图

export const placeholder = computed(() => {
	return !tableView.value ? '请输入关键字' : '请输入来源/端口/角色/事件'
})

/**
 * @description 渲染详细日志数据
 * @param item
 * @param params
 * @returns
 */
export const renderLogData = async (item: LogMenuData, params?: any) => {
	try {
		// if (payment.value.authType === 'ltd') {
		if (isInit.value) {
			const { data }: any = await getMenuList()
			menuOptions.value = data
			isInit.value = false
			item = menuOptions.value[0]
		}
		const { data: res } = await getLogData(item, params) // 获取数据
		if (isArray(res)) return renderLogTools(res as Array<string>)
		if (isObject(res)) return renderTableTools(res.data)
		// }
	} catch (error) {
		console.log(error)
		return { data: [], total: 0, other: {} }
	}
}

/**
 * @description 渲染表格日志
 * @param {Array<{ [key: string]: string }>} data 表格数据
 */
const renderTableTools = (data: Array<{ [key: string]: string }>) => {
	try {
		tableView.value = true
		if (data.length === 0) {
			// 为空的情况下的内容占位
			tableColumn.value = [
				{ label: '时间', prop: 'time' },
				{ label: '角色', prop: '' },
				{ label: '事件', prop: '' },
			]
			return { data: [], total: 0, other: {} }
		}
		tableColumn.value = Object.keys(data[0])?.map((item: any, index: number) => {
			if (item === '事件') {
				return {
					label: item,
					render: function (row: any) {
						const htmlEntities: { [key: string]: string } = {
							'&amp;': '&',
							'&lt;': '<',
							'&gt;': '>',
							'&quot;': '"',
							'&#39;': "'",
							'&#x27;': "'",
						}
						return <span>{row['事件'].replace(/&amp;|&lt;|&gt;|&quot;|&#39;|&#x27;/g, (match: string) => htmlEntities[match])}</span>
					},
				}
			}
			return { label: item, prop: item }
		})
		return { data, total: data.length, other: {} }
	} catch (error) {
		console.log(error)
		return { data: [], total: 0, other: {} }
	}
}

/**
 * @description 渲染pre日志
 * @param {Array<string>} data 日志数据
 */
const renderLogTools = (data: Array<string>) => {
	tableView.value = false
	logsMsg.value = data?.join('\n') || '暂无执行日志'
	return { data: [], total: data.length, other: {} }
}

/**
 * @description 点击tab
 * @param item
 * @returns
 */
export const handleClickTab = async (item: LogMenuData) => {
	try {
		// 重复点击
		if (item.name === selectedItem.value) return
		// 当前点击项赋值
		selectedItem.value = item.name
		currentItem.value = item
		// 刷新列表
		isRefreshList.value = true
	} catch (error) {
		console.log(error)
	}
}

export const productData = {
	title: '日志审计-功能介绍',
	ps: '对系统、网络、应用程序等进行记录的各种操作、事件、异常情况等信息进行收集、分析和审计，通过对这些日志信息的审计，可以发现系统存在的安全问题，及时采取措施进行修复和防范。',
	source: 104,
	desc: ['分析和解析常用日志'],
	isSkipPay: true, // 是否跳过支付
	tabImgs: [
		{
			title: '日志审计',
			imgSrc: 'https://www.bt.cn/Public/new/plugin/introduce/logs/logAudit_2.png',
		},
	],
} // 产品介绍
