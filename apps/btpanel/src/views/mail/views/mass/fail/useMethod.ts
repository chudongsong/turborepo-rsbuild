import { getTaskError, getTaskErrorDetails } from '@/api/mail'
import { MailTaskFail, MailTask } from '@mail/types'
import { useDialog } from '@/hooks/tools'
import MAIL_MASS_FAIL from '@mail/views/mass/fail/store'
import { storeToRefs } from 'pinia'
import { isArray, isObject, getPageTotal } from '@/utils'

const { search, table, loading, detailsModal, propsData, detailLoading, detailsTable, detailsColumns, detailSearch } =
	storeToRefs(MAIL_MASS_FAIL())
const { reset } = MAIL_MASS_FAIL()

export const onShowDetails = (row: MailTaskFail) => {
	detailsModal.value.data.id = propsData.value.id
	detailsModal.value.data.type = search.value.type
	detailsModal.value.data.row = row
	detailsModal.value.title = `失败详情 [${search.value.type === 'domain' ? row.domain : row.status}]`
	useDialog({
		title: detailsModal.value.title,
		area: 98,
		component: () => import('./details.vue'),
		compData: detailsModal.value.data,
	})
}

export const getList = async () => {
	try {
		loading.value = true
		search.value.task_id = propsData.value.id
		const { data } = await getTaskError(toRaw(search.value))
		table.value.data = isArray(data) ? data : ([] as any)
	} finally {
		loading.value = false
	}
}

export const init = async (data: MailTask) => {
	propsData.value = data
	reset()
}

export const useColumns = () => {
	// 用于存储插入项的索引
	let insertedIndex = -1

	const initColumns = () => {
		// 清除之前可能存在的插入项
		if (insertedIndex !== -1) {
			detailsColumns.value.splice(insertedIndex, 1)
			insertedIndex = -1
		}

		if (detailSearch.value.type === 'domain') {
			const mapType: any = {
				bounced: '退信',
				deferred: '延迟',
				delivered: '成功',
				invalid: '无效',
				rejected: '拒绝',
			}
			// 插入列并记录索引
			insertedIndex = detailsColumns.value.length
			detailsColumns.value.push({
				prop: 'status',
				label: '状态',
				width: 100,
				showOverflowTooltip: true,
				render: row => {
					return mapType[row.status]
				},
			})
		} else if (detailSearch.value.type === 'status') {
			// 插入列并记录索引
			insertedIndex = 0
			detailsColumns.value.unshift({
				prop: 'domain',
				label: '域名',
				width: 120,
				showOverflowTooltip: true,
				render: row => {
					return row.domain
				},
			})
		}
	}

	// 组件卸载时移除插入的项
	onUnmounted(() => {
		if (insertedIndex !== -1) {
			detailsColumns.value.splice(insertedIndex, 1)
		}
	})

	return {
		initColumns,
	}
}
// const onMousemove = (row: any) => {
// 	row.tooltip = true
// }
// const onMouseleave = (row: any) => {
// 	row.tooltip = false
// }
// const rowProps = (row: any) => {
// 	return {
// 		onMousemove: () => {
// 			row.tooltip = true
// 		},
// 		onMouseleave: () => {
// 			row.tooltip = false
// 		},
// 	}
// }

export const getDetailsList = async () => {
	try {
		detailLoading.value = true
		const { data } = await getTaskErrorDetails(toRaw(detailSearch.value))
		if (isObject(data)) {
			detailsTable.value.data = isArray(data.data) ? data.data : []
			detailsTable.value.total = getPageTotal(data.page)
		}
	} finally {
		detailLoading.value = false
	}
}

export const initDetailSearch = () => {
	detailSearch.value.task_id = detailsModal.value.data.id as number
	detailSearch.value.type = detailsModal.value.data.type as string
	detailSearch.value.value =
		detailsModal.value.data.type === 'domain' ? detailsModal.value.data.row.domain : detailsModal.value.data.row.status
}
