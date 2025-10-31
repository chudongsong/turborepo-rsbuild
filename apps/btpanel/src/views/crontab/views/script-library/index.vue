<template>
	<div v-bt-loading="tabLoading">
		<bt-tabs v-model="tableParam.type_id" type="card" @tab-click="handleChangeTab">
			<el-tab-pane class="h-0" v-for="(item, index) in scriptMenuData" :key="index" :label="item.name" :name="String(item.type_id)"> </el-tab-pane>
		</bt-tabs>
		<bt-table-group>
			<template #header-left>
				<div class="flex items-center">
					<el-button @click="openAddScriptView()" type="primary">创建脚本</el-button>
					<div class="flex items-center ml-4px" @click="openNps()">
						<i class="svgtofont-desired text-medium"></i>
						<span class="bt-link">需求反馈</span>
					</div>
				</div>
			</template>
			<template #header-right>
				<div class="flex items-center">
					<bt-input-search v-model="tableParam.search" class="ml-12px !w-[32rem]" placeholder="请输入搜索关键字" @search="getScriptData" />
				</div>
			</template>
			<template #content>
				<bt-table ref="scriptTableRef" v-bt-loading="tableLoad" v-bt-loading:title="'正在加载中，请稍后...'" :column="tableColumns" :data="tableData" />
			</template>
			<template #footer-left>
				<bt-table-batch :table-ref="scriptTableRef" :options="TableBatchOptions" />
			</template>
			<template #footer-right>
				<bt-table-page :total="total" v-model:page="tableParam.p" v-model:row="tableParam.rows" @change="getScriptData" />
			</template>
		</bt-table-group>
	</div>
</template>

<script setup lang="tsx">
import { useGlobalStore } from '@/store/global'
import { openNps } from '../../useController'
import { tableParam, scriptTableRef, $reset, tabLoading, total, tableData, tableLoad, scriptMenuData, TableBatchOptions, tableColumns, getScriptTabData, getScriptData, openAddScriptView, handleChangeTab } from './useController'

const { mainHeight } = useGlobalStore()

onMounted(async () => {
	await getScriptTabData()
	getScriptData()
})

onUnmounted($reset)
</script>

<style lang="css" scoped>
:deep(.el-tabs__item) {
	height: 3.6rem !important;
	line-height: 3.2rem !important;
	font-size: var(--el-font-size-small) !important;
	padding: 0 1.6rem !important;
}
</style>
