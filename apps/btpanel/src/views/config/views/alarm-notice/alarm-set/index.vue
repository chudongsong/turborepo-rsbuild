<template>
	<bt-table-group>
		<template #content>
			<bt-table v-bt-loading="tableLoading" :data="tableData" :column="columns" description="告警设置列表为空" v-bt-loading:title="'正在加载告警设置列表，请稍后...'"> </bt-table>
		</template>
	</bt-table-group>
</template>

<script lang="tsx" setup>
import { useGlobalStore } from '@store/global'
import ModuleName from './module-name.vue'
import ModuleContent from './module-content.vue'
import ModuleAction from './module-action.vue'

import { alarmSettingDataFormat } from '@config/useMethod'
import { getConfigStore } from '@/views/config/useStore'
import { init } from 'ramda'

const { push, getSenderAlarmListInfo } = useGlobalStore()

const {
	refs: { isRefreshList },
} = getConfigStore()

const tableLoading = ref(false) // 表格loading
const tableData = ref<any>([]) // 表格数据

const columns = [
	{ label: '告警模块', width: 400, render: (row: any) => <ModuleName row={row} /> },
	{ label: '配置情况', render: (row: any) => <ModuleContent row={row} /> },
	{ label: '操作', align: 'right', width: 100, render: (row: any) => <ModuleAction row={row} /> },
]

/**
 * @description 获取告警设置信息
 */
const getData = async (isLoad: boolean = true) => {
	if (isLoad) tableLoading.value = true
	await getSenderAlarmListInfo()
	tableData.value = alarmSettingDataFormat(push.value.config)
	tableLoading.value = false
}

watch(
	() => isRefreshList.value,
	val => {
		if (isRefreshList.value) {
			getData(false)
			isRefreshList.value = false
		}
	},
	{ immediate: true }
)

onMounted(getData)

defineExpose({ init: getData })
</script>
