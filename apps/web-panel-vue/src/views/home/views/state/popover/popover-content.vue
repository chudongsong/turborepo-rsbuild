<template>
	<el-card shadow="never" class="card-popover !p-[8px]">
		<div class="">
			<slot name="button"></slot>
		</div>
		<el-collapse class="text-small" v-model="foldExpand" :accordion="true">
			<el-collapse-item ref="base-info" name="show">
				<template #title>
					<div class="flex justify-between w-full">
						<span class="px-[8px] text-secondary">{{ foldTitle.one }}</span>
					</div>
				</template>
				<div class="mt-[10px] space-y-[1rem] mx-[8px] text-secondary">
					<slot name="base-info"></slot>
				</div>
				<template v-if="!isPathNone">
					<hr style="width: calc(100% - 16px); margin: 12px auto; border-top: 1px solid var(--el-color-border-extra-light)" />
					<Alarm :type="type" class="mx-[8px]" />
				</template>
			</el-collapse-item>
		</el-collapse>
		<el-collapse v-if="!isPathNone" class="text-small" v-model="foldActive" :accordion="true">
			<el-collapse-item name="two" v-if="showTwo">
				<template #title>
					<div class="flex justify-between items-center w-full">
						<span class="px-[8px] text-secondary leading-[3rem] text-center">
							{{ foldTitle.two }}
						</span>
						<span>{{ foldActive === 'two' ? '收起' : '展开' }}</span>
					</div>
				</template>
				<div class="space-y-[1rem] text-secondary leading-[1.4rem] px-[0.8rem]">
					<slot name="content-info"></slot>
				</div>
			</el-collapse-item>

			<el-collapse-item v-if="showThree" name="three" :class="{ '!mb-0': !showTwo }">
				<template #title>
					<div class="flex justify-between w-full">
						<span class="px-[8px] text-secondary leading-[3rem] text-center">
							{{ foldTitle.three }}
						</span>
						<span>{{ foldActive === 'three' ? '收起' : '展开' }}</span>
					</div>
				</template>
				<div class="mt-[8px] space-y-[1rem]">
					<div>
						<div v-if="props.processAlarmShow" class="mb-1rem">
							<el-button size="small" @click="store.openProcessAlarmDialog">进程告警</el-button>
						</div>
						<bt-table v-bt-loading="tableData.loading" :column="tableColum" :data="tableData.list" :max-height="450">
							<template v-if="authType !== 'ltd'" #empty>
								<div class="flex items-center justify-center flex-nowrap w-full">
									<span class="whitespace-nowrap">当前为企业版专享功能, <bt-link @click="store.openProduct">立即购买</bt-link></span>
								</div>
							</template>
						</bt-table>
					</div>
				</div>
			</el-collapse-item>
		</el-collapse>
	</el-card>
</template>

<script lang="tsx" setup>
import Alarm from './alarm.vue'

import { storeToRefs } from 'pinia'
import HOME_STATE_POPOVER_STORE from './store'
import HOME_STATE_STORE from '../store'

interface Prop {
	loadType: string
	type: string
	processAlarmShow?: boolean
}

const props = withDefaults(defineProps<Prop>(), {
	loadType: '',
	type: '',
	processAlarmShow: false,
})

const { hoverType } = storeToRefs(HOME_STATE_STORE())

const store = HOME_STATE_POPOVER_STORE()
const { specificResource, authType, tableData, foldExpand, foldActive } = storeToRefs(store)

const isPathNone = computed(() => {
	// 磁盘是否挂载
	const { type } = props
	return type.indexOf('未挂载') !== -1
})

/**
 * @description 是否为负载和cpu视图
 */
const isLoadOrCpu = computed(() => {
	// const { loadType } = props
	return hoverType.value === 'loadPopover' || hoverType.value === 'cpuPopover'
})

const tableColum = computed(() => {
	return store.useHomeTableColumn(isLoadOrCpu.value, isLoadOrCpu.value ? 'CPU占用率' : '内存使用率', isLoadOrCpu.value ? 'cpu_percent' : 'memory_usage').value
})

const showTwo = computed(() => {
	// 是否展示第二个折叠面板
	return props.loadType !== 'memoryInfo'
})

const showThree = computed(() => {
	// 磁盘信息不展示进程信息
	return props.loadType !== 'diskInfo'
})

const foldTitle = computed(() => {
	// 折叠面板标题
	const { loadType } = props
	const obj = {
		one: '',
		two: '',
		three: '',
	}
	obj.one = loadType === 'memoryInfo' ? '内存信息' : '基础信息'
	if (loadType !== 'diskInfo') {
		if (isLoadOrCpu.value) {
			if (loadType === 'loadInfo') {
				obj.two = '更多负载信息'
			} else if (loadType === 'cpuInfo') {
				obj.two = '核心使用率'
			}
			obj.three = 'CPU占用率top5的进程信息'
		} else if (loadType === 'memoryInfo') {
			obj.two = '内存信息'
			obj.three = '内存使用率top5的进程信息'
		}
	} else {
		obj.two = 'Inode信息'
	}
	return obj
})

/**
 * @description 监听任务管理刷新
 */
watch(
	() => specificResource.value,
	val => {
		if (authType.value === 'ltd') {
			tableData.value.loading = false
			if (isLoadOrCpu.value) {
				tableData.value.list = specificResource.value.cpuProcess // CPU负载进程
			} else {
				tableData.value.list = specificResource.value.memProcess // 内存占用进程
			}
		} else {
			tableData.value.loading = false
			tableData.value.list = []
		}
	},
	{
		deep: true,
		immediate: true,
	}
)

watch(
	() => authType.value,
	val => {
		if (val !== 'ltd') {
			tableData.value.loading = false
			tableData.value.list = []
		}
	}
)

defineExpose({
	showTwo,
	showThree,
})
</script>

<style lang="css" scoped>
.el-progress__text {
	color: inherit !important;
}
.shadow_div {
	box-shadow: 0px 1px 20px rgba(var(--el-color-black-rgb), 0.2);
}
.el-collapse {
	border: none;
}
.card-popover {
	border: none;
	/* padding: 0; */
}
.card-popover :deep(.el-collapse-item:first-child) {
	margin-bottom: 1.4rem;
}
.card-popover :deep(.el-collapse-item__header) {
	height: 3rem;
	line-height: 3rem;
	background-color: var(--el-fill-color-light);
	border-bottom: 0;
}
.card-popover :deep(.el-progress-bar__outer) {
	border-radius: 0;
}
.card-popover :deep(.el-progress-bar__inner) {
	border-radius: 0;
}
.card-popover :deep(.el-collapse-item__wrap) {
	border-bottom: 0;
}
.card-popover :deep(.el-collapse-item__content) {
	padding-bottom: 0;
}
.card-popover :deep(.el-collapse-item.is-disabled .el-collapse-item__header) {
	color: var(--el-color-text-secondary);
}
.card-popover :deep(.el-card__body) {
	padding: 0 !important;
}
:deep(.el-table .el-table__row .el-table__cell) {
	padding: 0.4rem 0;
}
:deep(.el-table .el-table__header th.is-leaf) {
	height: 3.4rem;
}
</style>
