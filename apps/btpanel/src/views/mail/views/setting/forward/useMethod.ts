import { getDomainName, getForwardList as getForwardListApi, getMailboxListByName, addForward as addForwardApi, editForward as editForwardApi, deleteForward } from '@/api/mail'
import { TableColumnProps } from '@/components/data/bt-table/types'
import { TableBatchDialogProps, TableBatchEventProps, TableBatchNextAllProps, TableBatchOptionsProps } from '@/components/extension/bt-table-batch/types'
import { useBatch, useConfirm, useDataHandle, useDialog } from '@/hooks/tools'
import { useBatchStatus } from '@/hooks/tools/table/column'
import { openResultView } from '@/public'

export const forwardType = ref(0) // 0邮箱 1域名

export const isRefresh = ref(false)

export const isLoading = ref(false)

export const domainList = ref([])

export const mailboxList = ref([])

export const forwardForm = ref({
	type: 'mail', // 类型 mail邮箱 wildcard通配符
	forward_type: 0, // 0邮箱 1域名
	rule: 'all', // 转发规则
	rule_str: '', // 转发规则字符串or邮箱
	receiver: '', // 接收者
	status: true, // 状态
	domain: '', // 域名
})

export const getForwardList = async () => {
	try {
		const { data } = await getForwardListApi({ dtype: forwardType.value })
		console.log(data)
		return {
			data: data.data,
			total: data.total,
		}
	} catch (error) {
		return {
			data: [],
			total: 0,
		}
	}
}

export const useBatchEventHandle: TableBatchEventProps = async (batchConfirm: TableBatchDialogProps, nextAll: TableBatchNextAllProps, selectList: Ref<any[]>, options: TableBatchOptionsProps, clear, config): Promise<void> => {
	const { label, value } = options
	const template: Map<string, string> = new Map([['delete', '批量删除已选的转发规则']])
	const requestHandle = async () => {
		const requestList: Map<string, AnyFunction> = new Map([['delete', deleteForward]])
		const fn = requestList.get(value)
		switch (value) {
			case 'delete':
				const delParams = selectList.value.map((item: any) => item.address).join(',')
				if (fn) return await fn({ forward_type: forwardType.value, address: delParams })
				break
		}
	}
	await batchConfirm({
		title: `批量${label}`,
		content: `${template.get(value) as string}，是否继续操作！`,
		column: [{ label: '转发规则', prop: 'address' }, useBatchStatus()] as TableColumnProps[], // 弹窗配置
		onConfirm: async () => {
			const res = await requestHandle()
			// 执行完毕的代码，刷新列表
			isRefresh.value = true
			const data: { name: string; msg: string; status: boolean }[] = []
			if (res.status) {
				selectList.value.forEach((item: any) => {
					data.push({
						name: item.address,
						status: true,
						msg: '删除成功',
					})
				})
			} else {
				selectList.value.forEach((item: any) => {
					data.push({
						name: item.address,
						status: false,
						msg: '删除失败',
					})
				})
			}
			clear && clear()
			openResultView(data, { title: `${label}转发规则` })
		},
	})
}

export const useTableBatch = useBatch([
	{
		label: '删除',
		value: 'delete',
		event: useBatchEventHandle,
	},
])

export const addOrEditForward = async (isEdit: boolean, row?: any) => {
	forwardForm.value.forward_type = forwardType.value // 设置转发类型
	useDialog({
		title: isEdit ? `编辑转发规则${row.forwarder}` : '添加转发规则',
		area: 54,
		component: () => import('./add/index.vue'),
		compData: {
			isEdit,
			row,
		},
		showFooter: true,
	})
}

export const handleForwardFormInit = (row: any) => {
	forwardForm.value.type = row.rule === '' ? 'mail' : 'wildcard'
	forwardForm.value.status = row.active ? true : false
	forwardForm.value.domain = row.domain
	forwardForm.value.rule = row.rule
	forwardForm.value.receiver = row.goto
	forwardForm.value.forward_type = forwardType.value
	if (row.rule === '') {
		forwardForm.value.rule_str = row.address
	} else {
		forwardForm.value.rule_str = row.rule_str
	}
	return forwardForm.value
}

export const formDataInit = async () => {
	isLoading.value = true
	try {
		const {
			data: { data: domainListData },
		} = await getDomainName()
		domainList.value = domainListData.map((item: any) => ({
			label: item,
			value: item,
		}))
	} catch (error) {
		console.log(error)
	} finally {
		isLoading.value = false
	}
}

export const getMailboxListByDomainName = async (domain: string) => {
	try {
		const {
			data: { data: mailboxListData },
		} = await getMailboxListByName({ domain })
		mailboxList.value = mailboxListData.map((item: any) => ({
			label: item.username,
			value: item.username,
		}))
	} catch (error) {
		console.log(error)
	}
}

export const resetFormData = () => {
	forwardForm.value = {
		type: 'mail',
		forward_type: 0,
		rule: 'all',
		rule_str: '',
		receiver: '',
		status: true,
		domain: '',
	}
}

const handleFromParams = (data: any) => {
	let params = {
		...data,
	}
	params.status = params.status ? 1 : 0
	if (params.type !== 'wildcard') {
		params.rule = ''
	}
	if (params.forward_type === 1) {
		delete params.rule_str
		delete params.rule
	}
	delete params.type
	return params
}

export const addForwardFrom = async (data: any) => {
	try {
		let params = handleFromParams(data)
		const res = (await useDataHandle({
			request: addForwardApi(params),
			loading: '添加中...',
			message: true,
		})) as any
		if (res.status) {
			isRefresh.value = true
		}
		return res.status
	} catch (error) {
		console.log(error)
		return false
	}
}

export const editForwardFrom = async (data: any, address: string) => {
	try {
		let params = handleFromParams(data)
		const res = (await useDataHandle({
			request: editForwardApi({
				...params,
				address,
			}),
			loading: '编辑中...',
			message: true,
		})) as any
		if (res.status) {
			isRefresh.value = true
		}
		return res.status
	} catch (error) {
		console.log(error)
		return false
	}
}

export const deleteForwardFrom = async (data: any) => {
	useConfirm({
		title: `删除转发规则【${data.forwarder}】`,
		content: '是否确认删除该转发规则？',
		onConfirm: async () => {
			useDataHandle({
				request: deleteForward({
					forward_type: forwardType.value,
					address: data.address,
				}),
				loading: '删除中...',
				message: true,
				success: () => {
					isRefresh.value = true
				},
			})
		},
	})
}
