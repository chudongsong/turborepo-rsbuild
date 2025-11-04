import { setComposeRemark } from '@/api/docker'
import { getDockerStore } from '@docker/useStore'
import { Message, useConfirm, useDialog, useDataHandle } from '@/hooks/tools'
import { checkVariable } from '@utils/index'
import { addCompose, createComposeDialog, socketInstance, isEmpty, createNewSocket } from '@docker/views/orchestration/useController'

const {
	refs: { orchestrationData },
} = getDockerStore()

export const search = ref('') // 搜索关键字
export const selectObj = ref({}) // checkbox列表对象
export const checkedList = ref<string[]>([]) // 选中的列表
export const list = ref<any[]>([]) // 列表数据
export const selectConfig = reactive({
	checked: false, // 是否全选
	showCheckPopover: false, // 是否显示弹框
	showSlectPopover: false, // 是否显示弹框
	popoverContent: '', // 弹框内容
	type: '', // 选择类型
})
export const batchMode = ref(false) // 批量操作模式
// 表格左上方按钮组
export const tableBtnGroup = [
	{
		active: true,
		content: `添加容器编排`,
		event: () => createComposeDialog(addCompose),
	},
]
let timer: any = null // 定时器
export let firstLoad = ref(true) // 首次加载
export const editMode = ref<any>({}) // 编辑模式
export const localRemark = ref('') // 本地备注

// 状态
export const composeStatusObject = (compose: any) => {
	switch (compose.run_status) {
		case 'running':
			return {
				text: '运行中',
				type: 'success',
			}
		case 'exited':
			return {
				text: '已停止',
				type: 'danger',
			}
		default:
			return {
				text: '异常',
				type: 'warning',
			}
	}
}

/**
 * @description: 设置选中
 * @param { object } item
 */
export const setSelect = (item: any) => {
	const index = checkedList.value.indexOf(item.name)
	if (index === -1) {
		checkedList.value.push(item.name)
		selectConfig.checked = checkedList.value.length === list.value.length
	} else {
		checkedList.value.splice(index, 1)
		selectConfig.checked = false
	}
}

/**
 * @description: 批量操作
 */
export const editRemark = (item: any) => {
	localRemark.value = item.remark
	editMode.value[item.name] = true
}
/**
 * @description: 设置是否选中
 * @param { boolean } val
 */
const setCheckedboxStatus = (composeList: { name: string }[]) => {
	const checkObj: any = {}
	const arr = composeList.map((item: any) => {
		//判断是否选中
		checkObj[item.name] = checkedList.value.includes(item.name)
		return item.name
	})
	// 过滤选中列表
	checkedList.value = checkedList.value.filter((name: string) => arr.includes(name))
	return checkObj
}

/**
 * @description: 显示提示选择类型
 */
const showBatchTips = (type: string) => {
	clearTimeout(timer)
	selectConfig.showSlectPopover = false
	selectConfig.showCheckPopover = false
	switch (type) {
		case 'select':
			selectConfig.showSlectPopover = true
			timer = setTimeout(() => {
				selectConfig.showSlectPopover = false
			}, 2000)
			break
		case 'check':
			selectConfig.showCheckPopover = true
			timer = setTimeout(() => {
				selectConfig.showCheckPopover = false
			}, 2000)
			break
	}
}
/**
 * @description 判断是否选中选项框弹出框显示
 * @param { boolean } pass
 */
export const onShowSelect = () => {
	if (checkedList.value.length !== 0 && selectConfig.type !== '') return
	switch (true) {
		case checkedList.value.length === 0:
			selectConfig.popoverContent = '请先选择要操作的容器编排'
			showBatchTips('check')
			break
		case selectConfig.type === '':
			selectConfig.popoverContent = '请选择批量操作'
			showBatchTips('select')
			break
	}
}

// 全选
export const selectAll = (val: boolean) => {
	if (val) {
		checkedList.value = list.value.map(item => item.name)
		selectObj.value = setCheckedboxStatus(list.value)
	} else {
		checkedList.value = []
		selectObj.value = setCheckedboxStatus(list.value)
	}
}

// 批量操作
export const onOperation = () => delComposeBatch()

/**
 * @description: 批量删除编排
 */
const delComposeBatch = async () => {
	try {
		await useConfirm({
			icon: 'warning-filled',
			title: `批量删除容器编排`,
			width: '35rem',
			content: `将批量删除选中的${checkedList.value.length}个容器编排,是否继续？`,
		})

		const params = {
			mod_name: 'docker',
			sub_mod_name: 'com',
			def_name: 'batch_delete',
			project_list: [] as { project_name: string; path: string }[],
			ws_callback: 'batch_delete',
		}

		checkedList.value.map((item: string) => {
			const compose = list.value.find((compose: any) => compose.name === item)
			compose && params.project_list.push({ project_name: item, path: compose.path })
		})
		const resultList: any[] = []
		orchestrationData.value.noRefresh = true
		let load = Message.load('正在删除中')
		socketInstance.value.socketRequest({
			params,
			onMessage: (res: any) => {
				let delItem = checkVariable(res.data, 'object', false)
				delItem &&
					resultList.push({
						name: delItem.project_name,
						status: delItem.status,
					})
				if (res.data === -1) {
					orchestrationData.value.noRefresh = false
					load.close()
					batchMode.value = false // 结束
					// 结束
					useDialog({
						title: '批量删除结果',
						area: 42,
						component: () => import('@/components/extension/bt-result/index.vue'),
						compData: {
							resultData: resultList,
							autoTitle: `批量删除完成`,
							resultColumn: [
								{
									label: '容器编排名称',
									prop: 'name',
								},
								{
									label: '操作结果',
									align: 'right',
									render: (row: any) => {
										return h(
											'span',
											{
												class: row.status ? 'text-primary' : row.status ? 'text-danger' : '',
											},
											row.status ? '删除成功' : '删除失败'
										)
									},
								},
							],
						},
					})
				}
			},
		})
	} catch (error) {}
}

export const blurInput = (e: any) => {
	e.target.blur()
}

/**
 * @description: 设置备注
 * @param { any } e
 * @param { object } item
 */
export const setRemark = async (e: any, item: any) => {
	editMode.value[item.name] = false
	orchestrationData.value.isEdit = false
	// Vue.set(editMode.value, item.name, false)

	if (e.target.value === item.remark) return
	await useDataHandle({
		request: setComposeRemark({
			remark: e.target.value,
			name: item.name,
			path: item.path,
		}),
		message: true,
		success: (res: any) => {
			if (res.status) {
				item.remark = e.target.value
			}
		},
	})
	// 重新创建连接
	toggleCurrentCompose(item)
}

/**
 * @description: 切换当前编排
 * @param { object } item
 */
export const toggleCurrentCompose = async (item: any) => {
	if (editMode.value[item.name]) return
	// 重新创建连接
	await createNewSocket()
	getOrchestrationList()
	orchestrationData.value.currentCompose = item
	if (item.path === orchestrationData.value.currentCompose.path) {
		orchestrationData.value.refreshItem = !orchestrationData.value.refreshItem
	}
}

export const openOrchestrationTemplate = () => {
	useDialog({
		title: '编排模板',
		area: 100,
		component: () => import('@docker/views/project-template/index.vue'),
	})
}

// 获取编排列表
export const getOrchestrationList = async (force?: boolean | 'force') => {
	try {
		const params = {
			mod_name: 'docker',
			sub_mod_name: 'com',
			def_name: 'get_project_list',
			ws_callback: 'get_project_list',
		}

		orchestrationData.value.refreshList = false
		// orchestrationData.value.loading = true
		socketInstance.value.socketRequest({
			params,
			onMessage: async (res: any) => {
				if (orchestrationData.value.isEdit) {
					// 编辑备注模式下不刷新
					return
				}
				// 超出调用问题
				list.value = res.data || []
				orchestrationData.value.loading = false
				selectObj.value = setCheckedboxStatus(list.value)
				isEmpty.value = list.value.length === 0
				if (list.value.length === 0) {
					firstLoad.value = false
					return
				}
				if (orchestrationData.value.noRefresh) return // 暂停刷新
				list.value.forEach((item: any) => {
					if (!editMode.value[item.name]) editMode.value[item.name] = false
				})
				const currentComposeName = orchestrationData.value.currentCompose.name
				const oldCompose = list.value.find((item: any) => item.name === currentComposeName)
				// 如果当前编排不存在则重新创建连接
				if (!oldCompose && currentComposeName) {
					await createNewSocket()
					getOrchestrationList()
				}
				if (force === 'force') {
					// orchestrationData.value.currentCompose = list.value[0]
					toggleCurrentCompose(list.value[0])
				} else {
					orchestrationData.value.currentCompose = oldCompose || list.value[0]
				}
				firstLoad.value = false
			},
		})
	} catch (error) {
		console.log(error)
		orchestrationData.value.loading = false
		firstLoad.value = false
	} finally {
		// orchestrationData.value.loading = false
	}
}

// 卸载操作
export const unmountHandle = () => {
	search.value = ''
	checkedList.value = []
	selectObj.value = {}
	list.value = []
	selectConfig.checked = false
	selectConfig.showCheckPopover = false
	selectConfig.showSlectPopover = false
	selectConfig.popoverContent = ''
	selectConfig.type = ''
	batchMode.value = false
	editMode.value = {}
	localRemark.value = ''
	firstLoad.value = true
	clearTimeout(timer)
	timer = null
}
