<template>
	<div class="relative container-table-tab">
		<bt-table-group>
			<template #header-left>
				<div class="flex items-center">
					<bt-btn-group :options="tableBtnGroup" />
					<bt-link class="ml-[1.6rem]" @click="NPSDialog">需求反馈</bt-link>
					<bt-link class="ml-[1.6rem]" href="https://www.bt.cn/bbs/thread-140412-1-1.html">>>使用帮助</bt-link>
				</div>
			</template>
			<template #header-right>
				<bt-input-search class="!w-[26rem] mr-1rem" v-model="containerTableData.search" @search="filterSearch" placeholder="请输入容器名、ID、容器镜像" />
				<bt-table-column :name="'dockerContainerTableColumn'" :column="tableColumn" :tableRef="containerTable" />
			</template>
			<template #content>
				<bt-table ref="containerTable" key="containerTable" :column="tableColumn" :data="showList" :row-key="getKeys" :description="'容器列表为空'" :max-height="mainHeight - 230" v-bt-loading="containerTableData.loading" v-bt-loading:title="'正在加载容器列表，请稍后...'" />
			</template>
			<template #footer-left>
				<bt-table-batch :table-ref="containerTable" :options="tableBatchData" />
			</template>
			<template #footer-right>
				<bt-table-page v-model:page="containerTableData.p" v-model:row="containerTableData.limit" :useStorage="false" :total="containerTableData.total" @change="changePage" />
			</template>
		</bt-table-group>
	</div>
</template>

<script lang="tsx" setup>
import { useGlobalStore } from '@store/global'
import { getDockerStore } from '@docker/useStore'
import { contrastTableConfig } from '@utils/index' // 工具函数
import { NPSDialog } from '@docker/useMethods'
import { containerTableData, showList, tableBatchData, tableColumn, getCList, rsyncData, destroy, checkHeight, getKeys, changePage, filterSearch, tableBtnGroup } from './useController'

const {
	refs: { refreshWs, isRefreshTableList, customLimit },
	resetRefresh,
} = getDockerStore()

const { mainHeight } = useGlobalStore()

const containerTable = ref(null) // 表格实例

watch(
	() => refreshWs.value,
	val => {
		if (val) {
			refreshWs.value = false
			rsyncData()
		}
	}
)

// 刷新容器列表
watch(
	() => isRefreshTableList.value,
	val => {
		if (val) {
			resetRefresh()
			getCList()
		}
	}
)

// 页面加载完成
onMounted(async () => {
	tableColumn.value = contrastTableConfig(JSON.parse(localStorage.getItem('dockerContainerTableColumn') || '[]') || [], tableColumn.value)
	getCList()
	nextTick(() => {
		if (!customLimit.value.container) checkHeight()
	})
})

defineExpose({ init: getCList, destroy })

onUnmounted(() => destroy())
</script>

<style lang="css" scoped>
.container-table-tab :deep(.el-tooltip .el-dropdown) {
	@apply text-small;
}
.container-table-tab :deep(.el-tooltip .el-dropdown .el-dropdown-selfdefine) {
	@apply flex items-center;
}
:deep(.loading .el-loading-spinner .circular) {
	width: 1.6rem;
	height: 1.6rem;
	@apply mr-[0.5rem];
}
:deep(.el-table .loading .el-loading-mask) {
	top: 22px !important;
	background-color: transparent !important;
}
:deep(.svgtofont-icon-top) {
	/* margin-left: 5px; */
}
/* :deep(.el-table .cell){
	display:block;
	padding: 0 .8rem;
} */
</style>
