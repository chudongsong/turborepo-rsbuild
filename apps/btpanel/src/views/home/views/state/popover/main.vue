<template>
	<div class="module-ui relative">
		<el-popover trigger="hover" :virtual-ref="virtualRef" :width="400" :offset="custom ? 1 : 0" :placement="param.position" :teleported="false" :show-after="100" :auto-close="0" popper-class="el-popover-shadow" @show="$emit('show')" @hide="$emit('hide')">
			<template #reference>
				<div ref="popoverContent" class="flex flex-row items-end justify-between w-full h-full">
					<!-- 描述 -->
					<div class="flex flex-shrink-0 w-full">
						<div class="flex flex-col justify-end flex-shrink-0 w-full home-load-status-title">
							<span class="pb-[.6rem] text-base truncate block w-[50%] font-alibaba-semibold" :title="param.title">{{ param.title }}</span>
							<span class="text-extraLarge text-default font-alibaba-heavy 2xl:text-subtitleLarge whitespace-nowrap" :style="{ fontSize: `var(--bt-home-overview-font-size)` }" v-show="showDesc">
								<template v-if="typeof param.desc === 'object' && (param.type === 'disk' || param.type === 'mem')">
									<span :style="{ color: param.color }">
										<span>{{ param.desc?.used }}</span>
										<span class="text-small">{{ param.desc?.used_unit }}</span>
									</span>
									<span> / </span>
									<span>{{ param.desc?.total }}</span>
									<span class="text-small">{{ param.desc?.total_unit }}</span>
								</template>
								<template v-else>
									{{ param.desc }}
								</template>
							</span>
						</div>
					</div>

					<!-- 进度条 -->
					<el-progress v-popover:popover class="status-main-progress" type="circle" :width="computedProgressWidth" :class="{ 'mount-progress': data.path === 'None' }" :stroke-width="8" :color="param.color" :percentage="param.range || 0" :format="progressFormat" :style="'color:' + param.color">
						<template #default="{ percentage }">
							<div class="flex flex-col items-center text-small font-alibaba-semibold">
								<span class="percentage-value" :style="{ color: param.color }">
									<span class="font-800 md:text-subtitleLarge lg:text-iconLarge 2xl:text-titleLarge">{{ Number(percentage).toFixed(0) }}</span
									>%
								</span>
							</div>
						</template>
					</el-progress>
				</div>
			</template>
			<slot></slot>
		</el-popover>
	</div>
</template>

<script lang="ts" setup>
import type { StateInfo } from '@home/types'

import { storeToRefs } from 'pinia'
import HOME_STATE_POPOVER_STORE from './store'
import HOME_STATE_STORE from '../store'

const HomeStore = HOME_STATE_STORE()
const { tagsType } = storeToRefs(HomeStore)

interface Prop {
	visible?: boolean
	custom?: boolean
	showDesc?: boolean
	href?: string
	info: StateInfo
	disk?: boolean
	data?: any
	type?: string
	alert?: boolean
	mainWidth?: number
}

const props = withDefaults(defineProps<Prop>(), {
	visible: false,
	custom: false,
	showDesc: true,
	disabled: false,
	type: '',
	href: '',
	data: () => ({}),
	info: () => ({
		type: '',
		title: '',
		range: 0,
	}),
	disk: false,
	alert: false,
	mainWidth: 200,
})

const emits = defineEmits(['update:visible', 'openPopover', 'show', 'hide'])

const store = HOME_STATE_POPOVER_STORE()
const { virtualRef, popoverContent } = storeToRefs(store)

/**
 * @description 计算进度条宽度
 * 基于组件实际宽度动态计算，确保在不同布局下都有合适的显示效果
 */
const computedProgressWidth = computed(() => {
	const componentWidth = props.mainWidth || 200 // 使用传入的组件实际宽度
	// 根据组件宽度计算合适的进度条尺寸
	// 较小的组件使用较小的进度条，较大的组件使用较大的进度条
	let progressSize = 0

	if (componentWidth <= 200) {
		// 小尺寸组件：进度条80-100px（增加20px）
		progressSize = Math.max(80, Math.min(100, Math.floor(componentWidth * 0.35) - 20))
	} else if (componentWidth <= 300) {
		// 中等尺寸组件：进度条100-120px（增加20px）
		progressSize = Math.max(100, Math.min(120, Math.floor(componentWidth * 0.33) - 20))
	} else {
		// 大尺寸组件：进度条120-140px（增加20px）
		progressSize = Math.max(120, Math.min(140, Math.floor(componentWidth * 0.3) - 20))
	}

	return progressSize
})

// 进度条参数
const param = computed<StateInfo>(() => {
	const { info, alert } = props
	const { desc, title, range, rangeText, disabled, type } = info
	const colorData = store.chartColorActive(range, alert)
	let descInfo = desc as any
	let { color } = colorData
	if (props.type === 'disk') {
		if (color === 'var(--el-color-primary)') {
			const { data } = props
			if (Number(data.inodes[3].replace('%', '')) > 90) {
				color = '#ef0808'
			} else if (Number(data.inodes[3].replace('%', '')) > 80) {
				color = '#ff9900'
			} else {
				color = 'var(--el-color-primary)'
			}
		} else {
		}
	}
	if (typeof desc === 'object' && (type === 'disk' || type === 'mem')) {
		try {
			descInfo = {
				used: desc.used ? desc.used : '0',
				used_unit: desc.used_unit ? desc.used_unit : '0',
				total: desc.total ? desc.total : '0',
				total_unit: desc.total_unit ? desc.total_unit : '0',
			}
		} catch (error) {
			descInfo = '获取中'
		}
	}
	return {
		type,
		title,
		color,
		range,
		disabled: !!disabled,
		desc: descInfo ? descInfo : colorData.desc,
		rangeText: rangeText || '',
		position: 'bottom-start',
	}
})

/**
 * @description 进度条格式化
 * @param {any} percentage 进度条百分比
 */
const progressFormat = (percentage: any) => {
	const { rangeText } = param.value
	return rangeText ? rangeText : `${percentage}%`
}

// 动态背景色，仅在负载且为 warning/danger 时生效
const loadBgStyle = computed(() => {
	if (isLoadWarningOrDanger.value) {
		// 暂时隐藏,后续再考虑
		// if (tagsType.value.load === 'danger') {
		// 	return { backgroundColor: '#fd500b' }
		// } else if (tagsType.value.load === 'warning') {
		// 	return { backgroundColor: '#ff8400' }
		// }
		return { backgroundColor: param.value.color }
	}
	return {}
})

// 判断为负载时
const isLoadWarningOrDanger = computed(() => param.value.type === 'load' && tagsType.value.load !== 'success')

onMounted(() => {
	store.init()
})

onUnmounted(() => {
	store.$reset()
})
</script>

<style lang="css" scoped>
/* // 修改进度条底色 */
.mount-progress :deep(.el-progress-circle__track) {
	stroke: #dfede2;
}
.home-load-status {
	position: relative;
}
.home-load-status::before {
	content: '';
	position: absolute;
	inset: 0;
	background-image: url('/static/images/home/home-load-transparent-bg.png');
	background-position: 0 65%;
	background-size: cover;
	background-repeat: repeat;
	opacity: 0.2;
	pointer-events: none;
	z-index: 0;
	border-radius: var(--el-border-radius-round);
	filter: grayscale(100) hue-rotate(10deg);
}
.home-load-status .home-load-status-title {
	color: var(--el-color-white);
	span {
		color: var(--el-color-white);
	}
}

/**
 * 磁盘主进度条
 */
.status-main-progress {
	@apply cursor-pointer !absolute right-[6%] top-[6%] 2xl:relative;
}

@media screen and (max-width: 2000px) {
	.status-main-progress {
		position: absolute !important;
		right: 10%;
		top: 10%;
	}
}
</style>
