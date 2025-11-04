<template>
	<div class="w-full">
		<div v-if="globalTheme.home.overview_view === 'default'" ref="stateMainRef">
			<div class="state-container flex gap-[1.2rem] mb-[1.2rem]" :class="{ 'flex-wrap': isBreakLines, 'flex-nowrap': !isBreakLines }">
				<!-- <component :is="shouldWrapBaseComponents ? 'div' : 'div'" class="flex w-full gap-[1.2rem]" style="flex-basis: 100%"> -->
				<!-- 负载状态 -->
				<div :style="getComponentStyle('load')" ref="loadRef" class="state-component" :class="isShowAllDisk ? 'flex-1' : ''">
					<HomeStateMain :style="{ height: stateHeight }" :info="loadInfo" :main-width="effectiveMainWidth" @show="store.moveStatePopover(loadPopover, 'loadPopover')" @hide="store.removeStatePopover" :href="'https://www.bt.cn/bbs/thread-11402-1-1.html'">
						<HomeStatePopover :load-type="'loadInfo'" ref="loadPopover" :type="'load'" :process-alarm-show="processAlarmShow">
							<template #button>
								<div class="flex items-center justify-between mb-[1.2rem] leading-[2.8rem]">
									<div class="flex items-center">
										<span class="text-secondary text-base mr-[4px] ml-[8px]">检测到当前负载</span>
										<el-tag :type="tagsType.load">{{ `运行达到${loadInfo.range}%` }}</el-tag>
									</div>
								</div>
							</template>
							<template #base-info>
								<div class="disk-body-list flex justify-between">
									<div>最近1/5/15分钟平均负载：</div>
									<div id="load_one">
										{{ createCpuLoadInfo }}
									</div>
								</div>
								<div class="disk-body-list flex justify-between">
									<div>活动进程数 / 总进程数:</div>
									<div id="load_cpu_times_num">
										{{ createCpuProcessInfo }}
									</div>
								</div>
							</template>
							<template #content-info>
								<div class="disk-item-body" id="other_info_html">
									<table class="table table-fixed whitespace-nowrap">
										<tbody>
											<tr v-for="(item, index) in loadInfoList" :key="index">
												<template v-for="(items, indexs) in item" :key="indexs">
													<td :title="items.title" class="break-all text-ellipsis p-[.4rem] pl-0">
														<span>{{ items.name }}</span>
													</td>
													<td :title="items.title" class="break-all text-ellipsis">
														<span>{{ items.value }}</span>
													</td>
												</template>
											</tr>
										</tbody>
									</table>
								</div>
							</template>
						</HomeStatePopover>
					</HomeStateMain>
				</div>

				<!-- CPU使用率 -->
				<div :style="getComponentStyle('cpu')" class="state-component" :class="isShowAllDisk ? 'flex-1' : ''">
					<HomeStateMain :style="{ height: stateHeight }" :info="cpuInfo" :type="'cpu'" :main-width="effectiveMainWidth" @show="store.moveStatePopover(cpuPopover, 'cpuPopover')" @hide="store.removeStatePopover">
						<HomeStatePopover :load-type="'cpuInfo'" :type="'cpu'" ref="cpuPopover" :process-alarm-show="processAlarmShow">
							<template #button>
								<div class="flex items-center justify-between mb-[1.2rem] leading-[2.8rem]">
									<div class="flex items-center">
										<span class="text-secondary text-base mr-[4px] ml-[8px]">检测到当前CPU使用率</span>
										<el-tag :type="tagsType.cpu">{{ `占用${cpuInfo.range}%` }}</el-tag>
									</div>
								</div>
							</template>
							<template #content-info>
								<div class="max-h-[8.2rem] overflow-y-auto">
									<div v-for="(value, key) in cpuCoreDesc" :key="key" class="flex direction-row items-center justify-between my-[1rem]">
										<span>{{ value.name }}</span>
										<span>{{ value.value }}</span>
									</div>
								</div>
							</template>
							<template #base-info>
								<p>{{ cpu.framework }}</p>
								<p>
									{{ `${cpu.cpuNumber}个物理CPU，${cpu.logicCores}个物理核心，${cpu.cores}个逻辑核心` }}
								</p>
							</template>
						</HomeStatePopover>
					</HomeStateMain>
				</div>

				<!-- 内存使用率 -->
				<div :style="getComponentStyle('mem')" class="state-component" :class="isShowAllDisk ? 'flex-1' : ''">
					<HomeStateMain :style="{ height: stateHeight }" :type="'mem'" :info="memoryInfo" :main-width="effectiveMainWidth" @show="store.moveStatePopover(memoryPopover, 'memoryPopover')" @hide="store.removeStatePopover">
						<HomeStatePopover :load-type="'memoryInfo'" :type="'mem'" ref="memoryPopover" :process-alarm-show="processAlarmShow">
							<template #button>
								<div class="flex items-center justify-between mb-[1.2rem] leading-[2.8rem]">
									<div class="flex items-center">
										<span class="text-secondary text-base mr-[4px] ml-[8px]">检测到当前内存</span>
										<el-tag :type="tagsType.memory">{{ `占用${memoryInfo.range}%` }}</el-tag>
									</div>
									<el-button type="primary" @click="store.onClearMemory">立即释放</el-button>
								</div>
							</template>
							<template #base-info>
								<div class="flex align-left flex-col">
									<div class="flex justify-between mb-[4px]">
										<div class="w-[50%]">
											<span class="w-[81px] inline-flex justify-end">空闲内存：</span>
											<span class="inline-flex justify-start">{{ memory.memFree + ' MB' }}</span>
										</div>
										<div class="w-[50%]">
											<span class="w-[81px] inline-flex justify-end">已用：</span>
											<span class="inline-flex justify-start">{{ memory.memRealUsed + ' MB' }}</span>
										</div>
									</div>
									<div class="flex justify-between mb-[4px]">
										<div class="w-[50%]">
											<span class="w-[81px] inline-flex justify-end">总内存：</span>
											<span class="inline-flex justify-start">{{ memory.memTotal + ' MB' }}</span>
										</div>
										<div class="w-[50%]">
											<span class="w-[81px] inline-flex justify-end">共享：</span>
											<span class="inline-flex justify-start">{{ memory.memShared + ' MB' }}</span>
										</div>
									</div>
									<div class="flex justify-between mb-[4px]">
										<div class="w-[50%]">
											<span class="w-[81px] inline-flex justify-end">可分配内存：</span>
											<span>{{ memory.memAvailable + 'MB' }}</span>
										</div>
										<div class="w-[50%]">
											<span class="w-[81px] inline-flex justify-end">buff/cache：</span>
											<span class="inline-flex justify-start">{{ memory.memCached + '/' + memory.memBuffers + ' MB' }}</span>
										</div>
									</div>
								</div>
							</template>
						</HomeStatePopover>
					</HomeStateMain>
				</div>

				<!-- 磁盘列表 -->
				<template v-if="displayMode === 'single'">
					<div v-for="(item, index) in disk" :key="index" :style="getComponentStyle('disk')" class="state-component">
						<HomeStateMain :style="{ height: stateHeight }" type="disk" :info="item.info" :main-width="effectiveMainWidth" @hide="store.removeStatePopover" :data="item.data" :alert="item.data.path === 'None' ? false : parseInt(item.data.inodes[3]) === 100">
							<HomeStateDiskPopover :item="item" />
						</HomeStateMain>
					</div>
				</template>

				<!-- 混合模式：部分磁盘独立，部分平铺 -->
				<template v-else-if="displayMode === 'hybrid'">
					<!-- 独立的磁盘 -->
					<div v-for="(item, index) in disk.slice(0, disk.length - 6)" :key="`hybrid-disk-${index}`" :style="getComponentStyle('disk')" class="state-component">
						<HomeStateMain :style="{ height: stateHeight }" type="disk" :info="item.info" :main-width="effectiveMainWidth" @hide="store.removeStatePopover" :data="item.data" :alert="item.data.path === 'None' ? false : parseInt(item.data.inodes[3]) === 100">
							<HomeStateDiskPopover :item="item" />
						</HomeStateMain>
					</div>
					<!-- 包含6个磁盘的平铺区域 -->
					<div :style="getComponentStyle('disk-area')" class="state-component">
						<div class="module-ui rounded-medium p-[2.4rem]" :style="{ height: stateHeight }">
							<div class="disk-grid grid gap-4 w-full box-border" style="grid-template-columns: repeat(3, minmax(0, 1fr))">
								<HomeStateDiskPopoverExtends :list="disk.slice(disk.length - 6)" :is-show-all-disk="isShowAllDisk" />
							</div>
						</div>
					</div>
				</template>

				<!-- 磁盘区域 (堆叠/平铺模式) -->
				<template v-else>
					<div :style="getComponentStyle('disk-area')" class="state-component">
						<template v-if="displayMode === 'stack'">
							<HomeStateDiskMain :list="disk" class="bg-white shadow rounded" :style="{ height: stateHeight }" />
						</template>
						<template v-else-if="displayMode === 'tile'">
							<div class="module-ui rounded-medium p-[2.4rem]" :style="{ height: isShowAllDisk ? 'auto' : stateHeight }">
								<div class="disk-grid grid gap-4 w-full box-border h-full" :style="{ 'grid-template-columns': 'repeat(auto-fill, minmax(220px, 1fr))' }">
									<HomeStateDiskPopoverExtends :list="isShowAllDisk ? disk : disk.slice(0, 6)" :is-show-all-disk="isShowAllDisk" />
								</div>
							</div>
						</template>
					</div>
				</template>
			</div>
		</div>

		<div v-else-if="globalTheme.home.overview_view === 'tile'" class="module-ui mb-[1.2rem]">
			<div class="module-ui-header">
				<div class="flex w-full justify-between">
					<span class="font-alibaba-semibold">状态</span>
				</div>
			</div>
			<div class="module-ui-body mt-[1.2rem]">
				<el-row :span="24" class="w-full">
					<!-- 负载状态 -->
					<el-col class="state-component" :span="4" :xs="12" :sm="6" :md="6" :lg="4" :xl="4">
						<HomeStateMain :info="loadInfo" @show="store.moveStatePopover(loadPopover, 'loadPopover')" @hide="store.removeStatePopover" :href="'https://www.bt.cn/bbs/thread-11402-1-1.html'">
							<HomeStatePopover :load-type="'loadInfo'" ref="loadPopover" :type="'load'" :process-alarm-show="processAlarmShow">
								<template #button>
									<div class="flex items-center justify-between mb-[1.2rem] leading-[2.8rem]">
										<div class="flex items-center">
											<span class="text-secondary text-base mr-[4px] ml-[8px]">检测到当前负载</span>
											<el-tag :type="tagsType.load">{{ `运行达到${loadInfo.range}%` }}</el-tag>
										</div>
									</div>
								</template>
								<template #base-info>
									<div class="disk-body-list flex justify-between">
										<div>最近1/5/15分钟平均负载：</div>
										<div id="load_one">
											{{ createCpuLoadInfo }}
										</div>
									</div>
									<div class="disk-body-list flex justify-between">
										<div>活动进程数 / 总进程数:</div>
										<div id="load_cpu_times_num">
											{{ createCpuProcessInfo }}
										</div>
									</div>
								</template>
								<template #content-info>
									<div class="disk-item-body" id="other_info_html">
										<table class="table table-fixed whitespace-nowrap">
											<tbody>
												<tr v-for="(item, index) in loadInfoList" :key="index">
													<template v-for="(items, indexs) in item" :key="indexs">
														<td :title="items.title" class="break-all text-ellipsis p-[.4rem] pl-0">
															<span>{{ items.name }}</span>
														</td>
														<td :title="items.title" class="break-all text-ellipsis">
															<span>{{ items.value }}</span>
														</td>
													</template>
												</tr>
											</tbody>
										</table>
									</div>
								</template>
							</HomeStatePopover>
						</HomeStateMain>
					</el-col>

					<!-- CPU使用率 -->
					<el-col class="state-component" :span="4" :xs="12" :sm="6" :md="6" :lg="4" :xl="4">
						<HomeStateMain :info="cpuInfo" :type="'cpu'" @show="store.moveStatePopover(cpuPopover, 'cpuPopover')" @hide="store.removeStatePopover">
							<HomeStatePopover :load-type="'cpuInfo'" :type="'cpu'" ref="cpuPopover" :process-alarm-show="processAlarmShow">
								<template #button>
									<div class="flex items-center justify-between mb-[1.2rem] leading-[2.8rem]">
										<div class="flex items-center">
											<span class="text-secondary text-base mr-[4px] ml-[8px]">检测到当前CPU使用率</span>
											<el-tag :type="tagsType.cpu">{{ `占用${cpuInfo.range}%` }}</el-tag>
										</div>
									</div>
								</template>
								<template #content-info>
									<div class="max-h-[8.2rem] overflow-y-auto">
										<div v-for="(value, key) in cpuCoreDesc" :key="key" class="flex direction-row items-center justify-between my-[1rem]">
											<span>{{ value.name }}</span>
											<span>{{ value.value }}</span>
										</div>
									</div>
								</template>
								<template #base-info>
									<p>{{ cpu.framework }}</p>
									<p>
										{{ `${cpu.cpuNumber}个物理CPU，${cpu.logicCores}个物理核心，${cpu.cores}个逻辑核心` }}
									</p>
								</template>
							</HomeStatePopover>
						</HomeStateMain>
					</el-col>

					<!-- 内存使用率 -->
					<el-col class="state-component" :span="4" :xs="12" :sm="6" :md="6" :lg="4" :xl="4">
						<HomeStateMain :type="'mem'" :info="memoryInfo" @show="store.moveStatePopover(memoryPopover, 'memoryPopover')" @hide="store.removeStatePopover">
							<HomeStatePopover :load-type="'memoryInfo'" :type="'mem'" ref="memoryPopover" :process-alarm-show="processAlarmShow">
								<template #button>
									<div class="flex items-center justify-between mb-[1.2rem] leading-[2.8rem]">
										<div class="flex items-center">
											<span class="text-secondary text-base mr-[4px] ml-[8px]">检测到当前内存</span>
											<el-tag :type="tagsType.memory">{{ `占用${memoryInfo.range}%` }}</el-tag>
										</div>
										<el-button type="primary" @click="store.onClearMemory">立即释放</el-button>
									</div>
								</template>
								<template #base-info>
									<div class="flex align-left flex-col">
										<div class="flex justify-between mb-[4px]">
											<div class="w-[50%]">
												<span class="w-[81px] inline-flex justify-end">空闲内存：</span>
												<span class="inline-flex justify-start">{{ memory.memFree + ' MB' }}</span>
											</div>
											<div class="w-[50%]">
												<span class="w-[81px] inline-flex justify-end">已用：</span>
												<span class="inline-flex justify-start">{{ memory.memRealUsed + ' MB' }}</span>
											</div>
										</div>
										<div class="flex justify-between mb-[4px]">
											<div class="w-[50%]">
												<span class="w-[81px] inline-flex justify-end">总内存：</span>
												<span class="inline-flex justify-start">{{ memory.memTotal + ' MB' }}</span>
											</div>
											<div class="w-[50%]">
												<span class="w-[81px] inline-flex justify-end">共享：</span>
												<span class="inline-flex justify-start">{{ memory.memShared + ' MB' }}</span>
											</div>
										</div>
										<div class="flex justify-between mb-[4px]">
											<div class="w-[50%]">
												<span class="w-[81px] inline-flex justify-end">可分配内存：</span>
												<span>{{ memory.memAvailable + 'MB' }}</span>
											</div>
											<div class="w-[50%]">
												<span class="w-[81px] inline-flex justify-end">buff/cache：</span>
												<span class="inline-flex justify-start">{{ memory.memCached + '/' + memory.memBuffers + ' MB' }}</span>
											</div>
										</div>
									</div>
								</template>
							</HomeStatePopover>
						</HomeStateMain>
					</el-col>

					<!-- 磁盘列表 -->
					<template v-for="(item, index) of disk.filter((d, i, arr) => d.data.path !== 'None' || arr.findIndex(x => x.data.path === 'None') === i)" :key="index">
						<el-col class="state-component" :span="4" :xs="12" :sm="6" :md="6" :lg="4" :xl="4">
							<!-- 当存在两个None 未挂载磁盘时，只显示一个 -->
							<HomeStateMain type="disk" :info="item.info" @hide="store.removeStatePopover" :data="item.data" :alert="item.data.path === 'None' ? false : parseInt(item.data.inodes[3]) === 100">
								<HomeStateDiskPopover :item="item" />
							</HomeStateMain>
						</el-col>
					</template>
				</el-row>
			</div>
		</div>
	</div>
</template>

<script lang="tsx" setup>
import HomeStatePopover from './popover/popover-content.vue'
import HomeStateDiskPopover from './popover/disk-popover.vue'
import HomeStateDiskPopoverExtends from './popover/disk-popover-extends.vue'
// import HomeStateMain from './popover/main.vue'
// import HomeStateDiskMain from './popover/disk-main.vue'
import { delayExecAsync } from '@/public/index'
import { storeToRefs } from 'pinia'
import HOME_STATE_STORE from './store'
import { effect, computed, watch } from 'vue'
import { useResizeObserver } from '@vueuse/core'
import { useGlobalStore } from '@/store/global'

const LAYOUT_CACHE_KEY = 'home_state_layout_cache'
const { globalTheme } = useGlobalStore()
const HomeStateMain = defineAsyncComponent(() => {
	if (globalTheme.value.home.overview_view === 'default') return import('./popover/main.vue')
	return import('./popover/main-tile.vue')
})
const HomeStateDiskMain = defineAsyncComponent(() => {
	if (globalTheme.value.home.overview_view === 'default') return import('./popover/disk-main.vue')
	return import('./popover/disk-main-tile.vue')
})
/**
 * @description 定义props
 */
const props = defineProps<{ mainWidth?: number }>()

const loadRef = ref<HTMLElement | null>(null)
const effectiveMainWidth = ref(0)

useResizeObserver(loadRef, entries => {
	if (!entries[0]) return
	const { width } = entries[0].contentRect
	effectiveMainWidth.value = width
})

/**
 * @description 缓存布局状态
 */
const layoutCache = {
	diskCount: -1,
	containerWidth: -1,
}

/**
 * @description 基础参数
 */
const layoutParams = {
	baseComponentCount: 3, // 基础组件数量 (负载, CPU, 内存)
	minElementWidth: 235, // 单个组件的最小宽度 (px)
	elementGap: 12, // 组件之间的间距 (px)
	stackMinWidth: 460, // 堆叠模式下磁盘区域的最小宽度 (px)
	stackMaxWidth: 650, // 堆叠模式下磁盘区域的最大宽度 (px)
	tileMinWidth: 600, // 平铺模式下磁盘区域的最小宽度 (px)
	tileMaxWidth: 800, // 平铺模式下磁盘区域的最大宽度 (px)
	defaultContainerWidth: 1200, // 默认容器宽度
	maxSingleLineComponents: 6, // 单行最大组件数量
	maxHybridDisks: 6, // 混合模式最大磁盘数量
}

/**
 * @description 获取store
 */
const store = HOME_STATE_STORE()
const { stateMainWidth, gutter, displayMode, stateHeight, isBreakLines, isShowAllDisk, cpuCoreDesc, statePopoverTimr, loadInfo, loadPopover, processAlarmShow, tagsType, load, cpu, loadInfoList, cpuInfo, cpuPopover, memoryInfo, memoryPopover, memory, disk } = storeToRefs(store)

const stateMainRef = ref<HTMLElement | null>(null)

useResizeObserver(stateMainRef, entries => {
	const entry = entries[0]
	const { width } = entry.contentRect
	stateMainWidth.value = width
})

const shouldWrapBaseComponents = computed(() => displayMode.value === 'single' && isBreakLines.value)

// 从会话存储中恢复布局缓存
const cachedLayout = sessionStorage.getItem(LAYOUT_CACHE_KEY)
if (cachedLayout) {
	try {
		const parsedLayout = JSON.parse(cachedLayout)
		displayMode.value = parsedLayout.displayMode
		stateHeight.value = parsedLayout.stateHeight
		isBreakLines.value = parsedLayout.isBreakLines
		isShowAllDisk.value = parsedLayout.isShowAllDisk
	} catch (e) {
		console.error('Failed to parse layout cache from sessionStorage', e)
		sessionStorage.removeItem(LAYOUT_CACHE_KEY)
	}
}

/**
 * @description 更新并缓存布局状态
 */
const updateAndCacheLayout = (mode: string, height: string, breakLines: boolean, showAll: boolean) => {
	displayMode.value = mode
	stateHeight.value = height
	isBreakLines.value = breakLines
	isShowAllDisk.value = showAll

	const layoutInfo = {
		displayMode: mode,
		stateHeight: height,
		isBreakLines: breakLines,
		isShowAllDisk: showAll,
	}
	try {
		sessionStorage.setItem(LAYOUT_CACHE_KEY, JSON.stringify(layoutInfo))
	} catch (e) {
		console.error('Failed to save layout cache to sessionStorage', e)
	}
}

/**
 * @description 初始化状态区域的显示模式
 * 根据容器宽度和磁盘数量动态调整布局模式，使用实际尺寸而非栅格系统
 */
const initDisplayMode = () => {
	// --- 基础参数定义 ---
	const containerWidth = stateMainWidth.value || props.mainWidth || layoutParams.defaultContainerWidth // 容器宽度
	const diskCount = (disk.value || []).length // 磁盘数量

	// 缓存检查：如果磁盘数量和容器宽度没有变化，则跳过计算
	if (layoutCache.diskCount === diskCount && layoutCache.containerWidth === containerWidth) {
		return
	}
	// 立即更新缓存，以确保后续所有分支的正确性
	layoutCache.diskCount = diskCount
	layoutCache.containerWidth = containerWidth

	const baseComponents = layoutParams.baseComponentCount // 负载、CPU、内存
	const totalElements = baseComponents + diskCount // 总元素数
	const minElementWidth = layoutParams.minElementWidth // 单元素最小宽度 (px)
	const elementGap = layoutParams.elementGap // 元素间距 (px)

	// --- 计算所需的最小宽度 ---
	// 单列模式所需宽度 = 元素最小宽度 * 元素数 + 间距 * (元素数 - 1)
	const singleModeRequiredWidth = minElementWidth * totalElements + elementGap * (totalElements - 1)

	// 模式判断和应用 ---

	// 模式1：尝试单列模式（不换行）
	// 条件：容器宽度足够容纳所有组件在一行显示
	if (containerWidth >= singleModeRequiredWidth) {
		const actualComponentWidth = (containerWidth - elementGap * (totalElements - 1)) / totalElements

		// 检查：单元素实际宽度是否满足最小要求
		if (actualComponentWidth >= minElementWidth) {
			updateAndCacheLayout('single', '18rem', false, false)
			return
		}
	}

	// 模式2：堆叠磁盘模式 (磁盘数量2-4个)
	// 条件：磁盘数量在范围内 且 容器宽度足够支撑复杂模式
	if (diskCount >= 2 && diskCount <= 4) {
		const complexModeRequiredWidth = minElementWidth * baseComponents + layoutParams.stackMinWidth + elementGap * baseComponents
		if (containerWidth >= complexModeRequiredWidth) {
			const baseComponentWidth = (containerWidth - layoutParams.stackMinWidth - elementGap * baseComponents) / baseComponents

			// 检查：基础组件宽度是否满足最小要求
			if (baseComponentWidth >= minElementWidth) {
				updateAndCacheLayout('stack', '22rem', false, false)
				return
			}
		}
	}

	// 模式3：平铺模式 (磁盘数量5-6个)
	if (diskCount >= 5 && diskCount <= 6) {
		const complexModeRequiredWidth = minElementWidth * baseComponents + layoutParams.tileMinWidth + elementGap * baseComponents
		if (containerWidth >= complexModeRequiredWidth) {
			updateAndCacheLayout('tile', '22rem', false, false)
			return
		}
	}

	// 模式4：针对超过6个磁盘的特殊处理 (混合模式 或 换行平铺)
	if (diskCount > 6) {
		// 计算混合模式所需宽度
		const numExtractedDisks = diskCount - 6
		const numHybridTopLevelComponents = baseComponents + numExtractedDisks + 1 // 基础组件 + 独立磁盘 + 1个平铺区域
		const hybridRequiredWidth = (numHybridTopLevelComponents - 1) * elementGap + (baseComponents + numExtractedDisks) * minElementWidth + layoutParams.tileMinWidth

		if (containerWidth >= hybridRequiredWidth) {
			// 宽度足够，应用混合模式
			updateAndCacheLayout('hybrid', '22rem', false, true)
			return
		} else {
			// 宽度不足，应用换行平铺模式
			updateAndCacheLayout('tile', '18rem', true, true)
			return
		}
	}

	// 模式5：标准换行模式（所有其他情况的回退方案）
	const showAll = diskCount > 6
	updateAndCacheLayout('single', '18rem', true, showAll)
}

/**
 * @description 生成cpu负载信息
 */
const createCpuLoadInfo = computed(() => {
	return `${load.value.one.toFixed(2)} / ${load.value.five.toFixed(2)} / ${load.value.fifteen.toFixed(2)}`
})

/**
 * @description 生成进程信息
 */
const createCpuProcessInfo = computed(() => {
	const { process } = cpu.value
	if (!Array.isArray(process)) return `获取中`
	return `${process[0]} / ${process[1]}`
})

// 响应式更新显示模式
effect(initDisplayMode)

// 清除首页状态缓存
watch(
	() => statePopoverTimr.value,
	(oldVal, newVal) => {
		clearInterval(oldVal)
	},
	{ immediate: true }
)

/**
 * @description 监听磁盘数量和容器宽度的变化
 */
watch(
	() => [(disk.value || []).length, stateMainWidth.value],
	([newDiskCount, newContainerWidth]) => {
		if (newContainerWidth === 0) return // 避免在宽度重置时触发不必要的计算
		const cacheNeedsUpdate = layoutCache.diskCount !== newDiskCount || layoutCache.containerWidth !== newContainerWidth

		if (cacheNeedsUpdate) {
			const { baseComponentCount, minElementWidth, elementGap, stackMinWidth, tileMinWidth } = layoutParams
			const totalBaseWidth = baseComponentCount * minElementWidth + (baseComponentCount - 1) * elementGap
			const remainingWidthForDisks = newContainerWidth - totalBaseWidth - elementGap
			const maxDisksInSingleLine = Math.floor(remainingWidthForDisks / (minElementWidth + elementGap))

			let newMode = 'single'
			if (newDiskCount > maxDisksInSingleLine) {
				if (newDiskCount >= 5) {
					newMode = newContainerWidth >= totalBaseWidth + tileMinWidth ? 'tile' : 'stack'
				} else {
					newMode = newContainerWidth >= totalBaseWidth + stackMinWidth ? 'stack' : 'single'
				}
			}

			// 混合模式决策
			if (newDiskCount > 6 && newMode !== 'single') {
				const numExtractableDisks = newDiskCount - 6
				const flexibleSpace = newContainerWidth - tileMinWidth - (baseComponentCount + numExtractableDisks + 1) * elementGap
				const widthPerFlexibleComponent = flexibleSpace / (baseComponentCount + numExtractableDisks)
				if (widthPerFlexibleComponent >= minElementWidth) {
					newMode = 'hybrid'
				}
			}
			updateAndCacheLayout(newMode, stateHeight.value, isBreakLines.value, isShowAllDisk.value)
			layoutCache.diskCount = newDiskCount
			layoutCache.containerWidth = newContainerWidth
		}
	},
	{ immediate: true, deep: true }
)

onMounted(async () => {
	delayExecAsync({
		promises: [store.getProcessAlarm], // 获取进程告警
		delay: 1000,
	})
	initDisplayMode()
})

onUnmounted(store.$reset)

/**
 * @description 获取组件的样式（宽度、flex等）
 * 根据显示模式和组件类型计算实际尺寸，换行模式下使用等比例分配
 */
const getComponentStyle = (componentType: string) => {
	const containerWidth = stateMainWidth.value || props.mainWidth || layoutParams.defaultContainerWidth
	const gap = layoutParams.elementGap

	// 调试信息
	if (displayMode.value !== 'single') {
	}

	if (displayMode.value === 'single') {
		if (isBreakLines.value) {
			// 在换行模式下，所有组件共享布局计算逻辑
			const totalComponents = layoutParams.baseComponentCount + (disk.value || []).length
			const componentsPerRow = calculateOptimalComponentsPerRow(containerWidth, totalComponents, gap)
			const flexBasis = `calc((100% - ${gap * (componentsPerRow - 1)}px) / ${componentsPerRow})`
			return {
				flex: `1 0 ${flexBasis}`,
				minWidth: `${layoutParams.minElementWidth}px`,
			}
		} else {
			// 单列模式：所有组件等宽，不换行
			const totalComponents = layoutParams.baseComponentCount + (disk.value || []).length
			const availableWidth = containerWidth - gap * (totalComponents - 1)
			const componentWidth = Math.floor(availableWidth / totalComponents)
			const minWidth = Math.max(componentWidth, layoutParams.minElementWidth)

			return {
				width: `${minWidth}px`,
				minWidth: `${layoutParams.minElementWidth}px`,
				flexShrink: 0,
			}
		}
	} else if (displayMode.value === 'hybrid') {
		const numExtractedDisks = (disk.value || []).length - 6
		const numFlexibleComponents = layoutParams.baseComponentCount + numExtractedDisks
		const totalHybridComponents = numFlexibleComponents + 1 // +1 for the disk-area
		const totalGapsWidth = (totalHybridComponents - 1) * gap

		if (componentType === 'disk-area') {
			// 混合模式下的磁盘区域使用固定的最小宽度
			return {
				width: `${layoutParams.tileMinWidth}px`,
				minWidth: `${layoutParams.tileMinWidth}px`,
				flexShrink: 0,
			}
		} else {
			// 混合模式下的基础组件和独立磁盘，平分剩余空间
			const availableWidthForFlexible = containerWidth - layoutParams.tileMinWidth - totalGapsWidth
			const flexibleComponentWidth = Math.floor(availableWidthForFlexible / numFlexibleComponents)
			const finalWidth = Math.max(flexibleComponentWidth, layoutParams.minElementWidth)

			return {
				width: `${finalWidth}px`,
				minWidth: `${layoutParams.minElementWidth}px`,
				flexShrink: 0,
			}
		}
	} else {
		if (isBreakLines.value) {
			return { width: '100%' }
		}
		// 堆叠/平铺模式：基础组件和磁盘区域使用精确计算避免换行
		const currentMinWidth = displayMode.value === 'stack' ? layoutParams.stackMinWidth : layoutParams.tileMinWidth
		const currentMaxWidth = displayMode.value === 'stack' ? layoutParams.stackMaxWidth : layoutParams.tileMaxWidth
		const { baseComponentCount, minElementWidth } = layoutParams
		const totalGapsWidth = gap * baseComponentCount

		const availableForDisk = containerWidth - minElementWidth * baseComponentCount - totalGapsWidth
		const diskWidth = Math.max(currentMinWidth, Math.min(availableForDisk, currentMaxWidth))

		const availableForBase = containerWidth - diskWidth - totalGapsWidth
		let baseComponentWidth = availableForBase / baseComponentCount
		if (baseComponentWidth < minElementWidth) {
			baseComponentWidth = minElementWidth
		}

		if (componentType === 'disk-area') {
			return {
				width: `${diskWidth}px`,
				minWidth: `${currentMinWidth}px`,
				flexShrink: 0,
			}
		} else {
			return {
				width: `${baseComponentWidth}px`,
				minWidth: `${minElementWidth}px`,
				flexShrink: 0,
			}
		}
	}
}

/**
 * @description 计算最佳的每行组件数量
 * 根据容器宽度和组件最小宽度，计算出最佳的每行显示数量
 */
const calculateOptimalComponentsPerRow = (containerWidth: number, totalComponents: number, gap: number) => {
	const minComponentWidth = layoutParams.minElementWidth

	// 从最多组件数开始尝试，找到能够容纳的最大数量
	for (let componentsPerRow = Math.min(totalComponents, 6); componentsPerRow >= 1; componentsPerRow--) {
		const requiredWidth = minComponentWidth * componentsPerRow + gap * (componentsPerRow - 1)
		if (requiredWidth <= containerWidth) {
			return componentsPerRow
		}
	}

	return 1 // 最少1个组件per行
}
</script>

<style lang="css" scoped>
/* 状态容器样式 - 优化flex布局支持等比例换行 */
.state-container {
	width: 100%;
	display: flex;
	gap: 1.2rem;
	margin-bottom: 1.2rem;
	align-items: stretch; /* 确保同行元素高度一致 */
}

.state-component {
	display: flex;
	flex-direction: column;
	transition: all 0.3s ease;
	min-width: 0; /* 防止flex子项收缩问题 */
}

/* 换行模式优化 - 确保最后一行也能充满 */
.state-container:has(.state-component:nth-child(n + 7)) .state-component {
	/* 当有7个或更多组件时，应用换行优化 */
	box-sizing: border-box;
}

/* 响应式处理 - 优化小屏幕显示 */
@media (max-width: 1024px) {
	.state-container {
		gap: 1rem;
	}
}

@media (max-width: 768px) {
	.state-container {
		gap: 0.8rem;
	}

	.state-component {
		min-width: 280px !important;
		flex-basis: calc(50% - 0.4rem) !important; /* 小屏幕每行2个 */
		width: 100% !important;
		/* width: calc(50% - 0.4rem) !important; */
		/* max-width: calc(50% - 0.4rem) !important; */
		flex: 1;
	}
}

@media (max-width: 576px) {
	.state-container {
		gap: 0.6rem;
	}

	.state-component {
		min-width: 250px !important;
		flex-basis: 100% !important; /* 超小屏幕每行1个 */
		max-width: 100% !important;
	}
}

/* 确保flex项目在换行时保持良好的布局 */
@supports (flex-basis: calc(1px)) {
	.state-component {
		/* 现代浏览器使用calc支持精确计算 */
		box-sizing: border-box;
	}
}

@keyframes shineGreen {
	from {
		box-shadow: 0 0 10px #999;
	}
	50% {
		box-shadow: 0 0 15px var(--el-color-primary);
	}
	to {
		box-shadow: 0 0 10px #999;
	}
}

@keyframes move-in {
	0% {
		transform: translateY(15px);
	}
	100% {
		transform: translateY(0px);
	}
}

.move-enter-active {
	animation: move-in 0.5s;
}

.move-leave-active {
	animation: move-in 0.5s reverse;
}

.memory-box {
	@apply absolute top-0 left-0 w-[10.2rem] h-[10.2rem] rounded-full -mt-[10.4rem] ml-0;
	animation-name: shineGreen;
	animation-duration: 3s;
	animation-iteration-count: infinite;
}

.memory-box::before {
	@apply content-[''] absolute top-[7px] left-[7px] right-[7px] bottom-[7px] block rounded-full;
	background: rgba(var(--el-color-white-rgb), 0.8);
}

.memory-icon {
	@apply relative w-full h-full;
	background: url('#{$other-path}/ico-rocket.gif') no-repeat center center;
}

.shadow_div {
	box-shadow: 0px 1px 20px rgba(var(--el-color-black-rgb), 0.2);
}

:deep(.el-table) {
	overflow: auto !important;
}

.table {
	width: 100%;
	max-width: 100%;
	background-color: transparent;
	border-spacing: 0;
	border-collapse: collapse;
}
.table > tbody > tr > td {
	vertical-align: middle;
	line-height: 1.42857143;
}

.home-state-disk-collapse :deep(.el-collapse-item__content) {
	padding: 0 !important;
}
.home-state-disk-collapse :deep(.el-collapse-item__header),
.home-state-disk-collapse :deep(.el-collapse-item__wrap) {
	color: var(--el-color-text-primary) !important;
	border-bottom: none !important;
}
.home-state-disk-collapse :deep(.el-collapse-item__wrap) {
	overflow: visible;
}
.home-state-disk-collapse :deep(.el-collapse-item__header) {
	@apply text-large !font-bold text-default h-[4rem] !leading-[2rem];
}

.home-state-disk-collapse :deep(.el-collapse-item__arrow) {
	@apply !mr-0 !text-default;
}
/* 动态省略号 */
.omit {
	display: inline-block;
}
.omit::after {
	content: '';
	animation: ellipsis 2s infinite;
}
@keyframes ellipsis {
	0% {
		content: '';
	}

	25% {
		content: '.';
	}

	50% {
		content: '..';
	}

	75% {
		content: '...';
	}

	100% {
		content: '';
	}
}

.bt-ico-ask {
	display: none;
	font-size: var(--el-font-size-extra-small);
	line-height: 14px;
	height: 14px;
	width: 14px;
	margin-left: 2px;
}
</style>
