import { getPyModules, setPyModules } from "@/api/site"
import { useConfirm, useDataHandle, useMessage } from "@/hooks/tools"
import { useSiteStore } from "@/views/site/useStore"

const Message = useMessage()
const { rowData } = useSiteStore()

export const modulesData = reactive({ // 模块数据
	name: '',
	version: '',
})

export const isRefreshList = ref(false) // 是否刷新列表

export const getTableList = async () => {
	try {
		const data = await useDataHandle({
			request: getPyModules({ name: rowData.value.name }),
			data: [Array, (data) => data.map((item: any) => ({
				name: item[0],
				version: item[1],
			}))],
		})
		if (!Array.isArray(data)) return { data: [], total: 0 }
		return { data, total: data.length }
	} catch (error) {
		console.error(error)
		return { data: [], total: 0 }
	}
}

/**
 * @description 卸载事件
 * @param data  选中的数据
 */
export const deleteEvent = async (row: any) => {
	const params: any = {
		name: rowData.value.name,
		act: 'uninstall',
		p: row.name,
		v: row.version,
	}
	await useConfirm({
		title: '卸载项目环境模块',
		content: `卸载${row.name}后，模块相关的全局变量将无法调用，是否继续？`,
		icon: 'warning-filled',
	})
	const res: AnyObject = await useDataHandle({
		loading: '正在卸载，请稍后...',
		request: setPyModules(params),
		message: true,
	})
	if (res.status) isRefreshList.value = true
}

/**
 * @description 搜索框事件
 * @param val  搜索框输入值
 */
export const installModule = async () => {
	if (modulesData.name === '') {
		Message.error('请输入模块名称')
		return
	}
	const res: AnyObject = await useDataHandle({
		loading: '正在安装，请稍后...',
		request: setPyModules({
			name: rowData.value.name,
			act: 'install',
			p: modulesData.name,
			v: modulesData.version,
		}),
		message: true,
	})
	if (res.status) {
		modulesData.name = ''
		modulesData.version = ''
		isRefreshList.value = true
	}
}