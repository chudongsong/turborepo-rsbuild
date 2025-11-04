<template>
	<div class="min-h-[30rem]">
		<bt-install-mask v-if="!firewallInfo.init_status" width="38rem">
			<template #content>
				<InitFirewall />
			</template>
		</bt-install-mask>
		<bt-table-group>
			<template #header-left>
				<el-button type="primary" @click="openAddIpView()">添加IP规则</el-button>
				<RuleSetting type="ip" :refreshFn="getIpRulesData"></RuleSetting>
			</template>
			<template #header-right>
				<!-- <el-radio-group class="mr-[1rem]" v-model="tableParam.chain" @change="getIpRulesData()">
					<div class="flex items-center">
						<el-radio-button label="ALL">所有方向</el-radio-button>
						<el-radio-button label="INPUT">入站</el-radio-button>
						<el-radio-button label="OUTPUT">出站</el-radio-button>
					</div>
				</el-radio-group> -->
				<bt-input-search class="!w-[32rem]" v-model="searchValue" @search="getIpRulesData()" placeholder="请输入IP地址/备注" />
			</template>
			<template #content>
				<bt-table ref="ipTableRef" :column="tableColumn" :data="tableData" v-bt-loading="tableLoading" :description="'IP列表为空'" v-bt-loading:title="'正在加载IP列表，请稍后...'"></bt-table>
			</template>
			<template #footer-left>
				<bt-table-batch :table-ref="ipTableRef" :options="TableBatchOptions" />
			</template>
			<template #footer-right>
				<bt-table-page ref="ipRulesPager" :total="completedTotal" v-model:page="tableParam.p" v-model:row="tableParam.row" @change="getIpRulesData()" name="ip" />
			</template>
		</bt-table-group>
	</div>
</template>
<script lang="tsx" setup>
import type { TableBatchDialogProps, TableBatchNextAllProps } from '@/components/extension/bt-table-batch/types'

import { editIpRules, getIpRulesList, setIpRules } from '@/api/firewall'
import { productPaymentDialog } from '@/public/index'
import { renderIconTip, statusFilterKey, useBatchEvent, useFirewallColumn, useFirewallOperate } from '@firewall/useMethod'
import { useGlobalStore } from '@store/global'

import { useCheckbox } from '@/hooks/tools/table/column'
import { useDataHandle, useDataPage } from '@hooks/tools'
import { useConfirm } from '@hooks/tools'
import { useDialog } from '@hooks/tools'

import RuleSetting from '@firewall/public/rule-setting/index.vue'
import { getFirewallStore } from '@/views/firewall/useStore'
import InitFirewall from '@firewall/views/system-firewall/init-firewall/index.vue'
const { payment } = useGlobalStore()
const {
	refs: { systemTabActive, firewallInfo },
} = getFirewallStore()

const ipTableRef = ref<any>(null) // 表格ref
const tableData = ref<any>([]) //列表数据
const searchValue = ref<string>('') // 搜索
const completedTotal = ref(0) // 总条数
const tableLoading = ref<boolean>(false) // 加载状态

const tableParam = reactive({
	p: 1,
	row: 20,
}) // 表格接口请求

/**
 * @description 打开添加IP规则弹窗
 */
const openAddIpView = (isEdit?: boolean, row?: any) => {
	useDialog({
		title: isEdit ? '修改IP规则' : '添加IP规则',
		area: 44,
		component: () => import('./add-ip-rules.vue'),
		showFooter: true,
		compData: { ...row, isEdit, refreshFn: getIpRulesData },
	})
}

/**
 * @description 切换列表页面
 * @param {number} p 当前页码
 */
const getIpRulesData = async (chain?: string) => {
	if (systemTabActive.value !== 'ip') return
	if (chain) statusFilterKey.value = chain
	await useDataHandle({
		loading: tableLoading,
		request: getIpRulesList({
			chain: statusFilterKey.value || 'ALL',
			...tableParam,
			query: searchValue.value,
		}),
		data: {
			data: [Array, tableData],
			page: useDataPage(completedTotal),
		},
	})
}

/**
 * @description 修改IP规则策略
 * @param {any} data IP规则行数据
 */
const changePolicy = async (row: any) => {
	const isTypes = row.Strategy === 'accept' ? false : true
	await useConfirm({
		icon: 'warning-filled',
		title: (isTypes ? '放行' : '禁止') + 'IP规则策略【' + row.Address + '】',
		content: `修改IP策略为“${isTypes ? '放行' : '禁止'}”，设置后该IP将${isTypes ? '恢复正常访问' : '禁止访问服务器'}，是否继续操作？`,
	})

	const params = {
		old_data: JSON.stringify(row),
		new_data: JSON.stringify({
			...handleRowParams({ ...row, Strategy: isTypes ? 'accept' : 'drop' }, 'add'),
			brief: row.brief,
		}),
	}

	await useDataHandle({
		loading: '正在修改IP规则策略，请稍后...',
		request: editIpRules(params),
		message: true,
		success: () => getIpRulesData(),
	})
}

/**
 * @description 处理行数据
 */
const handleRowParams = (row: any, operation: string) => {
	const params: any = {
		operation,
		address: row.Address,
		strategy: row.Strategy,
		chain: row.Chain,
		family: row.Family,
		zone: row.Zone,
	}
	if (operation === 'remove') {
		params.stype = row.stype
	}
	return params
}

/**
 * @description 删除ip规则
 * @param {any} data ip规则行数据
 */
const deleteEvent = async (data: any) => {
	await useConfirm({
		icon: 'warning-filled',
		title: '删除端口规则【' + data.Address + '】',
		content: '删除选中的规则后，该IP将使用默认放行的方式，是否继续操作？',
	})

	await useDataHandle({
		loading: '正在删除IP规则，请稍后...',
		request: setIpRules(handleRowParams(data, 'remove')),
		message: true,
		success: () => getIpRulesData(),
	})
}

const TableBatchOptions = [
	{
		label: '删除',
		value: 'delete',
		event: async (batchConfirm: TableBatchDialogProps, nextAll: TableBatchNextAllProps) => {
			const requestHandle = async (item: any, index: number) => {
				const params = handleRowParams(item, 'remove')
				return await setIpRules(params)
			}
			await useBatchEvent(batchConfirm, nextAll, requestHandle, { label: 'IP地址', prop: 'Address' }, getIpRulesData)
		},
	},
]

const tableColumn = [
	useCheckbox(),
	{ label: 'IP地址', prop: 'Address', width: 120 },
	{
		label: 'IP归属地',
		render: (row: any) => {
			if (payment.value.authType != 'ltd') {
				return (
					<span class="bt-link" onClick={() => productPaymentDialog({ sourceId: 116 })}>
						点击查看
					</span>
				)
			}
			return <span>{(row.area.continent || '') + (row.area.info || '--')}</span>
		},
	},
	...useFirewallColumn({ changePolicy, change: getIpRulesData }),
	{ label: '备注', prop: 'brief' },
	{
		label: '时间',
		prop: 'addtime',
		renderHeader: () => renderIconTip('时间', '-- : 表示面板数据库中未记录创建时间，规则从系统中直接读取，忽略即可'),
	},
	{
		label: '过期时间',
		prop: 'expiry_date',
		width: 160,
		render: (row: any) => {
			if (row.expiry_date) {
				return <span>{row.expiry_date}</span>
			}
			return <span>--</span>
		},
	},
	useFirewallOperate({
		editEvent: (row: any) => openAddIpView(true, row),
		deleteEvent,
	}),
]

// 页面加载完成
onMounted(() => getIpRulesData())
</script>

<style lang="css" scoped>
/* :deep(.el-radio-button__inner) {
	padding: 8px 16px !important;
} */
</style>
