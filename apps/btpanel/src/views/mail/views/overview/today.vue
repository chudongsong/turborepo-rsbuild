<template>
	<div>
		<!-- <el-card class="mb-[14px] !border-none !mt-0" :body-style="{ padding: 0, display: 'flex', minHeight: '5.2rem' }">
			<div class="flex items-center px-2rem">
				<div>
					每月发件数量：
					<span>
						<span :class="`${getColorClass(todayData?.free)}`">
							{{ todayData?.free?.used }}
						</span>
						/ {{ todayData?.free?.total }}
					</span>
					<el-tooltip class="item" effect="dark" placement="top-start">
						<template #content>
							<div>
								<div>如果您的发件配额仍然不够/超出了每月发件数量，可以购买发件扩展包</div>
								<div>供您选择：</div>
								<div>150000封/月</div>
								<div>2000000封/年</div>
							</div>
						</template>
						<a class="bt-ico-ask ml-3" target="_blank">?</a>
					</el-tooltip>
					<bt-link class="ml-1rem" @click="openPay">{{ authExpirationTime === -1 ? '升级' : '续费' }}</bt-link>
				</div>
				<div class="ml-4rem">
					发件扩展包：
					<span>
						<span :class="`${getColorClass(todayData?.period)}`">
							{{ todayData?.period?.used }}
						</span>
						/ {{ todayData?.period?.total }}
					</span>
					<el-tooltip class="item" effect="dark" placement="top-start">
						<template #content>
							<div>
								<div>如果您的发件配额仍然不够/超出了每月发件数量，可以购买发件扩展包</div>
								<div>供您选择：</div>
								<div>150000封/月</div>
								<div>2000000封/年</div>
							</div>
						</template>
						<a class="bt-ico-ask ml-3" target="_blank">?</a>
					</el-tooltip>
					<bt-link class="ml-1rem" @click="openPayExtension">购买扩展包</bt-link>
				</div>

				<el-button size="small" class="ml-[4rem]" title="刷新数据" @click="getUserSurplus(true, true)">
					<span>刷新</span>
					<i class="svgtofont-el-refresh-right el-icon--right size-[1.3rem]"></i>
				</el-button>
				<bt-link class="ml-4rem" @click="openNps">
					<div class="flex items-center">
						<span class="svgtofont-desired text-medium"></span>
						<span>需求反馈</span>
					</div>
				</bt-link>
				<bt-link class="ml-[12px]" @click="openUseExplain">
					<div class="flex items-center">
						<span class="text-small">>></span>
						<span>使用说明</span>
					</div>
				</bt-link>
			</div>
		</el-card> -->
		<el-card class="mb-[14px] !border-none">
			<template #header>
				<div class="flex items-center">
					<span class="text-medium">今日发送</span>
					<bt-link class="ml-[12px]" @click="openNps">
						<div class="flex items-center">
							<span class="svgtofont-desired text-medium"></span>
							<span>需求反馈</span>
						</div>
					</bt-link>
					<bt-link class="ml-[12px]" @click="openUseExplain">
						<div class="flex items-center">
							<span class="text-small">>></span>
							<span>使用说明</span>
						</div>
					</bt-link>
				</div>
			</template>
			<div class="p-24px">
				<div class="total-list">
					<div class="total-item">
						<div class="total-label">发送成功率</div>
						<div class="total-value text-primary text-subtitleLarge">{{ sendSuccessRate }}%</div>
					</div>
					<div class="total-item">
						<div class="total-label">发送成功</div>
						<div class="total-value text-medium">{{ sendSuccess }}</div>
					</div>
					<div class="total-item">
						<div class="total-label">发送失败</div>
						<div class="total-value text-medium">{{ sendFail }}</div>
					</div>
				</div>
				<div class="h-200px">
					<BtECharts ref="echartRef" style="height: 200px" />
				</div>
			</div>
		</el-card>
		<el-card class="!border-none">
			<template #header>
				<div class="flex items-center">
					<span class="text-medium">今日接收</span>
				</div>
			</template>
			<div class="p-24px">
				<div class="total-list">
					<div class="total-item">
						<div class="total-label">接收成功率</div>
						<div class="total-value text-primary text-subtitleLarge">{{ receiveSuccessRate }}%</div>
					</div>
					<div class="total-item">
						<div class="total-label">接收成功</div>
						<div class="total-value text-medium">{{ receiveSuccess }}</div>
					</div>
					<div class="total-item">
						<div class="total-label">接收失败</div>
						<div class="total-value text-medium">{{ receiveFail }}</div>
					</div>
				</div>
				<div class="h-200px">
					<BtEChartsReceived ref="sendEchartRef" style="height: 200px" />
				</div>
			</div>
		</el-card>
	</div>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { MAIL_OVERVIEW } from './store'
import { useDialog, useECharts } from '@/hooks/tools'
import { productPaymentDialog } from '@/public/popup'
import { useGlobalStore } from '@/store/global'
import { todayData, getUserSurplus, openUseExplain, openNps } from './useMethod'

const { payment } = useGlobalStore()
const { authType, authExpirationTime } = toRefs(payment.value)

const store = MAIL_OVERVIEW()
const { sendSuccessRate, sendSuccess, sendFail, receiveSuccessRate, receiveSuccess, receiveFail } = storeToRefs(store)

// 图表组-渲染组件
const { BtECharts, getEChart, setOption, setQuickOption } = useECharts({
	// 图表配置
	options: {},
})

// 图表组-渲染组件
const {
	BtECharts: BtEChartsReceived,
	getEChart: getEChartReceived,
	setOption: setOptionReceived,
} = useECharts({
	// 图表配置
	options: {},
})

const openPay = () => {
	productPaymentDialog({
		disablePro: authType.value !== 'pro',
		sourceId: 360,
	})
}

/**
 * @description 打开支付扩展包
 */
const openPayExtension = () => {
	useDialog({
		area: [100, 50],
		component: () => import('@mail/views/pay-expansion-pack/index.vue'),
	})
}

/**
 * @description 获取颜色
 * @param used 已使用
 * @param total 总数
 */
const getColorClass = ({ used, total }: any) => {
	if (used && total && used !== '--' && total !== '--') {
		const rate = (Number(used) / Number(total)) * 100
		if (rate >= 100) {
			return 'text-danger'
		} else if (rate >= 90) {
			return 'text-warning'
		} else if (Number(used) === 0) {
			return 'text-secondary'
		} else {
			return 'text-primary'
		}
	} else {
		return ''
	}
}

onMounted(() => {
	getUserSurplus()
	store.getData(getEChart, getEChartReceived, setOption, setOptionReceived)
})

onUnmounted(() => {
	store.$reset()
})
</script>

<style lang="css" scoped>
.el-card {
	--n-title-font-size: var(--el-font-size-large);
	--n-title-font-weight: bold;
}
.total-list {
	display: flex;
	justify-content: center;
	flex-wrap: wrap;
	margin-bottom: 24px;
}
.total-list .total-item {
	width: 18%;
	text-align: center;
}
.total-list .total-label {
	margin-bottom: 8px;
	font-size: var(--el-font-size-base);
	color: var(--el-color-text-secondary);
}
.total-list .total-value {
	display: flex;
	align-items: center;
	justify-content: center;
	min-height: 28px;
}
</style>
