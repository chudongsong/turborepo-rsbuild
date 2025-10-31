import type { TableBatchOptionsProps, TableBatchDialogProps, TableBatchNextAllProps, TableBatchEventProps } from '@/components/extension/bt-table-batch/types.d'
import { addTemplateDialog, editTemplateDialog, NPSDialog, chunkArray } from '@docker/useMethods'
import { useBatchStatus } from '@hooks/tools/table/column'
import { delTemplate, checkTemplateUsed, getTemplateList } from '@/api/docker'
import { getDockerStore } from '@docker/useStore'
import { useConfirm, useBatch, useDialog, useDataHandle } from '@/hooks/tools'
import { onRefresh } from '@/views/mail/views/domain/method'

const {
	refs: { isRefreshTemplateList },
} = getDockerStore()

export const templateTableData = reactive({
	isRefresh: true,
})
const tableList = ref([]) // 表格数据

// 批量操作方法
const useTemplateBatchEventHandle: TableBatchEventProps = async (batchConfirm: TableBatchDialogProps, nextAll: TableBatchNextAllProps, selectedList: AnyObject[], options: TableBatchOptionsProps): Promise<void> => {
	const { label, value } = options
	const requestHandle = async (item: AnyObject, index: number) => {
		const { id } = item
		switch (value) {
			case 'delete':
				return await delTemplate({ data: JSON.stringify({ template_id: id }) })
				break
		}
	}
	await batchConfirm({
		title: `批量${label}编排模板`,
		content: `批量${label}已选的编排模板，是否继续操作！`,
		column: [{ label: '模板名', prop: 'name' }, useBatchStatus()], // 弹窗配置
		onConfirm: async () => {
			// 递归操作所有选中的数据，如果不需要递归则不需要该方法，执行单接口请求
			await nextAll(requestHandle)
			// 执行完毕的代码，刷新列表
			isRefreshTemplateList.value = true
			// 返回false则不关闭弹窗
			return false
		},
	})
}

// 表格左上方按钮组
export const tableBtnGroup = [
	{
		active: true,
		label: '添加',
		type: 'button',
		onClick: () => {
			addTemplateDialog(() => (isRefreshTemplateList.value = true))
		},
	},
	{
		label: '需求反馈',
		type: 'link',
		class: 'ml-[2rem]',
		onClick: () => {
			NPSDialog()
		},
	},
]

/**
 * @description 编辑模板
 * @returns {Promise<VueConstructor>}
 */
export const editDataEvent = (row: any = {}): Promise<Component> =>
	useDialog({
		component: () => import('@docker/public/add-template-dialog/add-compose-template.vue'),
		title: `编辑Yaml模板`,
		area: 64,
		btn: '保存',
		compData: { row },
	})

/**
 * @description 拉取镜像事件
 * @param {FtpTableDataProps} row 行数据
 * @returns {void} void
 */
export const pullDataEvent = async (row: any): Promise<void> => {
	useDialog({
		component: () => import('./pull-mirror-select-dialog.vue'),
		compData: row,
		title: '拉取镜像',
		btn: '确定',
		area: 60,
	})
}
/**
 * @description 删除事件
 * @param {FtpTableDataProps} row 行数据
 * @returns {void} void
 */
export const deleteDataEvent = async (row: any): Promise<void> => {
	try {
		const data: any = await useDataHandle({
			request: checkTemplateUsed({ id: row.id }),
		})
		if (data.status) {
			useDialog({
				component: () => import('@docker/public/clear-confirm.vue'),
				title: `删除编排模板【${row.name}】`,
				area: 55,
				btn: true,
				compData: {
					confirmMsg: `检测到编排模板【${row.name}】，已应用到容器编排【${data.msg}】`,
					confirmCheck: `删除编排模板【${row.name}】以及已应用的容器编排和创建的容器`,
					confirmEvent: async (filters: boolean, close: any) => {
						useDataHandle({
							request: delTemplate({
								data: JSON.stringify({ template_id: row.id, status: filters }),
							}),
							message: true,
							success: () => {
								close()
								isRefreshTemplateList.value = true
							},
						})
					},
				},
			})
			return
		}
		await useConfirm({
			type: 'calc',
			title: `删除编排模板【${row.name}】`,
			content: `删除编排模板【${row.name}】，是否继续操作？`,
		})
		useDataHandle({
			request: delTemplate({
				data: JSON.stringify({ template_id: row.id }),
			}),
			message: true,
			success: () => (isRefreshTemplateList.value = true),
		})
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description 批量操作
 */
export const useTableBatch = useBatch([
	{
		label: '删除模板',
		value: 'delete',
		event: useTemplateBatchEventHandle,
	},
])

/**
 * @description 获取镜像列表
 * @returns {Promise<void>} void
 */
export const getTList = async (param: { p: number; limit: number; search: string }): Promise<{ data: any[]; total: number }> => {
	isRefreshTemplateList.value = false
	// 判断是否需要刷新
	if (!templateTableData.isRefresh) {
		return {
			data:
				chunkArray({
					limit: param.limit,
					list: tableList.value,
					p: param.p,
				}) || [],
			total: tableList.value.length,
		}
	}
	templateTableData.isRefresh = false
	const data: any[] = await useDataHandle({
		request: getTemplateList(),
		data: Array,
	})
	tableList.value = data
	return {
		data:
			chunkArray({
				limit: param.limit,
				list: tableList.value,
				p: param.p,
			}) || [],
		total: tableList.value.length,
	}
}

// 销毁
export const unmountHandler = (): void => {
	templateTableData.isRefresh = true
	tableList.value = []
}
