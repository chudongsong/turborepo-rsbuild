<template>
	<div class="module-ui">
		<div class="module-ui-header">
			<div class="flex justify-between items-center w-full -ml-[1.4rem]">
				<div class="flex items-center">
					<div :class="['tab-item', { active: activeName === 'net' }, 'font-alibaba-semibold']" @click="switchTab('net')">流量</div>
					<div :class="['tab-item', { active: activeName === 'iostat' }, 'font-alibaba-semibold']" @click="switchTab('iostat')">磁盘IO</div>
				</div>
				<div class="flex items-center">
					<span class="text-tertiary font-500 text-small mr-[1.5rem] whitespace-pre">{{ activeName === 'net' ? '网卡' : '磁盘' }}</span>
					<template v-for="(data, key) in resource" :key="key">
						<el-select v-model="data.selectVal" v-show="`${key}` == activeName" placeholder="请选择" :fit-input-width="true" @change="store.onSelectChange" size="small" class="!min-w-[100px] !rounded-large">
							<el-option v-for="item of data.selectList" :key="item.value" :label="item.label" :value="item.value" />
						</el-select>
					</template>
				</div>
			</div>
		</div>
		<div class="module-ui-body">
			<keep-alive>
				<component :is="currentComponent" :key="activeName" v-bt-loading="loading" :v-bt-loading:title="loadingTitle" @cache-status="updateCacheStatus" />
			</keep-alive>
		</div>
	</div>
</template>

<script lang="tsx" setup>
import { storeToRefs } from 'pinia'
import MonitorMain from './main.vue'
import HOME_MONITOR_STORE from './store'

// 缓存状态
const netCached = ref(false)
const iostatCached = ref(false)

// 网络流量组件
const NetComponent = defineComponent({
	name: 'NetMonitor',
	setup(_, { emit }) {
		const store = HOME_MONITOR_STORE()
		const { netConfig, resource, unitList, netUnit, netRefs } = storeToRefs(store)

		onMounted(() => {
			emit('cache-status', { type: 'net', cached: true })
		})

		return () => (
			<div class="home-monitor-content">
				{/* 统计数据显示区域 */}
				<div class="home-monitor__stats-grid">
					{Object.values(resource.value.net.info).map((item: any, index: number) => (
						<div key={index} class="home-monitor__stat-item">
							<div class="home-monitor__stat-content">
								<div class="home-monitor__stat-left">
									{item.bgColor && (
										<div class="home-monitor__stat-dot-wrapper">
											<span class="home-monitor__stat-dot" style={{ backgroundColor: item.bgColor }} />
											<span class="home-monitor__stat-dot-ripple" style={{ borderColor: item.bgColor }} />
										</div>
									)}
									<span class="home-monitor__stat-label">{item.label}</span>
								</div>
								<div class="home-monitor__stat-right">
									<div class="home-monitor__stat-value" style={{ color: item.color || 'var(--el-color-text-secondary)' }}>
										{item.value}
									</div>
								</div>
							</div>
						</div>
					))}
				</div>

				{/* 图表区域 */}
				<div class="home-monitor__chart-container">
					<MonitorMain ref={netRefs} modelValue={netConfig.value} info={resource.value.net.info} />
				</div>
			</div>
		)
	},
})

// 磁盘IO组件
const IostatComponent = defineComponent({
	name: 'IostatMonitor',
	setup(_, { emit }) {
		const store = HOME_MONITOR_STORE()
		const { iostatConfig, resource, iostatRefs } = storeToRefs(store)

		onMounted(() => {
			emit('cache-status', { type: 'iostat', cached: true })
		})

		return () => (
			<div class="home-monitor-content">
				{/* 统计数据显示区域 */}
				<div class="home-monitor__stats-grid">
					{Object.values(resource.value.iostat.info).map((item: any, index: number) => (
						<div key={index} class="home-monitor__stat-item">
							<div class="home-monitor__stat-content">
								<div class="home-monitor__stat-left">
									{item.bgColor && (
										<div class="home-monitor__stat-dot-wrapper">
											<span class="home-monitor__stat-dot" style={{ backgroundColor: item.bgColor }} />
											<span class="home-monitor__stat-dot-ripple" style={{ borderColor: item.bgColor }} />
										</div>
									)}
									<span class="home-monitor__stat-label">{item.label}</span>
								</div>
								<div class="home-monitor__stat-right">
									<div class="home-monitor__stat-value" style={{ color: item.color || 'var(--el-color-text-secondary)' }}>
										{item.value}
									</div>
								</div>
							</div>
						</div>
					))}
				</div>

				{/* 图表区域 */}
				<div class="home-monitor__chart-container">
					<MonitorMain ref={iostatRefs} modelValue={iostatConfig.value} info={resource.value.iostat.info} />
				</div>
			</div>
		)
	},
})

const store = HOME_MONITOR_STORE()
const { loading, resource, activeName } = storeToRefs(store)

// 当前组件
const currentComponent = computed(() => {
	return activeName.value === 'net' ? NetComponent : IostatComponent
})

// 加载提示文本
const loadingTitle = computed(() => {
	return activeName.value === 'net' ? '正在获取流量信息，请稍候...' : '正在获取磁盘IO信息，请稍候...'
})

// 更新缓存状态
const updateCacheStatus = (status: { type: string; cached: boolean }) => {
	if (status.type === 'net') {
		netCached.value = status.cached
	} else if (status.type === 'iostat') {
		iostatCached.value = status.cached
	}
}

// 切换tab
const switchTab = (tab: string) => {
	if (activeName.value !== tab) {
		const startTime = performance.now()
		activeName.value = tab
		store.onTabsChange()

		// 性能监控 - 在开发环境显示切换耗时
		if (process.env.NODE_ENV === 'development') {
			nextTick(() => {
				const endTime = performance.now()
				console.log(`[Monitor] Tab切换到${tab}耗时: ${(endTime - startTime).toFixed(2)}ms`)
			})
		}
	}
}

// 初始化时从localStorage恢复上次的tab状态
onMounted(() => {
	const savedTab = localStorage.getItem('home-model-active')
	if (savedTab && ['net', 'iostat'].includes(savedTab)) {
		activeName.value = savedTab
	}
	store.initChart()
})
</script>

<style lang="css">
.module-ui-tabs {
	transition: all 0.5s ease-out;
	position: relative;
	width: 100%;
}

.tab-item {
	position: relative;
	padding: 8px 16px;
	cursor: pointer;
	color: var(--el-color-text-primary);
	font-size: var(--el-font-size-large);
	font-weight: 400;
	transition: all 0.3s ease;
	border-bottom: 3px solid transparent;
	display: flex;
	align-items: center;
}

.tab-item.active {
	font-weight: 600;
}
.tab-item.active:after {
	content: '';
	position: absolute;
	bottom: -2px;
	left: 36%;
	transform: translateX(-10%);
	width: 28%;
	height: 3px;
	background-color: var(--el-color-primary);
}

.tab-item .el-tag {
	font-size: var(--el-font-size-extra-small);
	height: 16px;
	line-height: 16px;
}

:deep(.module-ui-tabs .el-tabs__nav-wrap::after) {
	display: none !important;
}

:deep(.module-ui-tabs .el-tabs__nav) {
	height: 3.6rem;
	font-size: var(--el-font-size-large);
	font-weight: 700 !important;
}

:deep(.module-ui-tabs .el-tabs__item) {
	font-size: var(--el-font-size-large);
	color: var(--el-color-text-primary);
}

:deep(.module-ui-tabs .el-tabs__item.is-active) {
	color: var(--el-color-text-primary);
}

.unit-select {
	@apply absolute top-[94px] left-[50px] w-[100px] z-10 flex items-center whitespace-nowrap;
}

:deep(.el-tabs__item) {
	@apply h-[5rem] p-0 z-9999;
}

/* Monitor组件样式 - 使用BEM命名规范避免冲突 */
.home-monitor-content {
	width: 100%;
}

.home-monitor__stats-grid {
	display: grid;
	grid-template-columns: repeat(5, 1fr);
	gap: 16px;
	padding: 20px 15px;
	margin-bottom: 0;
}

.home-monitor__stat-item {
	border-radius: var(--el-border-radius-large);
	box-shadow: 0 0 8px rgba(var(--el-color-black-rgb), 0.06);
	transition: all 0.3s ease;
	min-height: 44px;
	padding: 0 12px;
}

.home-monitor__stat-item:hover {
	box-shadow: 0 4px 16px rgba(var(--el-color-black-rgb), 0.12);
	transform: translateY(-2px);
}

.home-monitor__stat-content {
	display: flex;
	align-items: center;
	justify-content: space-between;
	height: 100%;
}

.home-monitor__stat-left {
	display: flex;
	align-items: center;
	flex: 1;
}

.home-monitor__stat-dot-wrapper {
	position: relative;
	margin-right: 4px;
	display: flex;
	align-items: center;
	justify-content: center;
	width: 20px;
	height: 20px;
}

.home-monitor__stat-dot {
	position: relative;
	z-index: 2;
	display: inline-block;
	width: 6px;
	height: 6px;
	border-radius: var(--el-border-radius-circle);
}

.home-monitor__stat-dot-ripple {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-30%, -30%);
	width: 12px;
	height: 12px;
	border: 2px solid;
	border-radius: var(--el-border-radius-circle);
	opacity: 0.6;
	animation: home-monitor-ripple 2s infinite;
}

@keyframes home-monitor-ripple {
	0% {
		transform: translate(-50%, -50%) scale(0.8);
		opacity: 0.8;
	}
	50% {
		transform: translate(-50%, -50%) scale(1.2);
		opacity: 0.4;
	}
	100% {
		transform: translate(-50%, -50%) scale(1.6);
		opacity: 0;
	}
}

.home-monitor__stat-label {
	color: var(--el-color-text-secondary);
	font-size: var(--el-font-size-base);
	font-weight: 500;
}

.home-monitor__stat-right {
	display: flex;
	align-items: center;
}

.home-monitor__stat-value {
	font-size: var(--el-font-size-base);
	font-weight: 700;
	color: var(--el-color-text-primary);
}

.home-monitor__chart-container {
	position: relative;
	height: 100%;
	display: flex;
	flex: 1;
}

.home-monitor__chart-controls {
	position: absolute;
	left: 60px;
	top: 25%;
	gap: 10px;
	z-index: 10;
	display: flex;
	justify-content: flex-end;
	align-items: center;
	gap: 4px;
}

.home-monitor__control-label {
	color: var(--el-fill-color-darker);
	font-size: var(--el-font-size-base);
}

.home-monitor__control-select {
	width: 80px;
}

.home-monitor__control-select .el-select__wrapper {
	@apply !bg-transparent !border-none !shadow-none;
}
.home-monitor__control-select .el-select__placeholder {
	@apply !text-darker;
}
.home-monitor__control-select .el-select__icon {
	@apply !left-[-20px];
}
@media screen and (max-width: 1920px) {
	.home-monitor__stats-grid {
		grid-template-columns: repeat(4, 1fr);
	}
	.home-monitor__chart-controls {
		position: absolute;
		left: 40px;
		top: 25%;
		gap: 10px;
	}
}
@media screen and (max-width: 1720px) {
	.home-monitor__stat-item {
		padding: 0 10px;
		.home-monitor__stat-label,
		.home-monitor__stat-value {
			font-size: var(--el-font-size-small);
		}
	}
}

@media screen and (max-width: 1560px) {
	.home-monitor__stats-grid {
		padding: 10px 0;
		gap: 4px;
	}
	.home-monitor__chart-controls {
		top: 14%;
	}

	.home-monitor__stat-item {
		padding: 0 10px;
	}
}

@media screen and (max-width: 1400px) {
	.home-monitor__stats-grid {
		grid-template-columns: repeat(2, 1fr);
		gap: 10px;
		padding: 10px;
	}
	.home-monitor__chart-controls {
		top: 18%;
	}
	.home-monitor__stat-item {
		min-height: 32px;
		padding: 0 10px;
	}
	.home-monitor__stat-item:nth-last-child(3),
	.home-monitor__stat-item:nth-last-child(2) {
		padding-left: 34px;
	}
}

@media screen and (max-width: 1200px) {
	.home-monitor__stats-grid {
		grid-template-columns: repeat(5, 1fr);
		gap: 10px;
		padding: 10px;
	}
	.home-monitor__stat-item {
		min-height: 44px;
		padding: 0 10px;
		padding-left: 10px !important;
	}
	.home-monitor__chart-controls {
		position: static;
	}
}

@media screen and (max-width: 1000px) {
	.home-monitor__stats-grid {
		grid-template-columns: repeat(4, 1fr);
	}

	.home-monitor__chart-controls {
		position: absolute;
		top: 14%;
	}
}
</style>
