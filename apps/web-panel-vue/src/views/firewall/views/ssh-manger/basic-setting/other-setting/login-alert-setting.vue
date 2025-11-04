<template>
	<div>
		<bt-tabs class="!h-[580px]" v-model="alertTab" type="left-bg-card" position="left" @change="tabClickEvent">
			<el-tab-pane label="登录日志" name="login">
				<bt-table-group>
					<template #header-left>
						<span class="flex items-center">
							<span class="mr-[1rem]">登录告警</span>
							<el-switch size="small" class="!mb-0" v-model="switchValue" @change="onChangeAlertEvent" />
							<span class="bt-link ml-8px" @click="setLoginAlarm"> 告警通道设置 </span>
						</span>
					</template>
					<template #content>
						<bt-table max-height="450" ref="portTable" :column="tableColumn" :data="tableData" v-bt-loading="loading" v-bt-loading:title="'正在加载列表，请稍后...'"></bt-table>
					</template>
					<template #footer-right>
						<!-- <bt-table-page
              :total="total"
              layout="prev, total , next"
              v-model:page="tableParam.p"
              v-model:row="tableParam.p_size"
              @change="getAlertLog"
            /> -->
					</template>
				</bt-table-group>
				<bt-help :options="helpList" class="mt-[1rem] mx-[1rem]"></bt-help>
			</el-tab-pane>
			<el-tab-pane label="IP白名单" name="white">
				<bt-table-group>
					<template #header-left>
						<bt-input class="mr-4" v-model="ipValue" width="20rem" :placeholder="'请输入IP'" @keyup.enter.native="addWhiteEvent" clearable></bt-input>
						<el-button type="primary" @click="addWhiteEvent">添加</el-button>
					</template>
					<template #content>
						<bt-table max-height="500" v-bt-loading="whiteLoading" ref="portTable" :column="whiteColumn" :data="whiteData"></bt-table>
					</template>
					<bt-help :options="helpList"></bt-help>
				</bt-table-group>
			</el-tab-pane>
		</bt-tabs>
	</div>
</template>
<script lang="ts" setup>
import type { SshLoginAlarmSwitchProps } from '@firewall/types'

import { addIpWhite, delIpWhiteList, getIpWhiteList, getLoginSend, getLogs, setLoginSend, setTaskStatus } from '@/api/firewall'
import { useOperate } from '@/hooks/tools/table/column'
import { useDataHandle, useDataPage } from '@hooks/tools'
import { useDialog } from '@hooks/tools/dialog'
import { Message } from '@hooks/tools/message'
import { withDefaults } from 'vue'
import { checkIp } from '@/utils'

interface props {
	compData: {
		alertStatus: string
		refreshFn: () => string
	}
}

const props = withDefaults(defineProps<props>(), {
	compData: () => ({
		alertStatus: '',
		refreshFn: () => '',
	}),
})

const alertTab = ref('login') // tab切换

const ipValue = ref('') // 白名单-ip
const whiteData = ref<Array<{ ip: string }>>([]) // 白名单数据
const whiteLoading = ref(false) // 白名单加载状态

const switchValue = ref('') // 通知开关
const switchList = ref<Array<SshLoginAlarmSwitchProps>>([])
const alarmData = ref<any>({}) // 通知数据

const total = ref(0) // 总条数
const loading = ref<boolean>(false) // 加载状态
const tableData = ref([]) //列表数据
const tableParam = reactive({
	p: 1,
	p_size: 8,
}) // 表格请求数据

const helpList = [{ content: '只有root用户登录才会触发告警' }]

/**
 * @description 设置登录提醒
 */
const setLoginAlarm = async () => {
	useDialog({
		title: '登录告警设置',
		component: () => import('./alert-setting-dialog.vue'),
		area: 50,
		compData: {
			...alarmData.value,
			refreshEvent: getLoginSendEvent,
		},
		showFooter: true,
	})
}

/**
 * @description 通知开关
 * @param {boolean} value 开关状态
 * @param {string} type 类型
 */
const onChangeAlertEvent = async (value: boolean, type: string) => {
	if (value) {
		setLoginAlarm()
	} else {
		await useDataHandle({
			loading: loading,
			request: setTaskStatus({ task_id: alarmData.value.id, status: 0 }),
			message: true,
		})
		getLoginSendEvent()
	}
}

/**
 * @description 切换列表页面
 */
const getAlertLog = async () => {
	await useDataHandle({
		loading: loading,
		request: getLogs({
			...tableParam,
		}),
		data: {
			data: [Array, tableData],
			page: useDataPage(total),
		},
	})
}

/**
 * @description 获取登录通知
 */
const getLoginSendEvent = async () => {
	const res = await props.compData?.refreshFn()
	switchValue.value = res.status
	alarmData.value = res
}

const tabClickEvent = (name: string) => {
	if (name === 'white') {
		getWhiteData()
	} else {
		switchValue.value = props.compData?.alertStatus
		getLoginSendEvent()
		getAlertLog()
	}
}

/**
 * @description 通知开关
 */
const addWhiteEvent = async () => {
	if (!ipValue.value) {// 取消ip验证,用于兼容ip段和为日后ipv6做准备
		Message.error('请输入正确的IP地址')
		return
	}
	await useDataHandle({
		loading: '正在添加IP白名单，请稍后...',
		request: addIpWhite({ ip: ipValue.value }),
		message: true,
	})
	ipValue.value = ''
	getWhiteData()
}

/**
 * @description 切换列表页面
 * @param {number} p 当前页码
 */
const getWhiteData = async (p: number = 1) => {
	await useDataHandle({
		loading: whiteLoading,
		request: getIpWhiteList(),
		data: {
			msg: [Array, whiteData],
		},
	})
}

/**
 * @description 删除数据
 */
const deleteWhiteEvent = async (row: any) => {
	await useDataHandle({
		loading: '正在删除IP白名单，请稍后...',
		request: delIpWhiteList({ ip: row }),
		message: true,
	})
	getWhiteData()
}

const whiteColumn = [{ label: 'IP地址', render: (row: any) => row }, useOperate([{ onClick: (row: any) => deleteWhiteEvent(row), title: '删除' }])]

const tableColumn = [
	{ label: '详情', prop: 'log' },
	{ label: '添加时间', prop: 'addtime', align: 'right', width: 160 },
]

onMounted(async () => {
	tabClickEvent(alertTab.value)
})
</script>
<style lang="css" scoped>
.login_page :deep(.el-pagination__total) {
	margin-right: 0;
}
</style>
