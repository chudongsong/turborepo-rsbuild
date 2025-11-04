<template>
	<div>
		<div v-if="payment.authType === 'ltd'">
			<bt-table-group>
				<template #header-left>
					<div class="flex items-center">
						<el-button type="primary" @click="openIncrementFormView()" :disabled="selectLoading"
							>添加备份任务
							<i class="ml-4px svgtofont-el-loading animate-spin" v-if="selectLoading"></i>
						</el-button>
						<bt-removed-tips class="!ml-[1rem]" style="margin-bottom: 0 !important" />
					</div>
				</template>
				<template #header-right>
					<div class="flex items-center">
						<span class="h-[3rem] bg-[#e8e8e8] leading-[3rem] text-center w-[6rem] inline-block">数据库</span>
						<el-select @change="getDatabaseBack" v-model="tableParam.db_name" class="rounded-none !w-[12rem]">
							<el-option label="全部" value="all"></el-option>
							<el-option v-for="(item, index) in selectOptions" :key="index" :label="item.name" :value="item.name"
						/></el-select>
					</div>
				</template>
				<template #content>
					<bt-table ref="incrementBackupTable" :max-height="420" :data="incrementTableData" :column="inBackTableColumn" v-bt-loading="tableLoad" v-bt-loading:title="'正在加载列表，请稍后...'" />
				</template>
				<template #footer-right>
					<bt-table-page v-model:page="tableParam.p" v-model:row="tableParam.limit" @change="getDatabaseBack" :total="inCompletedTotal"></bt-table-page>
				</template>
				<template #popup>
					<bt-dialog title="查看日志" v-model="logPopup" :area="[76]">
						<div class="p-20px">
							<div class="mb-10px">
								<el-button type="primary" @click="logEvent(rowData, true)">刷新日志</el-button>
								<el-button @click="clearLogEvent">清空日志</el-button>
							</div>
							<bt-log
								class="!h-[46rem]"
								:content="logData"
								:fullScreen="{
									title: '全屏查看日志',
									onRefresh: () => logEvent(rowData),
								}" />
						</div>
					</bt-dialog>

					<bt-dialog title="备份记录" v-model="recordsPopup" :area="70">
						<div class="p-20px">
							<bt-table max-height="400" :column="recordColumn" :data="recordData"> </bt-table>
							<ul class="mt-8px leading-8 text-small list-disc ml-20px">
								<li class="text-danger">恢复：会从最早【全量备份】开始恢复至选择的【增量备份】时间点</li>
								<li>数据已存在的情况下，点击恢复可能会出现数据重复得情况，如需测试请备份好数据</li>
							</ul>
						</div>
					</bt-dialog>

					<bt-dialog title="导出结果" v-model="recordResults" :area="44">
						<el-result class="w-full" :icon="exportResultsData.path ? 'success' : 'error'" :title="exportResultsData.path ? '导出成功' : '导出失败'">
							<template #extra>
								<div class="items-center justify-center !w-[40rem] text-secondary inline-flex flex-col">
									<span>{{ exportResultsData.name }}</span>
									<div>
										<el-button type="text" @click="copyResult(exportResultsData.name, $event)"> 复制 </el-button>
										<el-button class="!ml-4px" type="text" @click="downLoadData">下载</el-button>
									</div>
								</div>
							</template>
						</el-result>
					</bt-dialog>
				</template>
			</bt-table-group>
			<ul class="mt-[8px] leading-8 text-small list-disc ml-[20px]">
				<li>如需恢复记录请点击记录，进入备份记录清单查看</li>
				<li>备份大小：备份大小包含完全备份数据大小和增量备份数据大小</li>
				<li>备份会保留一个星期的备份数据，当备份时，检测到完全备份为一个星期前，会重新完全备份</li>
				<li>请勿同一时间添加多个备份任务，否则可能因同一时间执行多个备份任务导致文件句柄数打开过多或者爆内存</li>
			</ul>
		</div>
		<bt-product-introduce v-else :data="productData" class="p-20px"></bt-product-introduce>
	</div>
</template>
<script lang="tsx" setup>
import type { InBackTableProps } from '@database/types'

import { getByteUnit, copyText } from '@utils/index'
import { useGlobalStore } from '@store/global'
import { getDatabaseStore } from '@database/useStore'
import { useDialog } from '@hooks/tools'
import { Message } from '@hooks/tools'
import { useConfirm } from '@hooks/tools'
import { useOperate } from '@/hooks/tools/table/column'
import { clearIncrementLog, delIncrementData, getBinlogStatus, getDatabaseOptions, getIncrementBackData, getIncrementLogs, getIncrementRecord, outRecord, restoreRecord, startIncrementTask } from '@/api/database'
import { useDataHandle, useDataPage } from '@hooks/tools'

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

const rowData = ref() // 表格行数据
const tableLoad = ref<boolean>(false) // 表格加载状态

const logPopup = ref(false) // 日志弹窗
const logData = ref<string>('暂无数据') // 日志数据

const recordResults = ref(false) // 记录结果弹窗
const exportResultsData = ref({
	name: '',
	size: '',
	path: '',
}) // 导出结果数据

const incrementTableData = ref([]) // 增量表格数据
const inCompletedTotal = ref(0) //增量备份总条数

const recordsPopup = ref(false) // 记录弹窗
const recordData = ref([]) // 记录表格数据

const tableParam = reactive({
	p: 1,
	limit: 10,
	db_name: 'all',
}) // 表格接口请求

const selectLoading = ref(false) // 选择框加载状态
const selectOptions = ref<Array<{ name: string; value?: string }>>([]) // 选择框选项

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

/**
 * @description 打开增量备份表单弹窗
 */
const openIncrementFormView = (data?: InBackTableProps) => {
	useDialog({
		title: '添加备份任务',
		area: 64,
		component: () => import('@database/public/backup/increment-back/add-increment.vue'),
		compData: {
			rowData: data, // 表格行数据 用于编辑
			selectOptions: selectOptions.value, // 选择框选项-数据库信息
			rowDatabaseName: props.isRowBackup ? props.compData.name : false, // 是否为表格内备份弹窗
			refreshEvent: getDatabaseBack, // 刷新表格事件
		},
		showFooter: true,
	})
}

/**
 * @description 操作事件-执行
 * @param {InBackTableProps} row 类型
 */
const executeEvent = async (row: InBackTableProps) => {
	if (row.cron_id === 0 || row.cron_id.length === 0) {
		return Message.error('备份计划任务丢失，无法执行')
	}
	await useDataHandle({
		request: startIncrementTask({ id: row.cron_id }),
		loading: '正在执行任务，请稍后...',
		message: true,
	})
	getDatabaseBack()
	refreshTableList() // 刷新外部表格
}

/**
 * @description 操作 编辑
 * @param {InBackTableProps} row 类型
 */
const editEvent = (row: InBackTableProps) => {
	if (row.cron_id === 0 || row.cron_id.length === 0) {
		return Message.error('备份计划任务丢失，无法编辑')
	}
	openIncrementFormView(row)
}

/**
 * @description 操作事件- 日志
 * @param {InBackTableProps} row 类型
 */
const logEvent = async (row: InBackTableProps, isRefresh: boolean = false) => {
	if (row.cron_id === 0 || row.cron_id.length === 0) {
		return Message.error('备份计划任务丢失，无法查看日志')
	}
	rowData.value = row
	await useDataHandle({
		request: getIncrementLogs({ id: row.cron_id }),
		data: {
			msg: [String, logData],
		},
	})
	logPopup.value = true
	if (isRefresh) Message.success('刷新成功')
}

/**
 * @description 日志操作-清空日志
 */
const clearLogEvent = async () => {
	await useConfirm({
		title: '提示',
		content: '确定清空日志吗？',
		icon: 'warning-filled',
	})
	await useDataHandle({
		request: clearIncrementLog({ id: rowData.value.cron_id }),
		loading: '正在清空日志，请稍后...',
		message: true,
	})
	logEvent(rowData.value)
}

/**
 * @description 操作 删除
 * @param {InBackTableProps} row 类型
 */
const delInBackEvent = async (row: InBackTableProps) => {
	await useConfirm({
		title: '删除备份任务' + row.name,
		content: '删除备份任务后，备份数据将永久消失，是否继续操作？',
		input: { content: '删除备份任务' },
		type: 'input',
		icon: 'warning-filled',
	})
	await useDataHandle({
		request: delIncrementData({ id: row.cron_id }),
		loading: '正在删除任务，请稍后...',
		message: true,
	})
	getDatabaseBack()
}

/**
 * @description 恢复备份记录
 * @param row
 */
const restoreRecordEvent = async (row: any) => {
	await useConfirm({
		title: '恢复数据',
		content: '恢复后会覆盖当前数据库数据，此操作不可逆，是否继续操作？',
		icon: 'warning-filled',
		type: 'input',
		input: { content: '我已知晓' },
	})
	await useDataHandle({
		loading: '正在恢复数据，请稍后...',
		request: restoreRecord({ cron_id: row.cron_id, node_time: row.addtime }),
		// data: { data: [Array, recordData] },
		message: true,
	})
}

/**
 * @description 操作 记录
 * @param {InBackTableProps} row 类型
 */
const recordsEvent = async (row: InBackTableProps) => {
	await useDataHandle({
		request: getIncrementRecord({ cron_id: row.cron_id }),
		data: { data: [Array, recordData] },
	})
	recordsPopup.value = true
}

/**
 * @description 导出备份记录
 * @param row
 */
const outPutRecordEvent = async (row: any) => {
	await useDataHandle({
		request: outRecord({ cron_id: row.cron_id, node_time: row.addtime }),
		data: {
			data: [Object, exportResultsData],
		},
	})
	recordResults.value = true
}

/**
 * @description 复制导出结果
 */
const copyResult = (value: string, event: any) => copyText({ value })

/**
 * @description 下载导出结果
 */
const downLoadData = async () => {
	window.open('/download?filename=' + exportResultsData.value.path)
}

const inBackTableColumn = [
	{
		prop: 'db_name',
		label: '数据库名',
	},
	{
		prop: 'tb_name',
		label: '表名',
	},
	{
		prop: 'full_size',
		label: '备份大小',
	},
	{
		prop: 'last_backup_time',
		label: '备份时间',
		render: (row: any) => row.last_backup_time || '--',
	},
	useOperate([
		{ onClick: executeEvent, title: '执行' },
		{ onClick: editEvent, title: '编辑' },
		{ onClick: (row: any) => logEvent(row, false), title: '日志' },
		{ onClick: recordsEvent, title: '记录' },
		{ onClick: delInBackEvent, title: '删除' },
	]),
]

const recordColumn = [
	{
		label: '备份名称',
		prop: 'name',
		width: 220,
	},
	{
		label: '备份大小',
		render: (row: any) => getByteUnit(row.size),
	},
	{
		label: '类型',
		prop: 'type',
		render: (row: any) => (row.type === 1 ? '全量' : '增量'),
	},
	{
		label: '时间点',
		prop: 'addtime',
		width: 180,
	},
	useOperate([
		{ onClick: restoreRecordEvent, title: '恢复' },
		{ onClick: outPutRecordEvent, title: '导出' },
	]),
] // 记录表格配置

/**
 * @description 获取binlog状态 二进制日志
 */
const getBingLogStatusEvent = async () => {
	const res = await useDataHandle({
		request: getBinlogStatus(),
	})
	if (!res.status) Message.error(res.msg)
}

/**
 * @description 获取增量备份数据库数据
 */
const getDatabaseBack = async () => {
	await useDataHandle({
		request: getIncrementBackData({
			...tableParam,
			db_name: tableParam.db_name == 'all' ? '' : tableParam.db_name,
		}),
		loading: tableLoad,
		data: {
			data: [Array, incrementTableData],
			page: useDataPage(inCompletedTotal),
		},
	})
}

// 初始化
const init = async () => {
	// 当为表格内备份弹窗时，赋值db_name为数据库名
	if (props.isRowBackup) tableParam.db_name = props.compData.name

	// 获取数据库选项
	await useDataHandle({
		loading: selectLoading,
		request: getDatabaseOptions(),
		data: { data: [Array, selectOptions] },
	})
	getDatabaseBack()
}

onMounted(init)
defineExpose({
	init,
})
</script>
