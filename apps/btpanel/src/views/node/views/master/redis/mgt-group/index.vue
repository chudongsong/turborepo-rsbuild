<template>
	<div class="p-[2rem] redis-mgt-group-page">
		<div>
			<BtForm />
		</div>
	</div>
</template>

<script lang="tsx" setup>
import { useForm } from '@/hooks/tools'
import { FormItemCustom } from '@form/form-item'
import { formatPercent } from '../useController'
import { handleNodeDetail } from '../useController'
import { addSlaveNode, removeSlaveNode, handleNodeRestart } from './useController'
import { useMasterRedisStore } from '../useStore'
import { isNil } from 'ramda'

const { redisGroupDetail, slaveListLoad } = useMasterRedisStore()

const infoList = computed(() => {
	const masterDetailData = redisGroupDetail.value?.master_detail?.data || {}
	const memory = masterDetailData.memory || {}
	const performance = masterDetailData.performance || {}
	const loading = <span class="text-tertiary">...</span>
	return [
		{ label: '节点地址', value: masterDetailData.address ?? loading },
		{ label: 'Redis版本', value: masterDetailData.redis_version ?? loading },
		{ label: '运行天数', value: !isNil(masterDetailData.uptime_days) ? masterDetailData.uptime_days + '天' : loading },
		{
			label: '内存使用',
			value: memory.used_memory_human ?? loading,
		},
		{ label: '当前QPS', value: performance.qps ?? loading },
		{ label: '连接数', value: masterDetailData.connected_slaves ?? loading },
	]
})
const { BtForm } = useForm({
	data: redisGroupDetail.value,
	options: (formData: any) => {
		return computed(() => [
			FormItemCustom(
				'',
				() => (
					<div class="w-full mb-[32px]">
						<div class="flex items-center mb-[20px]">
							<span class="text-base mr-[1rem]">基本信息</span>
							<el-button disabled={slaveListLoad.value} type="default" class="!h-[28px] !text-small" onClick={() => handleNodeDetail(redisGroupDetail, 'master')}>
								查看详细信息
							</el-button>
						</div>
						<div class="grid grid-cols-2 gap-x-[24px] gap-y-[12px] text-secondary">
							{infoList.value.map((item: any) => (
								<div class="flex justify-between items-center bg-lighter rounded-medium px-[16px] py-[8px]">
									<span class="font-bold w-[90px] flex-shrink-0">{item.label}</span>
									<span class="flex-1 text-right">{item.value}</span>
								</div>
							))}
						</div>
					</div>
				),
				'base_info'
			),
			FormItemCustom(
				'',
				() => (
					<div class="w-full">
						<div class="flex items-center mb-[12px]">
							<span class="text-base">从节点列表</span>
							<el-button type="primary" class="ml-auto !h-[28px] !px-[12px] !text-small" onClick={() => addSlaveNode(redisGroupDetail.value)}>
								添加从节点
							</el-button>
						</div>
						<el-table v-bt-loading={slaveListLoad.value} data={redisGroupDetail.value.slave_details} table-layout="auto" height={redisGroupDetail.value.slave_details?.length > 10 ? '40rem' : 'auto'} class="w-full">
							<el-table-column prop="server_ip" label="地址" min-width="140">
								{{
									default: ({ row }: any) => <span class="text-small">{row.data.server_ip}</span>,
								}}
							</el-table-column>
							<el-table-column prop="status" label="状态" width="80">
								{{
									default: ({ row }: any) =>
										row.data.status === 'online' ? (
											<span class="bg-[var(--el-color-success-light-8)] text-primary px-[8px] py-[2px] rounded">在线</span>
										) : (
											<span class="bg-light text-danger cursor-pointer px-[8px] py-[2px] rounded">
												离线
												<el-tooltip content={row.data.replication.error} placement="top">
													<span class="ml-4px bt-ico-ask">?</span>
												</el-tooltip>
											</span>
										),
								}}
							</el-table-column>
							<el-table-column prop="health_score" label="健康度" width="80">
								{{
									default: ({ row }: any) => {
										const percent = row.data.health_score || 0
										const isOnline = row.data.status === 'online'
										const bg = isOnline ? 'var(--el-color-primary)' : 'var(--el-color-danger)'
										return (
											<span
												style={{
													display: 'inline-flex',
													alignItems: 'center',
												}}>
												<span
													style={{
														display: 'inline-flex',
														justifyContent: 'center',
														alignItems: 'center',
														width: '40px',
														height: '40px',
														borderRadius: '50%',
														background: bg,
														color: 'var(--el-color-white)',
														fontWeight: 700,
														fontSize: '12px',
														marginRight: '4px',
														transition: 'background 0.2s',
													}}>
													{percent}%
												</span>
											</span>
										)
									},
								}}
							</el-table-column>
							<el-table-column prop="memory" label="内存" width="60">
								{{
									default: ({ row }: any) => formatPercent(row.data.memory.usage_percent),
								}}
							</el-table-column>
							<el-table-column prop="qps" label="QPS" width="80">
								{{
									default: ({ row }: any) => row.data.performance.qps || '--',
								}}
							</el-table-column>
							<el-table-column prop="lag" label="延迟（秒）" width="80">
								{{
									default: ({ row }: any) => row.data.replication.lag || '--',
								}}
							</el-table-column>
							<el-table-column prop="delay" label="偏移量" width="80">
								{{
									default: ({ row }: any) => row.data.replication.repl_offset || '--',
								}}
							</el-table-column>
							<el-table-column align="right" label="操作" width="140">
								{{
									default: ({ $index, row }: any) => (
										<div class="flex items-center justify-end">
											{row.data.status === 'offline' && (
												<span>
													<span class="bt-link" onClick={() => handleNodeRestart(row, slaveListLoad)}>
														重启
													</span>
													<el-divider direction="vertical"></el-divider>
												</span>
											)}
											<span class="bt-link" onClick={() => handleNodeDetail(row, 'slave')}>
												详情
											</span>
											{row.data.status === 'online' && (
												<span>
													<el-divider direction="vertical"></el-divider>
													<span class="bt-link" onClick={() => removeSlaveNode(row, slaveListLoad)}>
														移除
													</span>
												</span>
											)}
										</div>
									),
								}}
							</el-table-column>
						</el-table>
					</div>
				),
				'slave_table'
			),
		])
	},
})
onUnmounted(() => {
	redisGroupDetail.value = {}
	slaveListLoad.value = true
})
</script>

<style lang="scss" scoped>
.redis-mgt-group-page :deep(.el-descriptions__table) {
	border-spacing: 0 12px; /* 行间距12px，列间距0 */
}
.redis-mgt-group-page :deep(.el-descriptions__cell) {
	background: var(--el-fill-color-lighter) !important;
	border-radius: var(--el-border-radius-medium);
	padding: 8px 16px;
}
.redis-mgt-group-page :deep(.bt-ico-ask) {
	width: 14px;
	height: 14px;
	line-height: 12px;
	font-size: var(--el-font-size-extra-small);
	color: var(--el-color-danger);
	border: 1px solid var(--el-color-danger);
	&:hover {
		background-color: transparent !important;
	}
}
.redis-mgt-group-page :deep(.el-table__body) {
	&::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		height: 1px;
		z-index: 1000;
		background-color: var(--el-fill-color-dark) !important;
	}
}
</style>
