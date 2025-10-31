<template>
	<div class="sn-home" v-bt-loading="loading">
		<div class="sn-home-switch">
			<div class="flex items-center">
				<div class="mr-4 text-small">监控开关</div>
				<el-switch v-model="phpMonitorStatus" :width="36" @change="changeStatus" :disabled="switchDisable"></el-switch>
			</div>
			<div v-if="switchDisable" class="sn-home-note flex items-center !text-small">
				<i class="svgtofont-el-warning-filled text-warningDark"></i>
				无法使用PHP安全告警，请开启
				<span class="bt-link !text-danger underline" @click="goPhpModules" v-if="!phpSwitch" title="点击跳转PHP模块页面"> PHP模块 </span>
				<span v-if="!phpSwitch && !sendSwitch">、</span>
				<bt-link v-if="!sendSwitch" title="点击跳转告警设置页面" type="danger" class="underline"> 设置告警 </bt-link>
			</div>
			<el-button v-if="sendSwitch && phpSwitch" type="primary" @click="openAttackView">模拟攻击</el-button>
		</div>
		<div class="sn-home-overview" :class="riskLevelsOverview[0].value ? 'sn-home-overview-red' : riskLevelsOverview[1].value ? 'sn-home-overview-yellow' : 'sn-home-overview-green'">
			<div class="text-secondary text-base">风险等级概览</div>
			<div class="mt-[2rem]">
				<div class="sn-home-overview-item" :class="index < 3 ? 'line-border' : ''" v-for="(item, index) in riskLevelsOverview" :key="index">
					<div class="sn-home-overview-item-title">{{ item.title }}</div>
					<div class="sn-home-overview-item-num" :style="item.style">
						{{ item.value }}
					</div>
				</div>
			</div>
		</div>
		<div class="sn-home-list" v-if="dataList.length">
			<template v-for="(item, index) in dataList" :key="index">
				<el-popover placement="bottom" :width="260" trigger="hover" :offset="0" :show-after="300">
					<template #reference>
						<div class="sn-home-list-item flex items-center">
							<div>
								<div class="sn-home-list-item-type max-w-[12rem] w-max flex items-center" :class="item.risk === 1 ? 'green' : item.risk === 2 ? 'org' : 'red'">
									<i class="svgtofont-el-warning !text-medium w-[16px]"></i>
									<span class="ml-[0.4rem] truncate flex-1">{{ item.intercept }}</span>
								</div>
							</div>
							<span>攻击者IP：{{ item.address }}</span>
							<span>网站：{{ item.domain }}</span>
							<span>路径：{{ item.url }}</span>
							<div class="text-right">触发时间：{{ formatTime(item.addtime) }}</div>
						</div>
					</template>
					<div class="text-tertiary leading-2.2rem">
						<div>【{{ item.domain }}】</div>
						<div class="mt-1rem">
							路径：
							<span :class="getRiskClass(item.risk)">{{ item.intercept }}</span>
						</div>
						<div>路径：{{ decodeHtml(item.url) }}</div>
						<div>
							解决方案：
							<p v-for="(it, idx) in getSolutions(item.solution)" :key="idx">
								{{ it }}
							</p>
						</div>
						<div class="flex justify-end items-center">
							<bt-link @click="addWhiteEvent(item.url)">误报</bt-link>
							<bt-divider></bt-divider>
							<bt-link @click="setIgnoreEvent(item.id)">已处理</bt-link>
						</div>
					</div>
				</el-popover>
			</template>
		</div>
		<div v-else class="sn-home-list"><el-empty description="暂无数据" /></div>
		<div class="text-disabled mt-[1rem]">以上仅提供最新的前100条风险数据</div>
	</div>
</template>
<script lang="tsx" setup>
import type { PhpSiteTableDataProps } from '@firewall/types'

import { Message } from '@hooks/tools'
import { getFirewallStore } from '@firewall/useStore'
import { formatTime, decodeHtml } from '@utils/index'
import { useDataHandle } from '@hooks/tools'
import { getPhpSiteStatus, getPhpSiteNotice, setStartService, setSiteUrlWhite, setIgnore } from '@/api/firewall'
import { useDialog } from '@hooks/tools'

// 全局
const {
	refs: { phpTabActive },
} = getFirewallStore()

const phpMonitorStatus = ref(false)
const loading = ref(false)
const sendSwitch = ref(false) // 告警是否开启
const phpSwitch = ref(false) // php模块是否开启
const dataList = ref<Array<PhpSiteTableDataProps>>([])
const switchDisable = ref(false)

const riskLevelsOverview = [
	{ title: '高风险', value: 0, style: 'color: var(--el-color-danger);', name: 'risk_high' },
	{ title: '中危', value: 0, style: 'color: var(--el-color-warning)', name: 'risk_mod' },
	{ title: '低危', value: 0, style: 'color: var(--el-color-warning-light-3)', name: 'risk_low' },
	{ title: '网站数量', value: 0, style: 'color: var(--el-color-text-primary)', name: 'site_count' },
	{ title: '告警次数', value: 0, style: 'color: var(--el-color-text-primary)', name: 'risk_count' },
]

/**
 * @description: 获取风险等级颜色
 */
const getRiskClass = (risk: number) => {
	if (risk === 3) return 'text-danger'
	if (risk === 2) return 'text-warning'
	return 'text-[var(--el-color-warning-light-3)]'
}

/**
 * @description: 获取解决方案
 */
const getSolutions = (solution: string) => {
	return solution?.split('|split|') || []
}

/**
 * @description: 误报
 */
const addWhiteEvent = async (url: string) => {
	await useDataHandle({
		loading: '正在加入URL白名单...',
		request: setSiteUrlWhite({ url_rule: url }),
		message: true,
	})
	await getNoticeList()
}

/**
 * @description: 设置已处理
 */
const setIgnoreEvent = async (id: number) => {
	await useDataHandle({
		loading: '正在处理，请稍候...',
		request: setIgnore({ operation: 1, id }),
		message: true,
	})

	await getNoticeList()
}

/**
 * @description: 获取状态
 */
const getStatus = async () => {
	await useDataHandle({
		request: getPhpSiteStatus(),
		data: {
			status: [Boolean, phpMonitorStatus],
			send: [Boolean, sendSwitch],
			php_status: [Boolean, phpSwitch],
		},
	})
	if (!sendSwitch.value || !phpSwitch.value) switchDisable.value = true
	else switchDisable.value = false
}

/**
 * @description: 获取列表
 */
const getNoticeList = async () => {
	const { data: res } = await useDataHandle({
		loading: loading,
		request: getPhpSiteNotice(),
		// data: {
		// 	logs: [Array, dataList],
		// },
	})
	dataList.value = res.logs
	riskLevelsOverview.forEach(item => {
		item.value = res[item.name]
	})
}

/**
 * @description: 打开攻击视图
 */
const openAttackView = () => {
	useDialog({
		title: `模拟攻击`,
		area: 60,
		compData: () => init(),
		component: () => import('./simulate-attack.vue'),
	})
}

/**
 * @description: 监控开关
 */
const changeStatus = async (val: boolean) => {
	phpMonitorStatus.value = !val
	if (!sendSwitch.value || !phpSwitch.value) {
		phpMonitorStatus.value = false
		Message.error('请先开启PHP模块设置')
		return
	}

	await useDataHandle({
		loading: '正在' + (val ? '开启' : '关闭') + '监控，请稍后...',
		request: setStartService({ status: val ? 'start' : 'stop' }),
		message: true,
		data: {
			status: [
				Boolean,
				(data: boolean) => {
					if (data) phpMonitorStatus.value = val
				},
			],
		},
	})
}

/**
 * @description: 跳转PHP模块页面
 */
const goPhpModules = () => (phpTabActive.value = 'php')

/**
 * @description: 初始化
 */
const init = () => {
	getStatus()
	getNoticeList()
}

onMounted(() => init())
</script>
<style lang="css" scoped>
.sn-home-switch {
	@apply flex justify-between items-center h-[4.2rem] mb-[1rem];
}
.sn-home-note {
	@apply text-warningDark ml-[1.6rem] flex-1 rounded-small bg-extraLight h-[3rem] leading-[3rem] px-[1rem];
}
.sn-home-overview {
	@apply mb-[2rem] p-[1.6rem] border-[0.1rem] border-lighter rounded-base;
}
.sn-home-overview-item {
	@apply inline-block min-w-[16rem] relative text-center;
}
.sn-home-overview-item-title {
	@apply text-tertiary text-medium mb-[1rem];
}
.sn-home-overview-item-num {
	@apply text-subtitleLarge font-bold leading-[3.6rem];
}
.sn-home-overview-item.line-border::after {
	@apply absolute right-0 top-[1rem] h-[4.8rem] border-right-[0.1rem] border-lighter content-[''];
}
.sn-home-overview-red {
	background: linear-gradient(to bottom, rgba(var(--el-color-danger-rgb), 0.1), rgba(var(--el-color-white-rgb), 0.1));
}
.sn-home-overview-yellow {
	background: linear-gradient(to bottom, rgba(var(--el-color-warning-rgb), 0.1), rgba(var(--el-color-white-rgb), 0.1));
}
.sn-home-overview-green {
	background: linear-gradient(to bottom, rgba(var(--el-color-success-rgb), 0.1), rgba(var(--el-color-white-rgb), 0.1));
}
.sn-home-list {
	@apply h-[40rem] overflow-auto border-[0.1rem] border-lighter rounded-base;
}
.sn-home-list-item {
	@apply grid grid-cols-5 justify-between border-b-[0.1rem] border-b-[var(--el-color-border-dark-tertiary)] h-[4.2rem] leading-[4.2rem] px-[1rem] text-tertiary;
}
.sn-home-list-item-type {
	@apply px-[1rem] py-[.4rem] rounded-small leading-[2.6rem];
}
.sn-home-list-item-type.green {
	@apply bg-[var(--el-color-success-light-9)] text-primary;
}
.sn-home-list-item-type.org {
	@apply bg-[var(--el-color-warning-light-9)] text-warning;
}
.sn-home-list-item-type.red {
	@apply bg-[var(--el-color-danger-light-9)] text-danger;
}
</style>
