<template>
	<div class="state-data flex items-center justify-center">
		<el-popover trigger="hover" :virtual-ref="virtualRef" :width="custom ? 'auto' : disk ? 300 : 400" :offset="custom ? 1 : 0" :placement="param.position" :teleported="false" :show-after="100" :auto-close="0" popper-class="el-popover-shadow" @show="$emit('show')" @hide="$emit('hide')">
			<template #reference>
				<div ref="popoverContent" class="w-[135px] h-[180px] flex flex-col items-center">
					<!-- 进度条 -->
					<el-progress v-popover:popover class="cursor-pointer" :class="{ 'mount-progress': data.path === 'None' }" type="circle" :width="115" :stroke-width="8" :color="param.color" :percentage="param.range || 0" :format="progressFormat" :style="'color:' + param.color">
						<template #default="{ percentage }">
							<div class="flex flex-col items-center">
								<!-- 百分比 -->
								<span class="percentage-value">{{ percentage }}%</span>
							</div>
						</template>
					</el-progress>
					<!-- 进度条下方详细信息 -->
					<span v-show="showDesc" class="state-bottom">
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
					<!-- 进度条顶部信息 -->
					<div class="state-header">
						<template v-if="type === 'disk'">
							<el-tooltip effect="dark" placement="top">
								<template #content>
									<p class="pb-4px">
										<template v-if="data.path !== 'None'">
											<div>别名：{{ data.rname }}</div>
											<div>点击跳转目录</div>
										</template>
										<template v-else>
											<div>点击打开磁盘挂载插件</div>
										</template>
									</p>
								</template>
								<span class="bt-link" :style="{ color: param.color }" @click="store.dirEvent(param.title, data.path)">
									{{ param.title }}
								</span>
							</el-tooltip>
						</template>
						<template v-else>
							<el-tooltip class="item" effect="dark" v-if="href" :content="`查看${param.title}描述`" placement="top-start">
								<a class="border-dashed border-light border-b-[1px] hover:text-primary hover:border-primary" :href="href" target="_blank">{{ param.title }}</a>
							</el-tooltip>
							<span v-else class="pb-4px">{{ param.title }}</span>
						</template>
					</div>
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
		title: '',
		range: 0,
	}),
	disk: false,
	alert: false,
})

const emits = defineEmits(['update:visible', 'openPopover', 'show', 'hide'])

const store = HOME_STATE_POPOVER_STORE()
const { virtualRef, popoverContent } = storeToRefs(store)

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

onMounted(() => {
	store.init()
})

onUnmounted(store.$reset)
</script>

<style lang="css" scoped>
.state-header {
	@apply text-secondary text-base mt-[2px] mb-[8px] h-[14px]  flex justify-center items-center w-[68%] text-center truncate;
}

.state-header span {
	@apply truncate leading-22px h-[22px];
}

.state-bottom {
	@apply w-full text-secondary leading-10 h-10 text-center inline-block text-medium mt-[6px] font-black;
}

:deep(.el-progress .el-progress__text) {
	font-size: 1.8rem !important;
	color: inherit !important;
}
/* // 修改进度条底色 */
.mount-progress :deep(.el-progress-circle__track) {
	stroke: #dfede2;
}

.percentage-value {
	@apply text-subtitleLarge font-black;
}
</style>
