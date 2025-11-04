<template>
	<HomeStarePopover :load-type="'diskInfo'" :type="`disk-${props.item.info.title}`">
		<template #button>
			<template v-if="!isPathNone">
				<el-alert v-if="parseInt(props.item.data.inodes[3]) > 90" title="Inode可用不足10%，请前往文件管理清理不必要文件" type="error" class="!mb-8px !min-h-[24px] !py-4px" :closable="false"> </el-alert>
				<div class="flex items-center justify-between mb-[1.2rem] leading-[2.8rem]">
					<div class="flex items-center">
						<span class="text-secondary text-base mr-[4px] ml-[8px]">检测到当前磁盘</span>
						<el-tag :type="tipType">{{ `容量占用${props.item.data.size[3].substring(0, props.item.data.size[3].lastIndexOf('%'))}%` }}</el-tag>
					</div>
					<el-button v-show="enterpriseRec" type="primary" @click="store.scanRubbishFile(props.item.info.title)">立即清理</el-button>
				</div>
			</template>
		</template>
		<template v-slot:base-info>
			<template v-if="!isPathNone">
				<div class="flex align-left flex-col">
					<div class="flex items-center">
						<div class="block truncate max-w-[30rem] mb-[2px]" :title="`挂载点：${item.info.title}\n备注：${item.data.rname}`">挂载点： {{ item.info.title + (item.data.rname ? ` (${item.data.rname})` : '') }}</div>
						<el-tooltip placement="right" content="点击设置备注">
							<i class="svgtofont-el-edit text-primary ml-[8px] cursor-pointer" @click="store.setPsDialog({ ps: item.data.rname || item.info.title, path: item.info.title })"></i>
						</el-tooltip>
					</div>
					<span>{{ `共：${item.data.size[0]}` + `，可用：${item.data.size[2]}` + `，	已用：${item.data.size[1]}` }}</span>
					<!-- <span class="m-[4px]">
						{{ `未分配：${store.computedSpace(item.data.size[0], item.data.size[1])}` }}
					</span> -->
				</div>
				<div class="flex align-left flex-col">
					<span class="mb-[2px]"> 文件系统：{{ item.data.filesystem }}</span>
					<span> 类型：{{ item.data.type + `，系统占用：${item.data.size[3]}` }}</span>
				</div>
				<div class="m-4x flex items-center" v-if="item.data.d_size !== 'None'">
					<span> 磁盘大小：{{ item.data.d_size }} </span>
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
					'text-warning': parseInt(props.item.data.inodes[3]) > 90 && parseInt(props.item.data.inodes[3]) < 100,
					'text-danger': parseInt(props.item.data.inodes[3]) === 100,
				}">
				使用率：{{ item.data.inodes[3] + (item.data.inodes[3].includes('%') ? '' : '%') }}
			</p>
		</template>
	</HomeStarePopover>
</template>

<script setup lang="tsx">
import { storeToRefs } from 'pinia'
import HomeStarePopover from './popover-content.vue'
import HOME_STATE_POPOVER_STORE from './store'
import { useGlobalStore } from '@/store/global'

interface Prop {
	custom?: boolean
	item?: any
}

const props = withDefaults(defineProps<Prop>(), {
	custom: false,
	item: [],
})
const { enterpriseRec } = useGlobalStore()
const store = HOME_STATE_POPOVER_STORE()
const { mountColumn } = storeToRefs(store)

const isPathNone = computed(() => props.item.data.path === 'None')

const tipType = computed(() => {
	// 检测到当前磁盘 - 提示类型
	const range = typeof props.item.data.size === 'string' ? 0 : parseFloat(props.item.data.size[3].substring(0, props.item.data.size[3].lastIndexOf('%')))
	if (range >= 90) {
		return 'danger'
	} else if (range >= 80) {
		return 'warning'
	} else {
		return 'success'
	}
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
	border: 0;
}

:deep(.el-collapse-item__header) {
	height: 2.4rem;
	line-height: 2.4rem;
	background-color: var(--el-fill-color-light);
	border-bottom: 0;
}

:deep(.el-progress-bar__outer) {
	border-radius: 0;
}

:deep(.el-progress-bar__inner) {
	border-radius: 0;
}

:deep(.el-collapse-item__wrap) {
	border-bottom: 0;
}

:deep(.el-collapse-item__content) {
	padding-bottom: 0;
}

.content-info p {
	@apply my-[4px];
}
</style>
