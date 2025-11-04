<template>
	<div class="p-2rem">
		<bt-table-group>
			<template #header-left>
				<el-button @click="getMonitorData(true)" type="default">刷新数据</el-button>
			</template>
			<template #content>
				<bt-table :column="tableColumns" :data="tableData" row-key="id" v-bt-loading="tableLoading" :max-height="500" :tree-props="{ children: 'data' }" />
			</template>

			<template #footer-left>
				<ul class="mt-8px leading-8 text-small list-disc ml-20px">
					<li>如果pm2项目无法加载监控信息，可修改node命令行版本号再试</li>
				</ul>
			</template>
			<template #popup>
				<bt-dialog title="日志展示" v-model="logViewPopup" :area="[60]">
					<!-- :refresh="getLog" -->
					<div class="p-2rem">
						<el-button :loading="logLoading" type="primary" @click="openLogView(rowData, currentType)">刷新日志</el-button>
						<bt-log v-bt-loading="logLoading" :title="`全屏查看日志`" class="h-[40rem] mt-12px" :content="logViewData"></bt-log>
					</div>
				</bt-dialog>

				<bt-dialog :title="`详情展示【${rowData.name}】`" v-model="messageDetailPopup" :area="70">
					<div class="p-2rem w-full relative">
						<el-descriptions :column="1" border class="max-h-[46rem] w-full overflow-auto table-descriptions">
							<el-descriptions-item v-for="(item, index) in Object.entries(detailData)" :key="index">
								<template #label>{{ item[0] }}</template>
								<span :title="String(JSON.stringify(item[1]))" class="w-340px truncate inline-block"> {{ item[1] }}</span>
							</el-descriptions-item>
						</el-descriptions>
					</div>
				</bt-dialog>
			</template>
		</bt-table-group>
	</div>
</template>

<script setup lang="tsx">
import { useConfirm } from '@/hooks/tools'
import { useDataHandle } from '@/hooks/tools'
import { useMessage } from '@/hooks/tools'
import { useOperate } from '@/hooks/tools/table/column'
import { formatTime, getByteUnit, isNumber, isString } from '@/utils'
import { getPM2Logs, getPM2Monit, setPM2Status } from '@api/site'

const Message = useMessage() // 消息提示

const tableData = ref([]) // 响应式数据
const tableLoading = ref(false) // 响应式数据

const logViewPopup = ref(false) // 日志查看弹窗
const logViewData = ref('') // 日志数据
const logLoading = ref(false) // 日志加载中

const rowData = ref<any>({}) // 行数据
const detailData = ref({}) // 详情数据
const currentType = ref('') // 当前类型

const messageDetailPopup = ref(false) // 详情弹窗

/**
 * @description 获取监控数据
 */
const getMonitorData = async (isRefresh: boolean = false) => {
	const res: any = await useDataHandle({
		loading: tableLoading,
		request: getPM2Monit(),
		data: {
			data: [
				Array,
				data =>
					data.map((item: any) => {
						item.id = item.id ?? item.name + '(集群)'
						return item
					}),
			],
		},
	})
	tableData.value = res.data
	if (isRefresh) Message.success('刷新成功')
}

/**
 * @description 打开日志查看弹窗
 */
const openLogView = async (row: any, type: string) => {
	try {
		logLoading.value = true
		let params: any = {
			mode: row.mode,
			log_type: type,
		}
		if (isNumber(row.id)) params.id = row.id
		else params.name = row.name
		// 请求日志
		const { data: res } = await getPM2Logs(params)
		logViewData.value = res.data
	} catch (error) {
		console.log(error)
	} finally {
		logLoading.value = false
	}
}

/**
 * @description 打开集群详情
 */
const openClusterDetail = (row: any) => {
	rowData.value = row
	detailData.value = row.pm2_env
	messageDetailPopup.value = true
}

/**
 * @description 修改集群状态
 */
const changeClusterState = async (row: any, isRestart: boolean = false) => {
	let flag = row.status === 'online' ? 'stop' : 'start'
	let title = isRestart ? '重启' : flag === 'stop' ? '停止' : '启动'
	await useConfirm({
		title: '修改集群状态',
		content: `即将${title}集群，是否继续？`,
	})
	let params: any = {
		mode: row.mode,
		status: isRestart ? 'restart' : flag,
		name: row.name,
	}
	if (isNumber(row.id)) params.id = row.id
	else params.name = row.name
	const res: AnyObject = await useDataHandle({
		loading: `正在${title}集群，请稍后...`,
		request: setPM2Status(params),
	})
	if (res.status) getMonitorData()
}

/**
 * @description 设置行数据并打开日志
 */
const setRowData = (row: any, type: string) => {
	logViewData.value = ''
	logViewPopup.value = true
	rowData.value = row
	currentType.value = type
	openLogView(row, type)
}

/**
 * @description 获取表格列配置
 */
const useTableColumn = () => {
	return [
		{
			label: 'ID',
			prop: 'id',
			width: 100,
		},
		{
			label: '服务名称',
			prop: 'name',
			width: 110,
			render: (row: any) => {
				if (row.data) return row.name
				return (
					<span class="text-primary cursor-pointer" onClick={() => openClusterDetail(row)}>
						{row.name}
					</span>
				)
			},
		},
		{
			label: 'pid',
			prop: 'pid',
			render: (row: any) => row.pid ?? '--',
		},
		{
			label: '运行用户',
			prop: 'user',
			width: 75,
		},
		{
			label: '重启次数',
			prop: 'restart',
			width: 75,
			render: (row: any) => row.restart || '--',
		},
		{
			label: '创建时间',
			prop: 'addtime',
			width: 150,
			render: (row: any) => formatTime(row.uptime),
		},
		{
			label: 'cpu使用率',
			prop: 'cpu',
			render: (row: any) => (isString(row.cpu) ? row.cpu + '%' : '--'),
		},
		{
			label: '内存占用',
			prop: 'memory',
			render: (row: any) => (row.memory !== undefined ? getByteUnit(row.memory) : '--'),
		},
		{
			label: '日志',
			prop: 'log',
			width: 120,
			render: (row: any) => {
				return (
					<div>
						<span class="bt-link cursor-pointer" onClick={() => setRowData(row, 'all')}>
							全部/
						</span>
						<span class="bt-link cursor-pointer" onClick={() => setRowData(row, 'err')}>
							错误/
						</span>
						<span class="bt-link cursor-pointer" onClick={() => setRowData(row, 'out')}>
							运行
						</span>
					</div>
				)
			},
		},
		{
			label: '自动重载',
			width: 75,
			prop: 'auto_restart',
			render: (row: any) => {
				if (row.data) return '--'
				return row.auto_restart ? '是' : '否'
			},
		},
		{
			label: '状态',
			prop: 'status',
			render: (row: any) => {
				let flag = row.status === 'online' ? true : false
				return <span class={`text-${flag ? 'primary' : 'danger'}`}>{flag ? '运行中' : '已停止'}</span>
			},
		},
		useOperate([
			{
				onClick: (row: any) => changeClusterState(row),
				isHide: (row: any) => !(row.status === 'online'),
				title: '停止',
				width: 26,
			},
			{
				onClick: (row: any) => changeClusterState(row),
				isHide: (row: any) => row.status === 'online',
				title: '启动',
				width: 26,
			},

			{ onClick: (row: any) => changeClusterState(row, true), title: '重启', width: 26 },
		]),
	]
}
const tableColumns = useTableColumn()

onMounted(() => {
	getMonitorData()
})
</script>

<style scoped lang="css">
:deep(.el-descriptions__label) {
	width: 200px !important;
}

:deep(.el-descriptions__content) {
}
:deep([class*='el-table__row--level-1']) {
	background: rgba(var(--el-color-primary), 0.1);
}
</style>
