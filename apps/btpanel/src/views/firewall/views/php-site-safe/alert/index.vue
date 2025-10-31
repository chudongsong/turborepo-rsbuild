<template>
	<bt-table-group>
		<template #header-left>
			<div class="flex items-center w-[28rem]">
				<span class="mr-[.8rem] w-[6rem] text-small">告警方式</span>
				<BtAlarmOldSelect :limit="['sms']" v-model="alertValue" :multiple="false" @change="changeAlert" :options="[{ label: '不绑定', value: 'error' }]"></BtAlarmOldSelect>
			</div>
		</template>
		<template #content>
			<bt-table :column="tableColumn" :data="tableData" v-bt-loading="loading" v-bt-loading:title="'正在加载中，请稍后...'"></bt-table>
		</template>
		<template #footer-right>
			<bt-table-page :total="total" v-model:page="tableParam.p" v-model:row="tableParam.rows" @change="getAlertData" />
		</template>
	</bt-table-group>
</template>

<script setup lang="tsx">
import { getPhpAlertLog, getPhpAlertSet, setPhpAlertSet } from '@/api/firewall'
import { toHalfWidth } from '@/utils'
import { useDataHandle, useDataPage } from '@hooks/tools'
import { useGlobalStore } from '@store/global'

const { mainHeight } = useGlobalStore()

const tableData = shallowRef<any>([])
const loading = shallowRef(false) // 表格loading
const total = shallowRef(0) // 总条数
const tableParam = shallowReactive({ p: 1, rows: 10 }) // 表格参数
const alertValue = ref('') // 告警方式

const tableColumn = [
	{ label: '告警名称', prop: 'type', width: 120 },
	{
		label: '告警信息',
		render: (row: any) => <span v-html={toHalfWidth(row.log)}></span>,
	},
	{ label: '日期', prop: 'addtime', width: 180 },
] // 表格列

/**
 * @description: 获取数据
 */
const getAlertData = async () => {
	await useDataHandle({
		loading,
		request: getPhpAlertLog(tableParam),
		data: { data: [Array, tableData], page: useDataPage(total) },
	})
}

/**
 * @description: 获取告警方式
 */
const getAlertMsg = async () => {
	await useDataHandle({
		loading: '正在获取告警方式，请稍后...',
		request: getPhpAlertSet(),
		data: { msg: [String, alertValue] },
	})
}

/**
 *  @description: 改变告警方式
 * @param val 告警方式
 */
const changeAlert = async (val: any) => {
	await useDataHandle({
		loading: '正在设置告警方式，请稍后...',
		request: setPhpAlertSet({ type: val }),
		message: true,
	})
	getAlertMsg()
}

const init = () => {
	getAlertData()
	getAlertMsg()
}

onMounted(init)

defineExpose({ init })
</script>
