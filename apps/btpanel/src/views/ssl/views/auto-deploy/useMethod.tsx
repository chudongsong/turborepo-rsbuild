import { batchDeleteSynchronTask, deleteSynchronTask, getDeployTaskDetail, getDeployTaskList } from '@/api/ssl'
import { TableColumnProps } from '@/components/data/bt-table/types'
import { TableBatchDialogProps, TableBatchEventProps, TableBatchNextAllProps, TableBatchOptionsProps } from '@/components/extension/bt-table-batch/types'
import { useConfirm, useDataHandle, useDialog } from '@/hooks/tools'
import { useBatchStatus, useCheckbox } from '@/hooks/tools/table/column'
import { formatTime, getPageTotal } from '@/utils'
import { ElDivider } from 'element-plus'
import { useDeployStore } from './useStore'
import { resultDialog } from '@ssl/useMethod'

const { isRefreshDeployTaskList } = storeToRefs(useDeployStore())

/**
 * @description 打开部署任务弹窗
 * @param isEdit 是否是编辑
 * @param row 行数据
 */
export const openDeployTaskDialog = (isEdit: boolean, row?: any) => {
	useDialog({
		title: `${isEdit ? row.task_name + ' - 编辑' : '创建'}部署任务`,
		area: 48,
		component: () => import('@/views/ssl/views/auto-deploy/deploy-task/index.vue'),
		showFooter: true,
		confirmText: `${isEdit ? '保存' : '创建'}`,
		compData: {
			isEdit,
			row: row || {},
		},
	})
}

/**
 * @description 获取部署任务详情
 * @param {AnyObject} data 部署任务ID
 * @returns {Promise<void>} void
 */
export const openDeployTaskDetailDialog = async (row: AnyObject) => {
	useDataHandle({
		loading: '正在获取部署任务详情',
		request: getDeployTaskDetail({ task_id: row.id }),
		success: ({ data }) => {
			const { msg } = data
			useDialog({
				title: `${row.task_name} 部署状态详情`,
				area: 48,
				component: () => import('@/views/ssl/views/auto-deploy/deploy-status-info/index.vue'),
				compData: {
					...msg,
				},
			})
		},
	})
}

export const tableBtnGroup: any = [
	{
		content: '创建',
		dropdownClass: 'bg-white',
		splitButton: true,
		active: true,
		event: () => {
			openDeployTaskDialog(false, {})
		},
	},
]

export const deleteDeployTask = (row: any) => {
	useConfirm({
		title: '删除部署任务',
		content: `确定要删除 ${row.task_name} 部署任务吗？`,
		confirmText: '删除',
		cancelText: '取消',
		onConfirm: () => {
			useDataHandle({
				loading: '正在删除部署任务',
				message: true,
				request: deleteSynchronTask({ task_id: row.id }),
				success: res => {
					if (res.status) {
						isRefreshDeployTaskList.value = true
					}
				},
			})
		},
	})
}

export const tableRequestData = async (data: any) => {
	try {
		const { data: resData } = await getDeployTaskList(data)
		return {
			data: resData.data,
			total: getPageTotal(resData.page),
			other: {
				search_history: [],
			},
		}
	} catch (error) {
		return {
			data: [],
			total: 0,
			other: {
				search_history: [],
			},
		}
	}
}

export const tableColumns = [
	useCheckbox(),
	{
		label: '名称',
		prop: 'task_name',
	},
	{
		label: '云端任务名',
		isCustom: false,
		render: (row: any) => {
			return row.access_state === 2 ? row.synchron_info.synchron_name : '--'
		},
	},
	{
		label: '证书域名',
		isCustom: true,
		render: (row: any) => {
			return row.access_state === 2 ? row.synchron_info.host : '--'
		},
	},
	{
		label: '证书品牌',
		isCustom: false,
		render: (row: any) => {
			return row.access_state === 2 ? row.synchron_info.host_brand : '--'
		},
	},
	{
		label: '到期时间',
		isCustom: true,
		width: 180,
		prop: 'cert_expire_time',
		render: (row: any) => {
			return row.access_state === 2 ? formatTime(row.synchron_info.endtime) : '--'
		},
	},
	{
		label: '网站',
		isCustom: true,
		prop: 'sites',
		width: 280,
		showOverflowTooltip: true,
	},
	{
		label: '最近部署时间',
		isCustom: true,
		width: 180,
		prop: 'deploy_time',
		render: (row: any) => (row.deploy_time ? formatTime(row.deploy_time) : '--'),
	},
	{
		label: '最近部署状态',
		isCustom: true,
		prop: 'deploy_status',
		render: (row: any) => {
			const statusMap: { [key: string]: JSX.Element } = {
				1: <span class="text-primary">成功</span>,
				0: <span>--</span>,
				'-1': (
					<span class="text-danger cursor-pointer" onClick={() => openDeployTaskDetailDialog(row)}>
						失败
					</span>
				),
			}
			return statusMap[row.deploy_status] || statusMap[0]
		},
	},
	{
		label: '接入状态',
		isCustom: true,
		prop: 'access_state',
		render: (row: any) => {
			const mapStatus = new Map([
				[1, '等待接入'],
				[2, '成功'],
				[-1, '失败'],
			])
			const mapColor = new Map([
				[1, 'text-warning'],
				[2, 'text-primary'],
				[-1, 'text-danger'],
			])
			return <span class={mapColor.get(row.access_state)}>{mapStatus.get(row.access_state)}</span>
		},
	},
	{
		label: '操作',
		fixed: 'right',
		width: 120,
		render: (row: any) => {
			// 按钮渲染
			const spanRender = (text: string, onClick: AnyFunction) => (
				<span class="bt-link" onClick={onClick}>
					{text}
				</span>
			)
			const edit = spanRender('编辑', () => {
				openDeployTaskDialog(true, row)
			})
			const del = spanRender('删除', () => deleteDeployTask(row))
			const btnGround: JSX.Element[] = []
			btnGround.push(edit)
			btnGround.push(<ElDivider direction="vertical" />)
			btnGround.push(del)
			return btnGround
		},
	},
]

/**
 * @description 批量处理事件
 * @param {TableBatchDialogProps} batchConfirm 选中处理事件
 * @param {TableBatchNextAllProps} nextAll 选中处理事件
 * @param {Ref<FtpTableRowProps[]>} selectList 选中的数据
 * @param {TableBatchOptionsProps} options 选中的配置
 * @returns {Promise<void>} void
 */
export const useBatchEventHandle: TableBatchEventProps = async (batchConfirm: TableBatchDialogProps, nextAll: TableBatchNextAllProps, selectList: Ref<any[]>, options: TableBatchOptionsProps): Promise<void> => {
	const { label, value } = options
	let taskId: any = selectList.value.map(item => item.id).join(',')

	const requestHandle = async (caseValue: string) => {
		switch (caseValue) {
			case 'delete':
				// 删除接口
				return useDataHandle({
					loading: '正在删除部署任务',
					request: batchDeleteSynchronTask({ task_ids: taskId }),
					success: res => {
						const { data } = res
						console.log(data, res, 'data')
						let resultData = {
							resultData: [...data.faildList, ...data.successList],
							resultTitle: `${label}部署任务`,
							resultColumn: [
								{
									label: '名称',
									prop: 'task_name',
								},
								{
									label: '操作结果',
									render: (row: any) => {
										return (
											<div class={row.status ? 'text-primary' : 'text-danger'}>
												<spam>{row.error_msg}</spam>
											</div>
										)
									},
								},
							],
						}
						resultDialog(resultData)
					},
				})
		}
	}
	await useDialog({
		title: `批量${label}部署任务`,
		area: 46,
		component: () => import('@components/extension/bt-result/index.vue'),
		compData: {
			resultTitle: `批量${label}部署任务`,
			resultData: selectList.value,
			resultColumn: [{ label: '名称', prop: 'task_name' }, useBatchStatus()] as TableColumnProps[],
			autoTitle: `批量${label}部署任务`,
		},
		showFooter: true,
		onConfirm: async () => {
			await requestHandle(value)
			isRefreshDeployTaskList.value = true
		},
	})
}

export const batchCertificateOptions = [
	{
		label: '删除',
		value: 'delete',
		event: useBatchEventHandle,
	},
] as TableBatchOptionsProps[]

/**
 * @description 打开使用说明弹窗
 * @returns {void} void
 */
export const openUseExplain = () => {
	window.open('https://www.bt.cn/bbs/thread-141973-1-1.html', '_blank', 'noopener,noreferrer')
}
