<template>
	<div class="module-ui mb-[1.2rem] mx-[1.2rem]">
		<div class="module-ui-header">
			<div class="flex w-full justify-between">
				<span class="font-alibaba-semibold">概览</span>
				<span title="自定义概览模块" class="!ml-[1rem] cursor-pointer" @click="store.openOverviewTemplate()">
					<i class="svgtofont-el-more-filled !text-large hover:text-primary inline-block" style="transform: rotate(90deg)"></i>
				</span>
			</div>
		</div>
		<div class="module-ui-body mt-[1.2rem]">
			<div class="!mx-0 w-full">
				<el-row :span="24" :gutter="20" class="overview-wrapper draggable-group">
					<template v-if="loading">
						<el-skeleton :style="{ width: `${boxStyle.width}px` }" class="overview-box" v-for="item in 5" :key="item">
							<template #template>
								<!-- <el-skeleton-item variant="image" class="box-icon flex-shrink-0" /> -->
								<div class="flex flex-col w-full relative inline-block">
									<el-skeleton-item variant="text" class="!w-[40%]" />
									<el-skeleton-item variant="text" class="mt-10px" />
								</div>
							</template>
						</el-skeleton>
					</template>
					<el-col :span="boxStyle.number" :xl="boxStyle.number" v-for="item in overviewShowList" class="rounded-large" :key="item.id" @click="store.openModelDialog(item)" :style="{ minWidth: `${boxStyle.width}px` }">
						<div class="overview-box">
							<i class="svgtofont-icon-drag move-icon" @click.stop title="可拖拽"></i>
							<div class="overview-content">
								<div class="content w-full">
									<span class="title">{{ store.getModelTitle(item) }}</span>
									<!-- 基础模块，或者打开模块提示，显示单个数据 -->
									<div class="flex h-[4.4rem] items-center w-full">
										<span
											class="bt-link-primary !text-subtitleLarge text-alibaba"
											v-if="item.template === 'base'"
											:class="{
												memo: item.name === 'memo',
												risk: item.name === 'safety_risk' && item.value[0] > 0,
												'!text-disabled': item.name === 'memo' && !item.value[0],
											}">
											{{ item.value[0] || (item.name === 'memo' ? '当前内容为空，点击编辑' : item.value[0]) }}
										</span>

										<!-- 浏览模块，今日和昨日对照 -->
										<template v-else-if="item.template === 'browse'">
											<template v-if="item.type === 'plugin' && !item.plugin_info.setup">
												<span class="risk not-install bt-blink">
													{{ store.getPayStatus(item) ? '立即购买' : '立即安装' }}
												</span>
											</template>
											<template v-else-if="item.type === 'plugin' || item.type === 'model'">
												<div class="model font-bold" v-loading="isSshLoading && item.name === 'ssh_log'">
													<div class="to-day">
														<span class="">今日</span><span>{{ item.value[0] || 0 }}</span>
													</div>
													<div class="yester-day ml-[1.6rem]">
														<span>昨日</span><span>{{ item.value[1] || 0 }}</span>
													</div>
												</div>
											</template>
										</template>

										<!-- 打开目录 -->
										<span v-else-if="item.template === 'open_dir'" class="path-info bt-link-primary truncate">
											{{ item.params[0].name }}
										</span>

										<!-- 搜索文件 -->
										<span v-else-if="item.template === 'search_file'" class="path-info bt-link-primary truncate"> 点击搜索内容 </span>

										<div v-if="item.type === 'base' || item.name === 'safety_risk'" class="icon-open-routes">
											<span class="icon-open-routes-icon">
												<i class="svgtofont-el-arrow-right font-bold text-medium"></i>
											</span>
											<span class="icon-open-routes-text">
												{{ shouldShowShortText ? '打开' : `打开到${store.getModelTitle(item).split('-')[0]}` }}
											</span>
										</div>
									</div>
								</div>
							</div>
						</div>
					</el-col>
				</el-row>
			</div>
		</div>

		<!-- </el-card> -->
	</div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { delayExecAsync } from '@/public/index'
import HOME_OVERVIEW_STORE from './store'

const store = HOME_OVERVIEW_STORE()
const { mainWidth, loading, isSshLoading, overviewShowList } = storeToRefs(store)

const boxStyle = computed(() => {
	let widthStyle = 0 // 宽度样式
	// 一行显示的个数
	const number = mainWidth.value < 1100 ? (mainWidth.value < 800 ? (mainWidth.value < 400 ? 1 : 2) : 4) : mainWidth.value > 1800 ? 8 : 6
	const width = Math.floor((mainWidth.value - number * 16 - 50) / number) // 单个概览宽度 (主体宽度-一行显示的个数*间距-左右边距) / 一行显示的个数
	widthStyle = Math.min(Math.max(width, 200), 270) // 限制宽度在170-260之间
	return {
		number: 24 / (number > overviewShowList.value.length ? overviewShowList.value.length : number),
		width: widthStyle,
	}
})

// 判断是否应该显示简短文本
const shouldShowShortText = computed(() => {
	return boxStyle.value.width < 230
})

onMounted(async () => {
	delayExecAsync({
		promises: [store.getOverviewData],
		delay: 100,
	})
})
</script>

<style lang="css" scoped>
.overview-wrapper {
	@apply w-full;
}

.ghost {
	border: 2px dashed var(--el-color-primary) !important;
}

.draggable-group {
	/* @apply group-a flex flex-wrap items-center align-middle justify-start pr-[3.2rem]; */
}

.box-icon {
	@apply bg-[rgba(var(--el-color-primary-rgb),0.1)] h-[48px] w-[48px] rounded-large flex items-center justify-center mr-1.4rem;
}

.overview-box {
	@apply pl-2rem py-2rem  h-[11rem] relative base-box flex items-center  transition-all duration-100 cursor-pointer transition-duration-100 rounded-extraLarge;
}

.overview-box .overview-content {
	@apply h-full w-full flex items-start relative inline-block;
}

.overview-box:last-child .overview-content {
	@apply border-r-0;
}

.overview-box:hover {
	box-shadow: 0 0 38px rgb(100 100 100 / 10%) inset;
}

.overview-box:hover .move-icon {
	display: flex !important;
}

.overview-box:hover .bottom-menu {
	display: block !important;
	opacity: 1 !important;
}
.overview-box:hover .icon-open-routes {
	@apply bg-[var(--el-color-primary-light-8)] text-primary w-auto pr-[1.2rem];
}

.overview-box:hover .icon-open-routes-text {
	display: block !important;
}

.move-icon {
	@apply mover cursor-move items-center justify-center h-[1.6rem] w-[1.6rem] text-large hidden absolute top-[2rem] right-[2rem] z-10;
}

.model {
	@apply text-tertiary flex justify-between;
}

.icon-open-routes {
	@apply flex items-center justify-start ml-[1.6rem] w-[2.4rem] px-[.4rem] text-tertiary bg-lighter rounded-medium;
}

.icon-open-routes-icon {
	@apply py-[.8rem] flex items-center justify-center w-[2.4rem];
}

.icon-open-routes-text {
	@apply text-base text-primary hidden;
}

.content {
	@apply flex flex-col items-start justify-center;
}

.title {
	@apply text-tertiary text-base w-[100%]  pb-[1rem] truncate flex-1  inline-block;
}

/* .risk,
.path-info {
	font-size: var(--el-font-size-base) !important;
	@apply w-full text-base text-primary justify-start truncate;
} */

.href:hover,
.memo:hover,
.model:hover,
.risk:hover,
.path-info:hover {
	@apply text-primaryDark;
}

.memo {
	font-size: var(--el-font-size-small) !important;
	@apply truncate;
}

.risk {
	color: var(--el-color-danger);
}

.risk:hover {
	color: var(--el-color-danger-dark-2);
}

.to-day,
.yester-day {
	@apply flex items-center flex-row flex-1 whitespace-nowrap;
}

.to-day span,
.yester-day span {
	@apply text-tertiary text-base;
}

.to-day span:first-child,
.yester-day span:first-child {
	@apply text-tertiary text-base pr-[.8rem];
}

.to-day span:last-child,
.yester-day span:last-child {
	@apply text-large;
	color: var(--el-color-text-primary);
}

.not-install {
	font-size: var(--el-font-size-base) !important;
}

.path-info {
	font-size: var(--el-font-size-base) !important;
}

.bottom-menu {
	@apply text-center bg-extraLight leading-[2.6rem] mt-[4px] absolute bottom-0 w-[100%] text-primary hidden opacity-0 transition-all duration-100 left-0;
}

.grid-cols-2 {
	grid-template-columns: repeat(2, minmax(0, 1fr));
}

.grid-cols-4 {
	grid-template-columns: repeat(4, minmax(0, 1fr));
}

.grid-cols-6 {
	grid-template-columns: repeat(6, minmax(0, 1fr));
}

.grid-cols-8 {
	grid-template-columns: repeat(8, minmax(0, 1fr));
}

.model :deep(.el-loading-spinner) {
	margin-top: -14px;
}

.model :deep(.el-loading-spinner .circular) {
	height: 28px;
	width: 28px;
}

.icon-text-svg {
	width: 2.6rem;
	height: 2.6rem;
}

.risk-icon {
	filter: invert(15%) sepia(100%) saturate(6600%) hue-rotate(0deg) brightness(100%) contrast(115%);
}
.el-col-4\.8 {
	width: 20%;
}

@media (min-width: 1200px) {
	.el-col-xl-4\.8 {
		width: 20%;
	}
}
</style>
