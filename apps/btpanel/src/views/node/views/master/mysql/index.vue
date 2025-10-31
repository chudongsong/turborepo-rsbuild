<template>
	<div>
		<bt-table-group>
			<template #header-left>
				<BtOperation />
			</template>
			<template #header-right>
					<BtSearch class="mr-[10px]" placeholder="请输入地址" :class="`!w-[210px]`" />
					<BtRefresh />
			</template>
			<template #content>
				<BtTable/>
			</template>
			<template #footer-left>
				<BtBatch />
			</template>
			<template #footer-right>
				<BtPage />
			</template>
		</bt-table-group>
		<bt-help class="mt-[1rem]" :options="[{content: '如从库面板连接异常(从库面板停止，密钥变更)，将无法正常获取读写/同步状态'}]"></bt-help>
	</div>
</template>

<script lang="tsx" setup>
import { useAllTable, useBatch, useOperation, useRefreshList, Message } from '@/hooks/tools'
import { useCheckbox, useOperate } from '@/hooks/tools/table/column'
import { useGlobalStore } from '@/store/global'
import { deleteDatabase, openAddDatabaseView, openSettingView, useHistoryBackup, setMysqlSlave, openStepHandler } from './useController'
import { useMasterMysqlStore } from './useStore'
import { getSlaveList } from '@/api/node'
const { mainHeight } = useGlobalStore()
const { isRefreshList,multDeleteMysqlSlaveEvent } = useMasterMysqlStore()

const { BtOperation } = useOperation({
	options: [
		{
			type: 'button',
			label: '添加主从',
			active: true,
			onClick: openAddDatabaseView,
		},
		{
			type: 'button',
			label: '历史备份',
			active: false,
			onClick: () => {
				const { openHistoryBackup } = useHistoryBackup()
				openHistoryBackup()
			},
		},
	],
})

/**
 * @description 批量操作
 */
const useTableBatch = useBatch([
	{
		label: '删除',
		value: 'delete',
		event: multDeleteMysqlSlaveEvent,
	},
])

/**
 * @description 自定义状态
 */
const useCustomStatus = (config: any) => {
	return {
		label: config.label,
		prop: config.prop,
		render: (row: any) => {
			const status = typeof config.status === 'function' ? config.status(row) : row[config.prop]
			return config.render ? config.render(row) : (
				<span class={`bt-link ${config.onClick ? 'cursor-pointer' : ''} ${config.class ? config.class(row) : ''}`} style={{ color: status.type === 'success' ? 'var(--el-color-primary)' : '#ef0808' }} onClick={() => {
					config.onClick?.(row)
				}}>
					{status.text}
				</span>
			)
		},
	}
}

const { BtTable, BtSearch, BtRefresh, BtPage, BtColumn, BtBatch, refresh } = useAllTable({
	request: async (params: any) => {
		const { data } = await getSlaveList(params)
		if (data.msg && data.status === false) Message.error(data.msg)
		return {
			data: data.data,
			total: 0,
			search: {},
		}
	},
	columns: [
		useCheckbox({ key: 'slave_ip' }),
		{
			label: '从库地址',
			prop: 'slave_ip',
			minWidth: 220,
		},
		{
			label: '同步中的数据库', // 路径
			prop: 'db_name',
			render: (row: any) => {
				return row.db_name
			},
		},
		useCustomStatus({
			label: '读写状态',
			prop: 'io_status',
			status: (row: any) => {
				return {
					type: row.io_status === 'Yes' && row.config_status === 'done' ? 'success' : 'danger',
					text: row.config_status !== 'done' ? '未开始' : row.io_status === 'Yes' ? '正常' : (row.sql_status === 'api_error' ? '从库面板api连接异常' : '异常')
				}
			},
			onClick: openSettingView,
		}),
		useCustomStatus({
			label: '同步状态',
			prop: 'sql_status',
			status: (row: any) => {
				return {
					type: row.sql_status === 'Yes' && row.config_status === 'done' ? 'success' : 'danger',
					text: row.config_status !== 'done' ? '未开始' : row.sql_status === 'Yes' ? '正常' : (row.sql_status === 'api_error' ? '从库面板api连接异常' : '异常'),
				}
			},
			onClick: openSettingView,
		}),
		useCustomStatus({
			label: '是否启用',
			prop: 'run_status',
			status: (row: any) => {
				return {
					type: row.run_status === 'start' ? 'success' : 'danger',
					text: row.run_status === 'start' ? '已启用' : '已停用',
				}
			},
			onClick: setMysqlSlave,
		}),
		useOperate([
			{
				render: (row: any) => {
					const operate_title = row.config_status === 'done' ? '状态' : '同步中'
					return <span>
						<span onClick={() => row.config_status === 'done' ? openSettingView(row, true) : openStepHandler(row.slave_ip)} title={operate_title} class={'bt-link'}>
							{operate_title}
						</span>
						<div class="el-divider el-divider--vertical" role="separator" style="--el-border-style: solid;"></div>
					</span>
				},
			},
			{ title: '删除', onClick: (row: any) => deleteDatabase(row) },
		]),
	],
	extension: [useTableBatch, useRefreshList(isRefreshList)],
	empty: () => {
		return (
			<span>
				您的列表为空，您可以
				<span class="bt-link" onClick={openAddDatabaseView}>
					添加一个主从
				</span>
			</span>
		)
	},
})

onMounted(() => {
	nextTick(() => {
		import('@site/views/reverse-proxy-model/add-reverse-proxy/index.vue')
		import('@site/views/reverse-proxy-model/setting/index.vue')
	})
})
</script>

<style scoped>
:deep(.proxy-radio .el-radio-button__inner) {
	padding: 0.9rem 1.2rem !important;
}
</style>
