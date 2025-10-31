<template>
	<div class="module-ui flex">
		<div class="flex flex-row items-end justify-between w-full">
			<el-row :span="24" class="w-full">
				<!-- 磁盘列表 -->
				<el-col :span="16" :xl="16">
					<div class="h-full flex-2 gap-y-[10px]" :class="list.length === 2 ? 'grid grid-cols-1 grid-rows-2' : 'grid grid-cols-2 grid-rows-2'">
						<template v-for="(data, idx) in list" :key="data.info.title + '-' + idx">
							<el-popover trigger="hover" :width="400" placement="bottom-start" :teleported="false" popper-class="el-popover-shadow" :hide-after="0" @show="debounceSetActiveIndex(idx)" @hide="debounceSetActiveIndex(null)">
								<template #reference>
									<div class="flex flex-col justify-end cursor-pointer" :class="{ 'is-inactive': activeIndex !== null && activeIndex !== idx }">
										<span class="pb-[.6rem] text-base truncate block disk-list-title">{{ data.info.title }}</span>
										<span class="text-subtitleLarge font-700 leading-[1.2] disk-list-range" :style="{ color: progressStyle(data, idx) }">{{ data.info.range }}%</span>
										<span class="text-base text-secondary font-400 font-alibaba-bold disk-list-desc">
											<template v-if="typeof data.info.desc === 'object' && data.info.type === 'disk'">
												<span :style="{ color: data.info.color }">
													<span>{{ data.info.desc?.used }}{{ data.info.desc?.used_unit }}</span>
												</span>
												<span>/</span>
												<span>{{ data.info.desc?.total }}{{ data.info.desc?.total_unit }} </span>
											</template>
											<template v-else>
												{{ data.info.desc }}
											</template>
										</span>
									</div>
								</template>
								<HomeStateDiskPopover :item="data" />
							</el-popover>
						</template>
					</div>
				</el-col>

				<!-- 进度条 -->
				<el-col :span="8" :xl="8">
					<div class="flex flex-col justify-center items-center h-full">
						<div class="flex relative" :style="{ width: pWidth + 'px', height: pWidth + 'px' }">
							<template v-for="(data, index) in list" :key="data.info.title">
								<el-popover trigger="hover" :width="400" placement="bottom-start" :teleported="false" popper-class="el-popover-shadow" :show-after="100" :hide-after="0" transition="none" @show="debounceSetActiveIndex(index)" @hide="debounceSetActiveIndex(null)">
									<template #reference>
										<div class="flex absolute" :style="progressPosition(index)">
											<el-progress class="cursor-pointer" type="circle" :show-text="false" :class="{ 'mount-progress': data.data.path === 'None' }" :width="progressWidth(index)" :stroke-width="strokeWidth" :color="progressStyle(data, index)" :percentage="data.info.range || 0" />
										</div>
									</template>
									<HomeStateDiskPopover :item="data" />
								</el-popover>
							</template>
						</div>
					</div>
				</el-col>
			</el-row>
		</div>

		<!-- <el-popover trigger="hover" :virtual-ref="virtualRef" :width="200" :offset="custom ? 1 : 0" :placement="param.position" :teleported="false" :show-after="100" :auto-close="0" popper-class="el-popover-shadow" @show="$emit('show')" @hide="$emit('hide')"> -->
		<!-- <template #reference> -->
		<!-- <div ref="popoverContent" class="flex flex-row items-end justify-between w-full"> -->
		<!-- 描述 -->
		<!-- <div class="flex h-full">
						<div class="flex flex-col justify-end">
							<span class="pb-[.2rem] text-base">{{ param.title }}</span>
							<span class="text-subtitleLarge text-default font-900 font-alibaba-bold" v-show="showDesc">
								<template v-if="typeof param.desc === 'object' && (param.type === 'disk' || param.type === 'mem')">
									<span :style="{ color: param.color }">
										<span>{{ param.desc?.used }}</span>
										<span class="text-small">{{ param.desc?.used_unit }}</span>
									</span>
									<span>/</span>
									<span>{{ param.desc?.total }}</span>
									<span class="text-small">{{ param.desc?.total_unit }}</span>
								</template>
								<template v-else>
									{{ param.desc }}
								</template>
							</span>
						</div>
					</div> -->

		<!-- 进度条 -->
		<!-- <template v-for="disk in list" :key="disk.path"> </template>
					<el-progress v-popover:popover class="cursor-pointer" :class="{ 'mount-progress': data.path === 'None' }" type="circle" :width="116" :stroke-width="8" :color="param.color" :percentage="param.range || 0" :format="progressFormat" :style="'color:' + param.color">
						<template #default="{ percentage }"> </template>
					</el-progress> -->
		<!-- </div> -->
		<!-- </template> -->
		<!-- <slot></slot> -->
		<!-- </el-popover> -->
	</div>
</template>

<script lang="ts" setup>
import type { StateInfo } from '@home/types'
import { storeToRefs } from 'pinia'
import HOME_STATE_POPOVER_STORE from './store'
import HomeStateDiskPopover from './disk-popover.vue'
import { useGlobalStore } from '@/store/global'
const { mainWidth } = useGlobalStore()
const store = HOME_STATE_POPOVER_STORE()
const { virtualRef, popoverContent } = storeToRefs(store)
interface Prop {
	list: { visible?: boolean; custom?: boolean; showDesc?: boolean; href?: string; info: StateInfo; disk?: boolean; data?: any; type?: string; alert?: boolean }[]
}

const props = withDefaults(defineProps<Prop>(), {
	list: () => [],
})

const emits = defineEmits(['update:visible', 'openPopover', 'show', 'hide'])

const pWidth = computed(() => {
	return mainWidth.value <= 1600 ? 130 : 144
})

const strokeWidth = ref(12)

const pSpacing = computed(() => {
	return strokeWidth.value + 4
})

const activeIndex = ref<number | null>(null)
let debounceTimer: ReturnType<typeof setTimeout> | null = null

function debounceSetActiveIndex(idx: number | null, delay = 120) {
	if (debounceTimer) clearTimeout(debounceTimer)
	debounceTimer = setTimeout(() => {
		activeIndex.value = idx
	}, delay)
}

onMounted(() => {
	console.log(props.list)
})

/**
 * @description 进度条样式
 * @param {any} data 数据
 * @param {number} idx 索引
 * @returns {any} 样式
 */
const progressStyle = (data: any, idx: number) => {
	if (activeIndex.value !== null && activeIndex.value !== idx) {
		return 'var(--el-fill-color-dark)'
	}
	const { range } = data.info
	if (Number(range) > 90) {
		return 'var(--el-color-danger)'
	} else if (Number(range) > 80) {
		return 'var(--el-color-warning)'
	} else {
		return 'var(--el-color-primary)'
	}
}

/**
 * @description 进度条宽度
 * @param {any[]} list 列表
 * @param {number} index 索引
 * @returns {number} 宽度
 */
const progressWidth = (index: number) => {
	return pWidth.value - index * pSpacing.value * 2
}

/**
 * @description 进度条位置
 * @param {number} index 索引
 * @returns {number} 位置
 */
const progressPosition = (index: number) => {
	const width = progressWidth(index)
	return {
		left: (pWidth.value - width) / 2 + 'px',
		top: (pWidth.value - width) / 2 + 'px',
	}
}

onMounted(() => {
	store.init()
})

onUnmounted(store.$reset)
</script>

<style lang="css" scoped>
/* // 修改进度条底色 */
.mount-progress :deep(.el-progress-circle__track) {
	stroke: var(--el-color-success-light-9);
}

.is-inactive .disk-list-title,
.is-inactive .disk-list-range,
.is-inactive .disk-list-desc {
	color: var(--el-color-text-disabled);
	opacity: 0.8;
}

/* 如有其它自定义 class 也可补充 */
</style>
