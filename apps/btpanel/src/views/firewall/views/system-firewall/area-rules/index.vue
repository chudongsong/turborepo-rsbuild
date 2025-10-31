<template>
	<div class="min-h-[30rem]">
		<bt-install-mask v-if="!firewallInfo.init_status" width="38rem">
			<template #content>
				<InitFirewall />
			</template>
		</bt-install-mask>
		<bt-table-group>
			<template #header-left>
				<el-button type="primary" @click="openAddAreaView()"> 添加地区规则 </el-button>
				<RuleSetting type="country_rule" :refreshFn="getAreaRules"></RuleSetting>
			</template>
			<template #header-right>
				<bt-input-search class="!w-[32rem]" v-model="searchValue" @search="getAreaRules()" placeholder="请输入地区" />
			</template>
			<template #content>
				<bt-table ref="areaTableRef" :column="tableColumn" :data="tableData" v-bt-loading="loading" :description="'地区列表为空'" v-bt-loading:title="'正在加载地区列表，请稍后...'"></bt-table>
			</template>
			<template #footer-left>
				<bt-table-batch :table-ref="areaTableRef" :options="TableBatchOptions" />
			</template>
			<template #footer-right>
				<bt-table-page :total="completedTotal" v-model:page="tableParam.p" v-model:row="tableParam.limit" @change="getAreaRules()" name="area" />
			</template>
		</bt-table-group>
		<ul class="mt-16px leading-8 text-small list-disc ml-[2rem]">
			<li>每隔一个月会自动更新一次最新的IP池，最近更新时间：{{ firewallInfo.update_time }}</li>
		</ul>
	</div>
</template>
<script lang="tsx" setup>
import type { TableBatchDialogProps, TableBatchNextAllProps } from '@/components/extension/bt-table-batch/types'

import { getCountryList, removeCountry } from '@/api/firewall'
import { renderIconTip, useBatchEvent, useFirewallOperate } from '@firewall/useMethod'
import { getFirewallStore } from '@firewall/useStore'

import { useCheckbox } from '@/hooks/tools/table/column'
import { useDataHandle, useDataPage } from '@hooks/tools'
import { useConfirm } from '@hooks/tools/confirm'
import { useDialog } from '@hooks/tools/dialog'

import RuleSetting from '@firewall/public/rule-setting/index.vue'
import InitFirewall from '@firewall/views/system-firewall/init-firewall/index.vue'

const {
	refs: { firewallInfo, systemTabActive },
} = getFirewallStore()

const areaTableRef = ref<any>(null) // 表格ref
const tableData = ref<any>([]) //列表数据
const searchValue = ref<string>('') // 搜索
const completedTotal = ref(0) // 总条数
const loading = ref<boolean>(false) // 加载状态

// 表格接口请求
const tableParam = reactive({
	p: 1,
	limit: 20,
})

/**
 * @description 获取地区规则列表
 */
const openAddAreaView = (isEdit?: boolean, row?: any) => {
	useDialog({
		title: isEdit ? '修改地区规则' : '添加地区规则',
		area: 44,
		component: () => import('./add-area-rule.vue'),
		showFooter: true,
		compData: { ...row, isEdit, refreshFn: getAreaRules },
	})
}

/**
 * @description 切换列表页面
 * @param {number} p 当前页码
 */
const getAreaRules = async (p: number = 1) => {
	if (systemTabActive.value !== 'area') return
	await useDataHandle({
		loading,
		request: getCountryList({
			data: JSON.stringify({ ...tableParam, query: searchValue.value }),
		}),
		data: { data: [Array, tableData], page: useDataPage(completedTotal) },
	})
}

/**
 * @description 删除ip规则
 * @param {any} data ip规则行数据
 */
const deleteEvent = async (data?: any) => {
	await useConfirm({
		icon: 'warning-filled',
		title: '删除地区规则',
		content: '删除选中规则后，该规则屏蔽的地区，端口将恢复正常访问，是否继续操作？',
	})
	const params = {
		...data,
		s_port: data.start_port,
		d_port: data.ended_port,
		d_ip: data.ended_ip,
	}
	delete params.start_port, params.ended_port, params.ended_ip
	await useDataHandle({
		loading: '正在删除规则，请稍后...',
		request: removeCountry({ data: JSON.stringify(params) }),
		message: true,
		success: getAreaRules,
	})
}

const tableColumn = [
	useCheckbox(),
	{
		label: '地区',
		render: (row: any) => <span>{row.country + '(' + row.brief + ')'}</span>,
	},
	{
		label: '策略',
		render: (row: any, index: number) => {
			return <span class={'text-' + (row.types === 'accept' ? 'primary' : 'danger')}>{row.types == 'accept' ? '放行' : '禁止'}</span>
		},
	},
	{
		label: '端口',
		render: (row: any) => <span>{row.ports ? row.ports : '全部'}</span>,
	},
	{
		label: '时间',
		prop: 'addtime',
		renderHeader: () => renderIconTip('时间', '-- : 表示面板数据库中未记录创建时间，规则从系统中直接读取，忽略即可'),
	},
	useFirewallOperate({
		editEvent: (row: any) => openAddAreaView(true, row),
		deleteEvent,
	}),
]

const TableBatchOptions = [
	{
		label: '删除',
		value: 'delete',
		event: async (batchConfirm: TableBatchDialogProps, nextAll: TableBatchNextAllProps) => {
			const requestHandle = async (item: any) => {
				const params: any = {
					...item,
					s_port: item.start_port,
					d_port: item.ended_port,
					d_ip: item.ended_ip,
				}
				delete params.start_port, params.ended_port, params.ended_ip
				return await removeCountry({ data: JSON.stringify(params) })
			}
			await useBatchEvent(batchConfirm, nextAll, requestHandle, { label: '地区', prop: 'country' }, getAreaRules)
		},
	},
]

onMounted(() => getAreaRules())
</script>
