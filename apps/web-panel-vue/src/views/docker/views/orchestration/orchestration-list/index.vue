<template>
	<div class="left-list" :style="{ height: `${mainHeight - 90}px` }">
		<div class="flex items-center flex-wrap gap-[10px] p-[1.6rem]">
			<bt-btn-group :options="tableBtnGroup" />
			<el-button @click="openOrchestrationTemplate">编排模板</el-button>
			<div class="w-full relative">
				<el-input v-model="search" placeholder="请输入关键字" clear>
					<template #prefix>
						<i class="svgtofont-el-search"></i>
					</template>
				</el-input>
			</div>
		</div>
		<div class="table-con" v-bt-loading="firstLoad" v-bt-loading:title="`正在获取列表`" :style="{ height: `${mainHeight - 270}px` }">
			<div v-for="item in filterList" :key="item.name" class="list-item h-[5.4rem]" :class="{ active: item.name === orchestrationData.currentCompose.name }" @click="toggleCurrentCompose(item)">
				<el-checkbox v-model="selectObj[item.name]" @change="setSelect(item)" @click.stop></el-checkbox>
				<div v-show="!batchMode" class="w-[1.6rem]"></div>
				<el-tag :type="composeStatusObject(item).type" class="ml-[1rem] w-[5rem] status-tag text-center !h-[1.9rem] !leading-[1.9rem] !px-[.4rem]">{{ composeStatusObject(item).text }}</el-tag>
				<div class="flex flex-col ml-[1rem] w-[60%] truncate">
					<span class="truncate compose-title">
						{{ item.name }}
					</span>
					<span v-if="!editMode[item.name]" class="remark-text" :class="item.remark ? '' : 'empty-remark'" @click.stop="editRemark(item)">{{ item.remark || '点击编辑备注' }}</span>
					<input
						v-if="editMode[item.name]"
						type="text"
						class="remark-input"
						title="点击编辑备注，回车或失焦保存"
						:value="localRemark"
						placeholder="点击编辑备注"
						@click.stop
						v-focus
						@focus="orchestrationData.isEdit = true"
						@keyup.enter="blurInput"
						@mousedown.stop
						@mouseup.stop
						@blur="setRemark($event, item)" />
				</div>
			</div>

			<el-empty v-show="filterList.length === 0" description="当前列表为空" />
		</div>
		<div class="batch-select">
			<el-popover v-model="selectConfig.showCheckPopover" trigger="manual" popper-class="popper-danger" placement="top-start" :content="selectConfig.popoverContent">
				<template #reference>
					<el-checkbox v-model="selectConfig.checked" :indeterminate="indeterminate" @change="selectAll"> </el-checkbox>
				</template>
			</el-popover>
			<div class="relative flex items-center" @click="onShowSelect">
				<div class="absolute w-full h-full z-999 cursor-not-allowed" :class="disabled ? '' : 'hidden'"></div>
				<div class="ml-[1rem]">
					<el-button type="primary" :disabled="disabled" @click="onOperation"> 批量删除 </el-button>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useGlobalStore } from '@/store/global'
import { getDockerStore } from '@docker/useStore'
import {
	search,
	selectObj,
	list,
	selectConfig,
	batchMode,
	tableBtnGroup,
	firstLoad,
	checkedList,
	editMode,
	localRemark,
	composeStatusObject,
	setSelect,
	editRemark,
	onShowSelect,
	selectAll,
	onOperation,
	blurInput,
	setRemark,
	toggleCurrentCompose,
	openOrchestrationTemplate,
	getOrchestrationList,
	unmountHandle,
} from './useController'

const { mainHeight } = useGlobalStore()

const {
	refs: { orchestrationData },
} = getDockerStore()

const filterList = computed(() => {
	return search.value ? list.value.filter((item: any) => item.name.includes(search.value)) : list.value
}) // 搜索

// 是否允许批量操作
const disabled = computed(() => {
	return checkedList.value.length === 0
})
// 全选选中样式控制
const indeterminate = computed(() => {
	return list.value.length !== checkedList.value.length && checkedList.value.length > 0
})

watch(
	() => orchestrationData.value.refreshList,
	(val: boolean | 'force') => {
		if (val) {
			getOrchestrationList(val)
		}
	}
)

onMounted(() => {
	getOrchestrationList()
})

onUnmounted(() => {
	unmountHandle()
})
</script>

<style scoped>
.list-item {
	@apply border-[0rem] border-light flex items-center p-[1.6rem] cursor-pointer relative;
}
.list-item:not(:first-child) {
	@apply border-t-0;
}
.list-item.active {
	@apply relative bg-light;
}
.list-item.active .compose-title {
	@apply text-primary w-[90%];
}
.list-item.active .empty-remark {
	@apply inline-block;
}
.list-item.active .remark-input {
	@apply bg-light;
}
.list-item:hover {
	box-shadow: 0 0 38px rgba(var(--el-color-black-rgb), 0.08) inset;
}
.list-item:hover .hover-btn {
	@apply opacity-100;
}
.hover-btn {
	@apply opacity-0 cursor-pointer text-danger whitespace-nowrap absolute top-[50%] right-[1.6rem];
	transform: translateY(-50%);
}
.hover-btn:hover {
	@apply text-dangerDark;
}
.empty-remark {
	@apply hidden;
}
.remark-input {
	@apply bg-white rounded-base border border-[transparent] outline-none w-[90%];
}
.remark-input:focus {
	@apply bg-white border-primary;
}
.remark-input:hover {
	@apply border-primary;
}
.batch-select {
	@apply flex items-center relative p-[1.6rem];
}
.left-list {
	@apply rounded-extraLarge bg-[rgba(var(--el-color-white-rgb),var(--bt-main-content-opacity))] relative;
}
.left-list .list-right-arrow {
	@apply absolute border-b-[10px] border-r-[10px] border-t-[10px] border-white right-[-12px];
	border-top-color: transparent;
	border-left-color: transparent;
	border-bottom-color: transparent;
}
:deep(.el-tag.el-tag--info.status-tag) {
	background-color: var(--el-base-secondary);
	color: var(--el-color-white);
}
:deep(.el-input--prefix .el-input__inner) {
	@apply pl-[0rem];
}
.table-con {
	@apply relative overflow-y-auto relative;
}
.diviver {
	@apply h-[1px] bg-darker absolute w-full;
}
.remark-text {
	@apply text-disabled truncate border border-[transparent] w-[90%];
}
.remark-text:hover {
	@apply border border-primary rounded-base;
}
</style>

<style>
.el-popover.el-popper.popper-danger {
	background-color: var(--el-color-danger) !important;
}
.el-popover.el-popper.popper-danger .popper__arrow::after {
	border-top-color: var(--el-color-danger) !important;
	border-bottom-color: var(--el-color-danger) !important;
}
</style>
