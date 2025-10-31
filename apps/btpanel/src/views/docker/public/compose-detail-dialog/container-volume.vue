<template>
	<div class="container-dialog">
		<div class="content">
			<bt-table ref="Table" :column="tableColumn" :data="TableData.list" :description="'存储卷列表为空'" v-bt-loading="TableData.loading" v-bt-loading:title="'正在加载存储卷列表，请稍后...'" />
		</div>
	</div>
</template>
<script setup lang="ts">
import useDockerStore from '@docker/useStore'

import { storeToRefs } from 'pinia'

const store = useDockerStore()
const { currentConDetail } = storeToRefs(store)

// 表格数据
const TableData = reactive({
	list: currentConDetail.value.Mounts,
	loading: false,
})

const tableColumn = [
	{
		label: `数据卷`,
		prop: 'Source',
		showOverflowTooltip: true, // 超出是否展示tooltip，默认为false
		minWidth: 100,
	},
	{
		label: `容器目录`,
		prop: 'Destination',
		minWidth: 100,
	},
]

onMounted(async () => {})
</script>
<style lang="css" scoped>
.container-dialog {
	@apply flex flex-col lib-box min-h-[60rem];
}
.table .item {
	@apply flex items-center h-[5rem];
}
</style>
