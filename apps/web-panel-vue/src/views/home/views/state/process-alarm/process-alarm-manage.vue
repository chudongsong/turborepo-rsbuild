<template>
	<div class="p-[2rem]">
		<!-- 表格按钮视图组件 -->
		<bt-table-group>
			<template #header-left>
				<div class="flex items-center">
					<el-button type="primary" @click="store.openProcessAlarm(false)">添加进程告警</el-button>
				</div>
			</template>
			<template #content>
				<bt-table ref="ftpTable" :column="processAlarmTableColumn" :data="processTableData.list" :description="'告警列表为空'" v-bt-loading="processTableData.loading" max-height="400" v-bt-loading:title="'正在加载告警列表，请稍后...'" />
			</template>
		</bt-table-group>
	</div>
</template>

<script setup lang="ts">
import { useGlobalStore } from '@/store/global'
import HOME_STATE_STORE from '@/views/home/views/state/store'
import { storeToRefs } from 'pinia'

const store = HOME_STATE_STORE()
const { processAlarmTableColumn, processTableData } = storeToRefs(store)

const { getSenderAlarmListInfo } = useGlobalStore()

onMounted(async () => {
	await getSenderAlarmListInfo()
	store.initAlarm()
})
</script>
