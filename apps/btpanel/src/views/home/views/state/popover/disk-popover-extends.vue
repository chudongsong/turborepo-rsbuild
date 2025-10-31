<template>
	<template v-if="props.list && props.list.length">
		<el-popover v-for="(item, idx) in props.list" :key="item?.info?.title ? item.info.title + '-' + idx : idx" trigger="hover" :width="400" placement="bottom-start" :teleported="false" popper-class="el-popover-shadow" :show-after="100" :hide-after="0">
			<template #reference>
				<div :class="props.isShowAllDisk ? 'p-[1rem]' : 'px-[1rem]'" class="flex items-center justify-between min-w-0 cursor-pointer transition-colors hover:bg-lighter rounded-medium">
					<div class="disk-info flex flex-col items-start flex-1 min-w-0">
						<div class="disk-title text-default text-small md:text-2xl font-semibold mb-2 break-all truncate w-full">{{ item.info?.title || '-' }}</div>
						<div class="disk-desc text-small text-gray-500 break-all mb-1 truncate w-full">
							<template v-if="typeof item.info?.desc === 'object' && item.info?.type === 'disk'">
								<span :style="{ color: item.info?.color }"> {{ item.info?.desc?.used }} {{ item.info?.desc?.used_unit }} </span>
								<span> / </span>
								<span>{{ item.info?.desc?.total }} {{ item.info?.desc?.total_unit }}</span>
							</template>
							<template v-else>
								{{ item.info?.desc || '-' }}
							</template>
						</div>
					</div>
					<div class="disk-progress ml-5 flex items-center justify-center">
						<el-progress :show-text="true" type="circle" :width="50" :stroke-width="6" :color="progressStyle(item, idx)" :percentage="item.info?.range || 0">
							<template #default="{ percentage }">
								<div class="flex flex-col items-center text-small">
									<span class="percentage-value" :style="{ color: progressStyle(item, idx) }">
										<span class="text-medium">{{ percentage }}</span
										>%
									</span>
								</div>
							</template>
						</el-progress>
					</div>
				</div>
			</template>
			<template #default>
				<HomeStarePopover v-if="item && item.data && item.info" :load-type="'diskInfo'" :type="`disk-${item.info.title}`" :item="item">
					<template #button>
						<template v-if="item.data.path !== 'None'">
							<el-alert v-if="parseInt(item.data.inodes[3]) > 90" title="Inode可用不足10%，请前往文件管理清理不必要文件" type="error" class="!mb-8px !min-h-[24px] !py-4px" :closable="false"> </el-alert>
							<div class="flex items-center justify-between mb-[1.2rem] leading-[2.8rem]">
								<div class="flex items-center">
									<span class="text-secondary text-base mr-[4px] ml-[8px]">检测到当前磁盘</span>
									<el-tag :type="tipType(item)">{{ `容量占用${item.data.size[3].substring(0, item.data.size[3].lastIndexOf('%'))}%` }}</el-tag>
								</div>
								<el-button v-show="enterpriseRec" type="primary" @click="store.scanRubbishFile(item.info.title)">立即清理</el-button>
							</div>
						</template>
					</template>
					<template #base-info>
						<template v-if="item.data.path !== 'None'">
							<div class="flex align-left flex-col">
								<div class="flex items-center">
									<div class="block truncate max-w-[30rem]" :title="`挂载点：${item.info.title}\n备注：${item.data.rname}`">挂载点： {{ item.info.title + (item.data.rname ? ` (${item.data.rname})` : '') }}</div>
									<el-tooltip placement="right" content="点击设置备注">
										<i class="svgtofont-el-edit text-primary ml-[8px] cursor-pointer" @click="store.setPsDialog({ ps: item.data.rname || item.info.title, path: item.info.title })"></i>
									</el-tooltip>
								</div>
								<span>{{ `共：${item.data.size[0]}` + `，可用：${item.data.size[2]}` + `，\t已用：${item.data.size[1]}` }}</span>
							</div>
							<div class="flex align-left flex-col">
								<span> 文件系统：{{ item.data.filesystem }}</span>
								<span> 类型：{{ item.data.type + `，系统占用：${item.data.size[3]}` }}</span>
							</div>
							<div class="m-4x flex items-center" v-if="item.data.d_size !== 'None'">
								<span class="mb-[2px]"> 磁盘大小：{{ item.data.d_size }} </span>
								<el-tooltip class="item" effect="dark" :content="`根据系统设置的不同，如分区/SWAP/LVM/扩容，可能显示大小不一致，点击查看详情`" placement="top-start">
									<span>
										<bt-link class="bt-ico-ask ml-3" href="https://www.bt.cn/bbs/thread-136532-1-1.html" target="_blank">?</bt-link>
									</span>
								</el-tooltip>
							</div>
						</template>
						<template v-else>
							<bt-table :data="item.data.list" :column="mountColumn"></bt-table>
						</template>
					</template>
					<template #content-info>
						<p class="!my-[1rem]">总数：{{ item.data.inodes[0] }}</p>
						<p class="!my-[1rem]">已用：{{ item.data.inodes[1] }}</p>
						<p class="!my-[1rem]">可用：{{ item.data.inodes[2] }}</p>
						<p
							class="!my-[1rem]"
							:class="{
								'text-warning': parseInt(item.data.inodes[3]) > 90 && parseInt(item.data.inodes[3]) < 100,
								'text-danger': parseInt(item.data.inodes[3]) === 100,
							}">
							使用率：{{ item.data.inodes[3] + (item.data.inodes[3].includes('%') ? '' : '%') }}
						</p>
					</template>
				</HomeStarePopover>
				<div v-else class="p-4 text-gray-400">无数据</div>
			</template>
		</el-popover>
	</template>
</template>

<script setup lang="ts">
import HomeStarePopover from './popover-content.vue'
import HOME_STATE_POPOVER_STORE from './store'
import { useGlobalStore } from '@/store/global'
import { storeToRefs } from 'pinia'
import type { StateInfo } from '@home/types'

interface Prop {
	list: { info: StateInfo; data: any }[]
	isShowAllDisk: boolean
}

const props = withDefaults(defineProps<Prop>(), {
	list: () => [],
	isShowAllDisk: false,
})

const { enterpriseRec } = useGlobalStore()
const store = HOME_STATE_POPOVER_STORE()
const { mountColumn } = storeToRefs(store)

const progressStyle = (data: any, idx: number) => {
	const range = data.info?.range
	if (Number(range) > 90) {
		return 'var(--el-color-danger)'
	} else if (Number(range) > 80) {
		return 'var(--el-color-warning)'
	} else {
		return 'var(--el-color-primary)'
	}
}

const tipType = (item: any) => {
	const range = typeof item.data.size === 'string' ? 0 : parseFloat(item.data.size[3].substring(0, item.data.size[3].lastIndexOf('%')))
	if (range >= 90) {
		return 'danger'
	} else if (range >= 80) {
		return 'warning'
	} else {
		return 'success'
	}
}
</script>

<style scoped>
/* 移除原有 disk-card、disk-grid 样式，全部用unocss类 */
:deep(.el-progress__text) {
	font-size: var(--el-font-size-medium) !important;
	line-height: 1;
}
@media (min-width: 768px) {
	:deep(.el-progress__text) {
		font-size: var(--el-font-size-extra-large) !important;
	}
}
</style>
