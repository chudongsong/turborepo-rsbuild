<template>
	<div class="flex mt-[2rem] ml-[1rem] items-center" :class="`circle-${riskStyle?.type}`">
		<div class="risk-chart">
			<div class="circle-box">
				<div class="circle-box-bg"></div>
				<div class="circle-box-inner">
					<div class="circle-box-value">
						{{ scoreData.score }}
						<div class="unit">分</div>
					</div>
					<div class="circle-box-desc">{{ scoreData.scoreLevel }}</div>
				</div>
			</div>
		</div>
		<div class="flex-1 ml-[2rem] mr-[4rem] mt-[2rem]">
			<template v-if="scoreData.riskNum > 0">
				<div class="mb-[1rem]">
					发现<span>{{ scoreData.riskNum }}</span
					>条风险
				</div>
			</template>
			<template>
				<div class="mb-[1rem]">无风险</div>
			</template>
			<p>{{ scoreData.subtitle }}</p>
		</div>
	</div>
</template>

<script setup lang="ts">
import HOME_SECURITY_OVERVIEW_STORE from './store'

const store = HOME_SECURITY_OVERVIEW_STORE()
const { scoreData } = store

const colors = [
	{ color: 'var(--el-color-danger)', percentage: 60, type: 'danger' },
	{ color: 'var(--el-color-warning)', percentage: 80, type: 'warn' },
	{ color: 'var(--el-color-warning-light-3)', percentage: 90, type: 'alert' },
	{ color: 'var(--el-color-primary)', percentage: 100, type: 'safe' },
]

// 风险等级样式
const riskStyle = computed(() => {
	return colors.find(item => scoreData.score < item.percentage)
})
</script>
<style lang="css" scoped>
.risk-chart {
	padding: 2px;
}
.risk-chart .circle-box {
	position: relative;
	display: flex;
	width: 110px;
	height: 110px;
	justify-content: center;
	align-items: center;
}
.risk-chart .circle-box::before,
.risk-chart .circle-box::after,
.risk-chart .circle-box .circle-box-bg {
	position: absolute;
	top: 0;
	left: 0;
	display: block;
	width: 100%;
	height: 100%;
	content: '';
}
.risk-chart .circle-box::before {
	border-radius: var(--el-border-radius-extra-round);
	opacity: 0.8;
	animation: wave 12s infinite linear;
}
.risk-chart .circle-box::after {
	border-radius: var(--el-border-radius-extra-round);
	opacity: 0.6;
	animation: wave 10s infinite linear;
}
.risk-chart .circle-box .circle-box-bg {
	border-radius: var(--el-border-radius-extra-round);
	opacity: 0.4;
	animation: wave 8s infinite linear;
}
.risk-chart .circle-box .circle-box-inner {
	z-index: 1;
	display: flex;
	width: calc(110px - 9px);
	height: calc(110px - 9px);
	border-radius: var(--el-border-radius-circle);
	flex-direction: column;
	justify-content: center;
	align-items: center;
	background: var(--el-color-white);
}
.risk-chart .circle-box .circle-box-value {
	display: inline-flex;
	font-size: var(--el-font-size-icon-large);
	line-height: 1;
	align-items: flex-end;
}
.risk-chart .circle-box .circle-box-value .unit {
	margin-left: 4px;
	font-size: var(--el-font-size-small);
	transform: translateY(-6px);
}
.risk-chart .circle-box .circle-box-desc {
	margin-top: 4px;
}

/* 自定义样式 */
.circle-danger .risk-chart .circle-box::before,
.circle-danger .risk-chart .circle-box::after,
.circle-danger .risk-chart .circle-box .circle-box-bg {
	background-color: var(--el-color-danger);
}
.circle-danger .risk-chart .circle-box .circle-box-inner {
	color: var(--el-color-danger-dark);
}

.circle-warn .risk-chart .circle-box::before,
.circle-warn .risk-chart .circle-box::after,
.circle-warn .risk-chart .circle-box .circle-box-bg {
	background-color: var(--el-color-warning);
}
.circle-warn .risk-chart .circle-box .circle-box-inner {
	color: var(--el-color-warning);
}

.circle-alert .risk-chart .circle-box::before,
.circle-alert .risk-chart .circle-box::after,
.circle-alert .risk-chart .circle-box .circle-box-bg {
	background-color: var(--el-color-warning-dark);
}
.circle-alert .risk-chart .circle-box .circle-box-inner {
	color: var(--el-color-warning-dark);
}

.circle-safe .risk-chart .circle-box::before,
.circle-safe .risk-chart .circle-box::after,
.circle-safe .risk-chart .circle-box .circle-box-bg {
	background-color: var(--el-color-primary);
}
.circle-safe .risk-chart .circle-box .circle-box-inner {
	color: var(--el-color-primary);
}

@keyframes wave {
	0% {
		transform: rotate(0deg);
	}
	50% {
		transform: rotate(180deg);
	}
	100% {
		transform: rotate(360deg);
	}
}
</style>
