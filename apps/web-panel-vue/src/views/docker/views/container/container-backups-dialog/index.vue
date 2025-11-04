<template>
	<div class="p-[1.6rem]">
		<!-- 表格按钮视图组件 -->
		<bt-table-group>
			<!-- 表格左上方按钮组 -->
			<template #header-left>
				<el-button type="primary" @click="addBackup">容器备份</el-button>
			</template>
			<!-- 表格主体 -->
			<template #content>
				<bt-table ref="backupTable" :column="tableColumn" max-height="420" :data="tableData.list" :description="'备份列表为空'" v-bt-loading="tableData.loading" v-bt-loading:title="'正在加载镜像列表，请稍后...'" />
			</template>
			<template #footer-left>
				<bt-table-batch :table-ref="backupTable" :options="tableBatchData" />
			</template>
		</bt-table-group>
		<bt-help class="mt-[2rem] ml-[1rem]" :options="[{ content: '备份任务创建成功后后台进行，可以关闭黑色窗口，备份完成可能需要1分钟以上！' }]" />
	</div>
</template>

<script setup lang="ts">
import { 
	init,
	unMountHandle,
	addBackup,
	tableData,
	tableBatchData,
	backupContainerTable,
 } from './useController'

interface Props {
	compData?: any
}

const props = withDefaults(defineProps<Props>(), {
	compData: () => ({}),
})

const backupTable = ref<any>()

const tableColumn = backupContainerTable()
onMounted(() => {
	init(props)
})

onBeforeUnmount(() => {
	unMountHandle()
})
</script>
