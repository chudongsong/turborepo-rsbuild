import { Message, useConfirm, useDialog, useDataHandle } from '@/hooks/tools'
import { fileSelectionDialog, openPluginView } from '@/public'
import { useCheckbox, useOperate } from '@/hooks/tools/table/column'
import { useAllTable } from '@/hooks/tools/table/index'
import { ElDescriptions, ElDescriptionsItem } from 'element-plus'
import { openResultDialog } from '@site/useController'
import { formatTime, getByteUnit, setCookie } from '@/utils'
import { useGlobalStore } from '@/store/global'
import { proxyTcpAction } from '@api/site'
import { getSlaveList, getClbAllNode, getMysqlSlaveInfo } from '@/api/node'
import { useMasterMysqlStore } from './useStore'
import { isNil } from 'ramda'
const { mysqlRowData } = useMasterMysqlStore()
const { plugin, getGlobalInfo } = useGlobalStore()

// 添加类型定义
interface ProxySiteParams {
	remark: string
	targetType: string
	proxysite: string
	domains: string
	todomain: string
}

/**
 * @description 打开添加通用项目弹窗
 */
export const openAddDatabaseView = async () => {
	const getPanelInfo = await getGlobalInfo()
	await useDataHandle({
		request: getClbAllNode(),
		loading: '正在获取节点数据，请稍等...',
		success: (res: any) => {
			if (res.msg && res.status === false) Message.error(res.msg)
			mysqlRowData.value = res.data.data
				.filter((item: any) => !item.is_local && !item.lpver)
				.map((item: any) => {
					return { label: `${item.remarks} - ${item.server_ip}`, value: item.id, remarks: item.server_ip }
				})
		},
	})
	useDialog({
		title: '添加主从',
		area: 62,
		compData: {
			panel_address: typeof getPanelInfo === 'object' && getPanelInfo?.panel?.address,
		},
		btn: ['添加', '取消'],
		component: () => import('@node/views/master/mysql/add-form.vue'),
		showFooter: true,
	})
}

/**
 * @description 打开设置
 */
export const openSettingView = (row: any, isOpenLog: boolean = false) => {
	const { openMasterSlaveLog } = useMasterSlaveLog()
	openMasterSlaveLog(row, isOpenLog)
}

/**
 * @description 删除mysql主从项目
 */
export const deleteDatabase = async (row: any) => {
	const { deleteMysqlSlaveEvent, isRefreshList } = useMasterMysqlStore()
	await useConfirm({
		title: `${`删除mysql从库【${row.slave_ip}】`}`,
		content: `${`风险操作，此操作不可逆，删除【${row.slave_ip}】后您将无法管理该从库，是否继续操作？`}`,
	})
	const { status, msg } = await deleteMysqlSlaveEvent(row)
	if (status) {
		Message.success(msg)
		isRefreshList.value = true
	} else {
		Message.error(msg)
	}
}

/**
 * @description 批量删除mysql主从项目
 */
export const multDeleteDatabase = async (rows: any, clearSelection: any) => {
	await useConfirm({
		title: '批量删除mysql主从项目',
		content: '批量删除选中的项目后，项目将无法恢复，是否继续操作？',
		type: 'check',
		check: {
			content: '同时删除网站根目录',
			onConfirm: async (status: boolean) => {
				let params: any = {
					remove_path: status ? 1 : 0,
					site_list: JSON.stringify(
						rows.map((item: any) => ({
							id: item.id,
							site_name: item.name,
						}))
					),
				}
				// const { data } = await multDeleteDatabaseEvent(params)
				openResultDialog({
					// resultData: data,
					resultTitle: '批量删除mysql主从项目',
				})
				clearSelection() // 清除选中
			},
		},
	})
}

/**
 * @description 启动或停止从库同步
 */
export const setMysqlSlave = async (row: any) => {
	await useConfirm({
		title: `${row.run_status === 'start' ? '停止' : '启动'}从库同步【${row.slave_ip}】`,
		content: `是否确认${row.run_status === 'start' ? '停止' : '启动'}从库同步【${row.slave_ip}】？`,
	})
	const { setMysqlSlaveEvent, isRefreshList } = useMasterMysqlStore()
	await setMysqlSlaveEvent(row, row.run_status === 'start' ? 'stop' : 'start')
	isRefreshList.value = true
}

/**
 * @description 打开历史备份文件
 */
export const useHistoryBackup = () => {
	const { getMysqlSlaveHistoryEvent, deleteMysqlSlaveHistoryEvent } = useMasterMysqlStore()
	const openHistoryBackup = () => {
		const { BtTable, refresh } = useAllTable({
			request: async () => {
				const { data } = await getMysqlSlaveHistoryEvent()
				if (data.msg && data.status === false) Message.error(data.msg)
				return {
					data: data.data,
					total: data.data.length,
				}
			},
			columns: [
				{
					label: '文件名',
					prop: 'name',
				},
				{
					label: '大小',
					prop: 'size',
					render: (row: any) => {
						return getByteUnit(row.size)
					},
				},
				{
					label: '创建时间',
					prop: 'mtime',
					width: 160,
					render: (row: any) => {
						return formatTime(row.mtime)
					},
				},
				useOperate([
					{
						title: '下载',
						onClick: (row: any) => {
							window.open('/download?filename=' + row.path)
						},
					},
					{
						title: '删除',
						onClick: async (row: any) => {
							await useConfirm({
								title: '删除备份文件',
								content: '是否确认删除该备份文件？',
							})
							const { status, msg } = await deleteMysqlSlaveHistoryEvent({ path: row.path })
							if (status) {
								Message.success(msg)
								refresh()
							} else {
								Message.error(msg)
							}
						},
					},
				]),
			],
		})
		useDialog({
			title: '主库历史备份文件',
			area: 62,
			component: () => (
				<div class="p-[1.6rem]">
					<BtTable maxHeight="40rem"></BtTable>
				</div>
			),
		})
	}

	return {
		openHistoryBackup,
	}
}

/**
 * @description 主从状态日志
 */
export const useMasterSlaveLog = () => {
	const openMasterSlaveLog = async (row: any, isOpenLog: boolean = false) => {
		let logsTemplate = ref()
		if (isOpenLog && row.config_status === 'done') {
			const { data } = await getMysqlSlaveInfo({ slave_ip: row.slave_ip })
			logsTemplate.value = data
		} else {
			if (!isNil(row.error_msg)) {
				logsTemplate.value = row.error_msg
			} else {
				row.config_status !== 'done' && Message.error('主从配置未完成，请先完成主从配置：操作 - 同步中')
				return
			}
		}
		const loading = Message.load('正在获取日志信息，请稍后...')
		useDialog({
			title: '从库状态日志',
			area: 60,
			component: () => (
				<div class="p-[1.6rem] max-h-[60rem] overflow-y-auto">
					<div class="mb-[1.6rem]">从库地址: {row.slave_ip}</div>
					<ElDescriptions column={1} border>
						{Object.entries(logsTemplate.value).map(([key, value]) => (
							<ElDescriptionsItem label={key}>{String(value)}</ElDescriptionsItem>
						))}
					</ElDescriptions>
				</div>
			),
		})
		loading?.close()
	}
	return {
		openMasterSlaveLog,
	}
}

export const openStepHandler = (slave_ip: string) => {
	useDialog({
		title: '同步进度',
		area: [60, 'auto'],
		component: () => import('@node/views/master/master-step/index.vue'),
		compData: {
			slave_ip,
		},
	})
}
