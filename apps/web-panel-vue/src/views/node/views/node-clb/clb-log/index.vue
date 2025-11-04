<template>
		<div class="p-[2rem] node-clb-http-log">
			<BtTableGroup>
				<template #header-left>
					<div class="flex items-center">
						<div>
							<bt-radio type="button" v-model="currentTab" :options="dateTabs" @change="handleTabClick" class="mr-[1rem] !flex-nowrap" />
						</div>
						<el-date-picker
							v-if="currentTab === 'custom'"
							v-model="logCustomDate"
							type="date"
							placeholder="请选择日期"
							value-format="YYYY-MM-DD"
							@change="handleDateChange"
							class="ml-2"
						/>
					</div>
				</template>
				<template #header-right>
					<bt-table-refresh class="ml-[10px]" @refresh="handlePageClick('first')" />
					<el-button type="success" @click="exportLog(row)">
						<i class="el-icon-download"></i> 导出日志
					</el-button>
				</template>
				<template #content>
					<BtTable :min-height="mainHeight" />
				</template>
				<template #footer-right>
					<el-button type="info" text bg @click="handlePageClick('first')">首页</el-button>
					<el-button v-show="positionNum > 0" type="info" text bg @click="handlePageClick('next')">下一页</el-button>
				</template>
			</BtTableGroup>
		</div>
</template>

<script setup lang="tsx">
import { useGlobalStore } from '@/store/global'
import { useOperation, useTable, Message } from '@/hooks/tools'
import { getByteUnit } from '@utils/index'
import { useNodeClbStore } from '../useStore'	
import { getHttpClbLog, getTcpUdpClbLog } from '@/api/node'

import { exportLog, getLogDateParam, parseLogTime } from './useController'
import { useClbLogStore } from './useStore'
const { mainHeight } = useGlobalStore()
const { activeTabs } = useNodeClbStore()

const { currentTab, logCustomDate, dateTabs, currentDate } = useClbLogStore()


interface Props {
	compData: {
		row: {
			load_id: number
		}
	}
}

const props = withDefaults(defineProps<Props>(), {
	compData: () => ({
		row: {
			load_id: 0
		}
	}),
})

const row = computed(() => props.compData.row)
let positionNum = ref(-1)
const handleTabClick = (tab: string) => {
	currentTab.value = tab
	positionNum.value = -1
	if (tab === 'custom') return
	logCustomDate.value = ''
	refreshData()
}

const handleDateChange = (val: any) => {
	positionNum.value = -1
	if (val) {
		logCustomDate.value = val
		refreshData()
	}
}
//刷新表单
const refreshData = () => {
	refresh()
}

const handlePageClick = (type: string) => {
	if (type === 'first') {
		positionNum.value = -1
		refresh()
	} else if (type === 'next') {
		refresh()
	}
}

const columns = ref(
	activeTabs.value === 'tcpudp' ? 
	[
		{
			label: '时间',
			prop: 'time_local',
			width: 180,
			render: (row: any) => parseLogTime(row.time_local)
		},
		{
			label: '客户端IP',
			prop: 'remote_addr',
		},
		{
			label: '协议',
			prop: 'protocol',
		},
		{
			label: '响应状态',
			prop: 'status',
		},
		{
			label: '发送大小',
			prop: 'bytes_sent',
			render: (row: any) => {
				return getByteUnit(Number(row.bytes_sent))
			}
		},
		{
			label: '接收大小',
			prop: 'bytes_received',
			render: (row: any) => {
				return getByteUnit(Number(row.bytes_received))
			}
		},
		{
			label: '会话耗时（秒）',
			prop: 'session_time',
			render: (row: any) => {
				return `${row.session_time}`
			}
		},
		{
			label: '节点地址',
			prop: 'upstream_addr',
			width: 120
		},
		{
			label: 'TO大小',
			prop: 'upstream_bytes_sent',
			render: (row: any) => {
				return getByteUnit(Number(row.upstream_bytes_sent))
			}
		},
		{
			label: 'RE大小',
			prop: 'upstream_bytes_received',
			render: (row: any) => {
				return getByteUnit(Number(row.upstream_bytes_received))
			}
		},
		{
			label: '连接耗时（秒）',
			prop: 'upstream_connect_time',
			render: (row: any) => {
				return `${row.upstream_connect_time}`
			}
		},
	]
	:
	[
		{
			label: '时间',
			prop: 'time',
			render: (row: any) => parseLogTime(row.time)
		},
		{
			label: '客户端IP',
			prop: 'remote_addr',
		},
		{   
			label: '请求类型',
			prop: 'request_method',
			width: 80,
		},
		{
			label: '负载节点',
			prop: 'upstream_addr',
		},
		{
			label: '回源耗时(秒)',
			prop: 'upstream_response_time',
		},
		{
			label: '主体大小',
			prop: 'body_bytes_sent',
			render: (row: any) => {
				return getByteUnit(Number(row.body_bytes_sent))
			}
		},
		{
			label: '传输大小',
			prop: 'bytes_sent',
			render: (row: any) => {
				return getByteUnit(Number(row.bytes_sent))
			}
		},
		{
			label: '响应状态',
			prop: 'status',
		},
		{
			label: 'URI',
			prop: 'request_uri',
		},
	]
)

const { BtTable, refresh } = useTable({
	request: async (data: any) => {
		const params = {
			load_id: row.value.load_id,
			date: getLogDateParam(currentTab.value),
			position: positionNum.value,
			limit: 10
		}
		const { data: resData } = activeTabs.value === 'tcpudp' ? await getTcpUdpClbLog(params) : await getHttpClbLog(params)
		if (resData.msg && resData.status === false) Message.error(resData.msg)
		positionNum.value = resData.data.last_position
		return {
			data: resData.data.logs || [],
			total: 0,
			other: {}
		}
	},
	columns: columns.value
})

onUnmounted(() => {
	logCustomDate.value = ''
	currentDate.value = ''
	currentTab.value = 'today'
})

</script>

<style scoped lang="scss">
.node-clb-http-log {
	:deep(.el-radio-button__inner){
		padding: 8px 15px;
	}
}
</style>