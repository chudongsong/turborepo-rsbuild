<template>
	<div>
		<div v-if="payment.authType === 'ltd'">
			<el-alert v-if="!backupPlan.space_free" title="当前磁盘空间不足1GB，已自动停止增量备份，如需继续请释放磁盘空间" type="warning" show-icon class="!mb-4" />
			<div class="data-show">
				<!-- 数据库信息展示模块 - 简约版 -->
				<div class="bg-lighter rounded-lg border border-light p-6 mb-4">
					<!-- 数据库基本信息 -->
					<div class="grid grid-cols-1 md:grid-cols-3 gap-6 pb-6 border-b border-light">
						<div class="text-center md:text-left">
							<div class="text-small text-secondary mb-1">数据库名称</div>
							<div class="text-medium">{{ databaseInfo.name || '--' }}</div>
						</div>
						<div class="grid grid-cols-2 col-span-2 gap-6" v-loading="getDataLoading" element-loading-text="获取中...">
							<div class="text-center md:text-left">
								<div class="text-small text-secondary mb-1">表数量</div>
								<div class="text-medium">{{ databaseInfo.tableCount || 0 }}</div>
							</div>
							<div class="text-center md:text-left">
								<div class="text-small text-secondary mb-1">数据库大小</div>
								<div class="text-medium">{{ databaseInfo.size || '--' }}</div>
							</div>
						</div>
					</div>

					<!-- 备份计划信息 -->
					<div class="pt-6 pb-3">
						<div class="flex items-center justify-between">
							<div class="flex items-center space-x-8">
								<h3 class="text-base font-medium text-secondary">备份计划</h3>
								<span :class="['px-3 py-1 rounded-full text-small font-medium cursor-pointer', backupPlan.enabled ? 'bg-[var(--el-color-primary-light-9)] text-primary' : 'bg-[var(--el-color-danger-light-9)] text-red-700']" @click="changeBackupPlanStatus">
									{{ getStatusText(backupPlan.enabled) }}
								</span>
							</div>
						</div>
					</div>
					<div class="pb-3">
						<div class="flex items-center space-x-4">
							<span class="text-small text-secondary">全量: {{ getFullText }}</span>
							<span class="text-gray-300">|</span>
							<span class="text-small text-secondary">增量: {{ getIncrementText }}</span>
							<el-button type="primary" class="ml-[1rem]" size="small" text @click="viewLogs"> 查看日志 </el-button>
						</div>
					</div>

					<!-- 执行时间信息 -->
					<div>
						<div class="flex items-center justify-between">
							<div class="flex items-center space-x-8">
								<div class="text-small text-secondary">最近执行时间</div>
								<div class="text-small font-medium">{{ backupPlan.last_incremental_backup || '--' }}</div>
								<div class="text-small text-secondary">下次执行时间</div>
								<div class="text-small font-medium">{{ backupPlan.next_incremental_backup || '--' }}</div>
							</div>
							<div></div>
						</div>
					</div>
				</div>
			</div>
			<bt-table-group>
				<template #header-left>
					<div class="flex items-center gap-4">
						<el-button type="primary" @click="editBackupPlan">编辑计划 </el-button>
						<el-button type="default" @click="clearBackup">清空备份 </el-button>
					</div>
				</template>
				<template #header-right>
					<div class="flex items-center">
						<el-date-picker type="date" v-model="tableParam.time" :show-after="100" class="!w-[24rem] !h-[30px]" :disabled-date="pickerOptions.disabledDate" placeholder="请选择日期" format="YYYY-MM-DD" value-format="x" @change="refresh"> </el-date-picker>
						<el-select v-model="tableParam.type" class="rounded-none !w-[12rem] ml-[1rem]" @change="refresh">
							<el-option label="全部类型" value="all"></el-option>
							<el-option label="增量备份" value="incremental"></el-option>
							<el-option label="全量备份" value="full"></el-option>
						</el-select>
					</div>
				</template>
				<template #content>
					<BtTable :max-height="221" />
				</template>
				<template #footer-left>
					<!-- <BtBatch /> -->
				</template>
				<template #footer-right>
					<BtPage />
				</template>
				<template #popup> </template>
			</bt-table-group>
			<ul class="mt-[8px] leading-8 text-small list-disc ml-[20px]">
				<li>还原数据等操作将会被增量备份记录，导致备份大小增大</li>
				<li>建议确认数据正常后，手动备份并【清空备份】，重置为干净状态</li>
			</ul>
		</div>
		<bt-product-introduce v-else :data="productData" class="p-20px"></bt-product-introduce>
	</div>
</template>
<script lang="tsx" setup>
import { getByteUnit, copyText, formatTime } from '@utils/index'
import { useGlobalStore } from '@store/global'
import { getDatabaseStore } from '@database/useStore'
import { useCheckbox, useOperate } from '@/hooks/tools/table/column'
import { getIncrementBackupInfo, getBinlogBackupTask, getBinlogBackupFiles, deleteBinlogBackupFile, delBinlogBackupTask, getBinlogBackupLogs, restoreBinlogData, getRestoreProgress, clearBinlogBackup } from '@/api/database'
import { useAllTable, useOperation, useDataHandle, useDataPage, Message, useDialog, useConfirm, useBatch } from '@/hooks/tools'

import BtLog from '@/components/extension/bt-log/index.vue'

interface Props {
	compData?: any
	isRowBackup?: boolean // 是否为表格内备份弹窗
}

const { payment } = useGlobalStore()
const authType = computed(() => payment.value.authType)

const { refreshTableList } = getDatabaseStore()

const props = withDefaults(defineProps<Props>(), {
	compData: () => [],
	isRowBackup: false,
})

// 数据库信息
const databaseInfo = reactive({
	name: '',
	tableCount: 0,
	size: '',
})

const getDataLoading = ref(false)

// 备份计划信息
const backupPlan = reactive({
	database_name: 'test_db', // 数据库名称
	full_backup_schedule: {
		// 全量备份调度配置
		type: 'daily',
		time: '02:30:00',
		weekday: 0,
		interval_days: 0,
		interval_hours: 0,
	},
	incremental_backup_interval: 30, // 增量备份间隔(分钟)
	enabled: true, // 是否启用
	create_time: '', // 创建时间
	last_full_backup: '', // 最后全量备份时间
	last_incremental_backup: '', // 最后增量备份时间
	next_full_backup: '', // 下次全量备份时间
	next_incremental_backup: '', // 下次增量备份时间
	space_free: true, // 磁盘是否有空间
})

const tableParam = reactive({
	time: '',
	type: 'all',
}) // 表格接口请求

const pickerOptions = reactive({
	disabledDate: (time: Date) => {
		// return time.getTime() > Date.now()
		// 获取当前日期
		const today = new Date()
		// 将时间设置为23:59:59
		today.setHours(23, 59, 59, 999)
		// 获取时间戳
		const timestamp = today.getTime()
		// 禁用的时间
		return time.getTime() > timestamp
	},
	defaultTime: [new Date(), new Date()] as [Date, Date],
})
const productData = {
	title: '企业增量备份',
	ps: '企业增量备份只定时备份发生变化新增、修改、删除文件和数据，不会每次都备份所有数据',
	source: 54,
	desc: [],
	tabImgs: [
		{
			title: '概览',
			imgSrc: 'https://www.bt.cn/Public/new/plugin/introduce/database/database_enterprise_backup.png',
		},
	],
}
const weekObj = {
	0: '周日',
	1: '周一',
	2: '周二',
	3: '周三',
	4: '周四',
	5: '周五',
	6: '周六',
}
const getFullText = computed(() => {
	if (!backupPlan.database_name) return '--'
	switch (backupPlan.full_backup_schedule.type) {
		case 'daily':
			return `每天 ${backupPlan.full_backup_schedule.time} 备份`
		case 'weekly':
			return `每周 ${weekObj[backupPlan.full_backup_schedule.weekday as keyof typeof weekObj]} ${backupPlan.full_backup_schedule.time} 备份`
		case 'interval':
			return `每隔 ${backupPlan.full_backup_schedule.interval_days} 天后 ${backupPlan.full_backup_schedule.time} 备份`
		case 'hours':
			return `每隔 ${backupPlan.full_backup_schedule.interval_hours} 小时 ${backupPlan.full_backup_schedule.time || ''} 备份`
	}
})

const getIncrementText = computed(() => {
	if (!backupPlan.database_name) return '--'
	return backupPlan.incremental_backup_interval > 60 ? `每 ${Math.floor(backupPlan.incremental_backup_interval / 60)}小时${backupPlan.incremental_backup_interval % 60}分钟备份` : `每 ${backupPlan.incremental_backup_interval} 分钟备份`
})

/**
 * @description: 获取状态文本
 * @param status 状态值
 */
const getStatusText = (status: boolean) => {
	return status ? '运行中' : '已停止'
}

/**
 * @description: 编辑备份计划
 */
const editBackupPlan = async () => {
	useDialog({
		title: '配置备份计划',
		area: 85,
		component: () => import('./add-increment.vue'),
		showFooter: true,
		compData: {
			...props.compData,
			backupPlan,
			refreshEvent: () => {
				getBackupPlanInfo()
			},
		},
	})
}

const changeBackupPlanStatus = async () => {
	if (backupPlan.enabled) {
		await useConfirm({
			title: '停止备份计划',
			content: `确定停止数据库【${backupPlan.database_name}】增量备份计划吗？停止后将无法进行增量备份`,
		})
		await useDataHandle({
			loading: '停止备份计划中...',
			message: true,
			request: delBinlogBackupTask({ id: props.compData.id }),
		})
		getBackupPlanInfo()
	} else {
		editBackupPlan()
	}
}
/**
 * @description: 查看日志
 */
const viewLogs = () => {
	// 更新日志
	useDialog({
		title: '备份日志',
		area: 56,
		btns: false,
		component: defineComponent({
			setup: () => {
				const logContent = ref('')
				useDataHandle({
					loading: '获取日志中...',
					request: getBinlogBackupLogs({ id: props.compData.id }),
					success: (res: any) => {
						if (!res.data.status) {
							return Message.error(res.data.msg)
						}
						logContent.value = res.data.data.join('\n')
					},
				})
				return () => h('div', { class: 'overflow-y-auto' }, h(BtLog, { class: '!h-[40rem]', content: logContent.value, isHtml: true }))
			},
		}),
	})
}

/**
 * @description: 删除备份
 */
const deleteBackup = async (backup_id: string) => {
	await useConfirm({
		title: '删除备份',
		content: '确定删除该备份吗？删除后将无法恢复!',
	})
	await useDataHandle({
		loading: '删除备份中...',
		message: true,
		request: deleteBinlogBackupFile({ backup_id }),
	})
	refresh()
}

const clearBackup = async () => {
	await useConfirm({
		title: '清空备份',
		content: `当前将清空【${props.compData.name}】下通过备份计划备份的全量与增量备份（不会清除手动备份），请确保当前数据已正常，再清空备份`,
		type: 'calc',
	})
	await useDataHandle({
		loading: '清空备份中...',
		message: true,
		request: clearBinlogBackup({ id: props.compData.id }),
	})
	refresh()
}

/**
 * @description: 下载备份
 */
const downloadBackup = async (backup_id: string) => {
	window.open('/download?filename=' + backup_id, '_blank')
}

/**
 * @description: 还原备份
 */
const restoreBackup = async (row: any) => {
	await useConfirm({
		title: `还原备份【${row.backup_time}】`,
		content: '此操作将覆盖当前数据库的所有数据，请确保已经备份现有数据！',
		type: 'calc',
	})
	const res = await useDataHandle({
		loading: '还原备份中...',
		request: restoreBinlogData({ id: props.compData.id, restore_time: row.backup_time }),
	})
	if (!res.data.status) {
		return Message.error(res.data.msg)
	} else {
		useDialog({
			title: '还原进度',
			area: 56,
			btns: false,
			component: defineComponent({
				setup: (_, { emit }) => {
					type ProgressStatus = 'preparing' | 'analyzing' | 'restoring' | 'finalizing' | 'completed' | 'failed' | 'not_found'

					const progressData = reactive({
						status: 'preparing' as ProgressStatus,
						progress: 0,
						message: '准备还原数据...',
						restore_time: '',
						start_time: '',
						update_time: '',
						error: null as string | null,
						backup_files: [] as string[],
					})

					const timer = ref<NodeJS.Timeout | null>(null)
					const isActive = ref(true)

					// 状态映射
					const statusConfig: Record<ProgressStatus, { text: string; color: string; progress: number }> = {
						preparing: { text: '准备还原数据', color: '#20a53a', progress: 0 },
						analyzing: { text: '分析备份文件', color: '#20a53a', progress: 10 },
						restoring: { text: '正在还原数据', color: '#20a53a', progress: 20 },
						finalizing: { text: '完成还原操作', color: '#20a53a', progress: 90 },
						completed: { text: '还原完成', color: '#20a53a', progress: 100 },
						failed: { text: '还原失败', color: '#f56c6c', progress: 0 },
						not_found: { text: '任务不存在', color: '#e6a23c', progress: 0 },
					}

					// 获取进度
					const getProgress = async () => {
						if (!isActive.value) return

						try {
							const response = await useDataHandle({
								request: getRestoreProgress({ task_id: res.data.data.task_id }),
							})

							if (response?.data?.status) {
								const data = response.data.data

								progressData.status = data.status || 'preparing'
								progressData.message = data.message || statusConfig[progressData.status]?.text || '处理中...'
								progressData.restore_time = data.restore_time || ''
								progressData.start_time = data.start_time || ''
								progressData.update_time = data.update_time || ''
								progressData.backup_files = data.backup_files || []
								progressData.error = data.error || null

								// 根据状态设置进度
								if (data.progress !== undefined) {
									progressData.progress = Math.min(Math.max(data.progress, 0), 100)
								} else {
									progressData.progress = statusConfig[progressData.status]?.progress || 0
								}

								// 检查是否需要继续轮询
								const isFinished = ['completed', 'failed', 'not_found'].includes(progressData.status)

								if (!isFinished && isActive.value) {
									timer.value = setTimeout(getProgress, 1500)
								} else if (isFinished) {
									// 任务完成处理
									if (progressData.status === 'completed') {
										Message.success('数据库还原成功')
										// 刷新表格数据
										refresh()
									} else if (progressData.status === 'failed') {
										Message.error(progressData.error || '还原失败，请查看错误信息')
									}
									isActive.value = false
								}
							} else {
								progressData.status = 'failed'
								progressData.message = response?.data?.msg || '获取进度失败'
								progressData.error = response?.data?.error_msg || '未知错误'
								isActive.value = false
							}
						} catch (error) {
							console.error('获取还原进度失败:', error)
							progressData.status = 'failed'
							progressData.message = '获取进度失败，请检查网络连接'
							progressData.error = '网络连接异常'
							isActive.value = false
						}
					}

					// 清理定时器
					const cleanup = () => {
						if (timer.value) {
							clearTimeout(timer.value)
							timer.value = null
						}
						isActive.value = false
					}

					// 立即开始获取进度
					getProgress()

					// 组件卸载时清理
					onUnmounted(cleanup)

					return () => (
						<div class="p-[2rem]">
							{/* 标题和状态图标 */}
							<div class="flex items-center mb-[2rem]">
								<i class={['!text-[3rem] mr-[1rem]', progressData.status === 'completed' ? 'svgtofont-el-success-filled text-primary' : progressData.status === 'failed' ? 'svgtofont-el-circle-close-filled text-danger' : 'svgtofont-el-loading animate-spin text-primary']} />
								<div class="flex-1">
									<div class="text-medium font-medium mb-[4px]">{progressData.status === 'completed' ? '还原成功' : progressData.status === 'failed' ? '还原失败' : '正在还原数据库'}</div>
									<div class="text-small text-secondary">数据库：{props.compData.name}</div>
								</div>
							</div>

							{/* 进度条 */}
							{!['completed', 'failed'].includes(progressData.status) && (
								<div class="mb-[2rem]">
									<div class="flex justify-between items-center mb-[8px]">
										<span class="text-base">{progressData.message}</span>
										<span class="text-small text-secondary">{progressData.progress}%</span>
									</div>
									<el-progress percentage={progressData.progress} stroke-width={8} show-text={false} color={statusConfig[progressData.status]?.color || '#20a53a'} />
								</div>
							)}

							{/* 详细信息 */}
							<div class="bg-light rounded-lg p-[1.5rem] mb-[1.5rem]">
								<div class="text-base font-medium mb-[1rem] text-default">还原信息</div>
								<div class="space-y-[8px] text-small text-secondary">
									{progressData.restore_time && (
										<div class="flex">
											<span class="w-[8rem] flex-shrink-0">还原时间点：</span>
											<span>{progressData.restore_time}</span>
										</div>
									)}
									{progressData.start_time && (
										<div class="flex">
											<span class="w-[8rem] flex-shrink-0">开始时间：</span>
											<span>{progressData.start_time}</span>
										</div>
									)}
									{progressData.update_time && (
										<div class="flex">
											<span class="w-[8rem] flex-shrink-0">更新时间：</span>
											<span>{progressData.update_time}</span>
										</div>
									)}
									<div class="flex">
										<span class="w-[8rem] flex-shrink-0">当前状态：</span>
										<span class="flex items-center">
											<span class={['w-[8px] h-[8px] rounded-full mr-[6px]', progressData.status === 'completed' ? 'bg-primary' : progressData.status === 'failed' ? 'bg-[#ef0808]' : 'hidden']} />
											{statusConfig[progressData.status]?.text || progressData.message}
										</span>
									</div>
								</div>
							</div>

							{/* 备份文件列表 */}
							{progressData.backup_files && progressData.backup_files.length > 0 && (
								<div class="bg-light rounded-lg p-[1.5rem] mb-[1.5rem]">
									<div class="text-base font-medium mb-[1rem] text-default">相关备份文件 ({progressData.backup_files.length}个)</div>
									<div class="space-y-[4px] max-h-[8rem] overflow-y-auto">
										{progressData.backup_files.map((file, index) => (
											<div key={index} class="text-[1.1rem] text-secondary bg-white px-[8px] py-[4px] rounded">
												{file}
											</div>
										))}
									</div>
								</div>
							)}

							{/* 错误信息 */}
							{progressData.status === 'failed' && progressData.error && (
								<div class="bg-light border rounded-lg p-[1.5rem] mb-[1.5rem]">
									<div class="text-base font-medium mb-[1rem] text-danger flex items-center">
										<i class="svgtofont-el-warning-filled mr-[6px]" />
										错误详情
									</div>
									<div class="text-small text-secondary whitespace-pre-wrap">{progressData.error}</div>
								</div>
							)}
						</div>
					)
				},
			}),
		})
	}
}

/**
 * @description 批量操作
 */
const useTableBatch = useBatch([
	{
		label: '删除备份',
		value: 'delete',
		event: () => {},
	},
])
const { BtTable, BtPage, refresh, BtBatch } = useAllTable({
	request: async data => {
		const params = {
			id: props.compData.id,
			page: data.p,
			limit: data.limit,
			backup_type: tableParam.type,
			...(tableParam.time ? { date: formatTime(tableParam.time, 'yyyy-MM-dd') } : {}),
		}
		const { data: res }: any = await useDataHandle({
			loading: '获取备份记录中...',
			request: getBinlogBackupFiles(params),
		})
		return {
			data: res.data.list,
			total: res.data.total,
		}
	},
	columns: [
		// useCheckbox({key: 'backup_id'}),
		{ label: `备份时间`, prop: 'backup_time', showOverflowTooltip: true, minWidth: 100 },
		{
			label: `备份类型`,
			prop: 'backup_type',
			minWidth: 100,
			render: (row: any) => {
				return row.backup_type === 'incremental' ? '增量备份' : '全量备份'
			},
		},
		{ label: `备份大小`, prop: 'formatted_size', minWidth: 100 },
		useOperate([
			{ onClick: (row: any) => restoreBackup(row), title: `还原` },
			{ onClick: (row: any) => downloadBackup(row.file_path), title: `下载` },
			{ onClick: (row: any) => deleteBackup(row.backup_id), title: `删除` },
		]),
	],
	extension: [useTableBatch],
})

/**
 * @description: 获取备份计划信息
 */
const getBackupPlanInfo = async () => {
	const { data: res }: any = await useDataHandle({
		loading: '获取备份计划信息中...',
		request: getBinlogBackupTask({ id: props.compData.id }),
	})
	if (res.status) {
		backupPlan.database_name = res.data.database_name
		backupPlan.full_backup_schedule = res.data.full_backup_schedule
		backupPlan.incremental_backup_interval = res.data.incremental_backup_interval
		backupPlan.enabled = res.data.enabled
		backupPlan.create_time = res.data.create_time
		backupPlan.last_full_backup = res.data.last_full_backup
		backupPlan.last_incremental_backup = res.data.last_incremental_backup
		backupPlan.next_full_backup = res.data.next_full_backup
		backupPlan.next_incremental_backup = res.data.next_incremental_backup
		backupPlan.space_free = res.data.space_free
	} else {
		backupPlan.database_name = ''
	}
}

// 初始化
const init = async () => {
	// 当为表格内备份弹窗时，赋值db_name为数据库名
	databaseInfo.name = props.compData.name
	// 获取备份计划信息
	getBackupPlanInfo()
	// 获取数据库数据
	const { data: res }: any = await useDataHandle({
		loading: getDataLoading,
		request: getIncrementBackupInfo({ id: props.compData.id }),
	})
	if (res.status) {
		// 更新数据库信息
		databaseInfo.tableCount = res.data.table_count || 0
		databaseInfo.size = getByteUnit(res.data.db_size) || '--'
	}
}

onMounted(init)
defineExpose({
	init,
})
</script>
