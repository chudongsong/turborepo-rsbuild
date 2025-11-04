<template>
	<div>
		<bt-table-group>
			<template #header-left>
				<div class="flex items-center">
					<el-button @click="openAddScriptView()" type="primary">创建脚本</el-button>
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
				<bt-table-page :total="total" v-model:page="tableParam.p" v-model:row="tableParam.limit" @change="getScriptData" />
			</template>
		</bt-table-group>
	</div>
</template>

<script setup lang="tsx">
import { tableParam, scriptTableRef, $reset, total, tableData, tableLoad, scriptMenuData, TableBatchOptions, getTableColumns, getScriptData, openAddScriptView } from './useController'


const tableColumns = getTableColumns()

onMounted(async () => {
	getScriptData()
})

onUnmounted($reset)


defineExpose({
	init: getScriptData
})
</script>

<style lang="css" scoped>
</style>
