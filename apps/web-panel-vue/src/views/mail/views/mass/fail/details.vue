<template>
	<bt-table-group class="p-20px">
		<template #content>
			<!-- @cell-mouse-enter="onMousemove" @cell-mouse-leave="onMouseleave" -->
			<bt-table v-bt-loading="detailLoading" :data="detailsTable.data" :column="detailsColumns"> </bt-table>
		</template>
		<template #footer-right>
			<bt-table-page v-model:page="detailSearch.page" v-model:row="detailSearch.size" :total="detailsTable.total" @refresh="getDetailsList"> </bt-table-page>
		</template>
	</bt-table-group>
</template>

<script lang="tsx" setup>
import MAIL_MASS_FAIL from '@mail/views/mass/fail/store'
import { storeToRefs } from 'pinia'
import { getDetailsList, useColumns, initDetailSearch } from '@mail/views/mass/fail/useMethod'

const { detailLoading, detailsTable, detailSearch } = storeToRefs(MAIL_MASS_FAIL())
const { detailsColumns, resetDetail } = MAIL_MASS_FAIL()
const { initColumns } = useColumns()

// interface PropsData {
// 	id: number
// 	type: string
// 	row: MailTaskFail
// }

// interface Props {
// 	compData: PropsData
// }

// const props = withDefaults(defineProps<Props>(), {})

initDetailSearch()
initColumns()
getDetailsList()

onUnmounted(() => {
	resetDetail()
})
</script>

<style lang="css">
:deep(.el-table .el-table__row:hover .tooltip-text-title) {
	color: var(--el-color-primary) !important;
}
</style>
