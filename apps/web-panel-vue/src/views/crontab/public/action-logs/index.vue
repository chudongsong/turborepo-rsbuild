<template>
	<div class="p-20px">
		<bt-table-group>
			<template #content>
				<bt-table max-height="440" :column="tableColumns" :data="tableData" v-bt-loading="tableLoading" />
			</template>
			<template #footer-right>
				<bt-table-page v-model:total="total" v-model:page="tableParam.p" v-model:row="tableParam.rows" @change="getLogList" />
			</template>
		</bt-table-group>
	</div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import CRONTAB_STORE from '../../useStore'

const { logCompData, total, tableParam, tableLoading, tableData } = storeToRefs(CRONTAB_STORE())
const { tableColumns, getLogList } = CRONTAB_STORE()

onMounted(getLogList)
</script>

<style lang="css" scoped>
:deep(pre) {
	white-space: pre-wrap;
	@apply bg-light py-[4px] px-[8px] border-darker border rounded-base;
}
</style>
