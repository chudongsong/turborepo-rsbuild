<template>
	<bt-table-group>
		<template #header-left>
			<el-button type="primary" @click="openAddRuleView(false)"> 添加端口规则 </el-button>
			<RuleSetting type="port" :refreshFn="getPortRulesData"></RuleSetting>
			<el-button @click="openAntiPlugin">端口防扫描</el-button>
		</template>
		<template #header-right>
			<div id="extension-rulesTable"></div>
			<bt-input-search v-model="searchValue" @search="searchEvent" placeholder="请输入端口/来源" class="!w-24rem" />
		</template>
		<template #content>
			<bt-table ref="portTableRef" v-bt-loading="tableLoading" :column="tableColumn" :data="tableData" :description="'端口列表为空'" v-bt-loading:title="'正在加载端口列表，请稍后...'" />
		</template>
		<template #footer-left>
			<bt-table-batch :table-ref="portTableRef" :options="TableBatchOptions" />
		</template>
		<template #footer-right>
			<bt-table-page ref="portRulesPager" :total="completedTotal" v-model:page="tableParam.p" v-model:row="tableParam.row" @change="getPortRulesData()" name="port" />
		</template>

		<template #popup>
			<bt-dialog :title="rowData.Port + '-端口使用进程详情'" v-model="showDetailPopup" :area="42">
				<div class="p-2rem">
					<el-descriptions class="margin-top table-descriptions" border :column="1">
						<el-descriptions-item v-for="(item, index) in process" :key="index">
							<template #label>
								<span class="!w-[6rem] inline-block">{{ item[0] }}</span>
							</template>
							<span class="max-w-[26rem] inline-block">{{ item[1] }} </span>
						</el-descriptions-item>
					</el-descriptions>
				</div>
			</bt-dialog>
		</template>
	</bt-table-group>
</template>
<script lang="tsx" setup>
import type { TableBatchDialogProps, TableBatchNextAllProps } from '@/components/extension/bt-table-batch/types'

import { addPortRules, editPortRules, getAntiScanLogs, getListeningProcesses, getPortList } from '@/api/firewall'
import { useGlobalStore } from '@store/global'

import { useCheckbox, useOperate } from '@/hooks/tools/table/column'
import { getPluginStatus, portsPs, renderIconTip, statusFilterKey, useBatchEvent, useFirewallColumn, useFirewallOperate } from '@firewall/useMethod'
import { useDataHandle, useDataPage } from '@hooks/tools'
import { useConfirm } from '@hooks/tools'
import { useDialog } from '@hooks/tools/dialog'

import { pluginInstallDialog } from '@/public/index'
import RuleSetting from '@firewall/public/rule-setting/index.vue'
import { useMessage } from '@hooks/tools'
import { getFirewallStore } from '@/views/firewall/useStore'
const Message = useMessage()

const { mainHeight } = useGlobalStore()
const {
	refs: { systemTabActive },
} = getFirewallStore()

const portTableRef = ref() // 表格ref
const tableLoading = ref(false) // 加载状态
const tableData = ref<any>([]) //列表数据
const tableParam = reactive({
	p: 1,
	row: 20,
})

const searchValue = ref('') // 搜索
const completedTotal = ref(0) // 总条数
const rowData = ref<any>({}) // 行数据

const showDetailPopup = ref(false) // 显示详情弹窗
const process = reactive({
	processName: ['进程名', ''],
	processId: ['进程pid', ''],
	processTip: ['启动命令', ''],
})

const searchEvent = () => {
	tableParam.p = 1
	statusFilterKey.value = 'ALL'
	getPortRulesData()
}

/**
 * @description 打开防扫描
 */
const openAntiPlugin = async () => {
	const res = await getPluginStatus('fail2ban')
	if (!res.setup) {
		// 打开安装插件弹窗
		pluginInstallDialog({
			name: res.name,
			type: 'i',
			pluginInfo: res,
		})
		Message.warn('请先安装防暴破插件')
	} else {
		useDialog({
			title: '端口防扫描',
			area: 60,
			compData: { type: 'AntiScan', requestFn: () => getAntiScanLogs() },
			component: () => import('@firewall/public/anti-plugin-log/index.vue'),
		})
	}
}

/**
 * @description 添加端口规则
 */
const openAddRuleView = (isEdit?: boolean) => {
	useDialog({
		title: isEdit ? '修改端口规则' : '添加端口规则',
		area: 44,
		component: () => import('./add-port-rule.vue'),
		compData: { ...rowData.value, isEdit, refreshFn: getPortRulesData },
		showFooter: true,
	})
}

/**
 * @description 切换列表页面
 */
const getPortRulesData = async (chain?: string) => {
	// 若非当前tab则不请求
	if (systemTabActive.value !== 'port') return
	if (chain) statusFilterKey.value = chain
	await useDataHandle({
		loading: tableLoading,
		data: {
			data: [Array, tableData],
			page: useDataPage(completedTotal),
		},
		request: getPortList({ chain: statusFilterKey.value || 'ALL', ...tableParam, query: searchValue.value }),
	})
	tableData.value = tableData.value.map((item: any) => ({ ...item, key: `${item.Port}_${item.id}_${item.Family}` }))
}

/**
 * @description 删除端口规则
 * @param {any} data 端口规则行数据
 */
const deleteEvent = async (row: any, isMult?: string) => {
	await useConfirm({
		icon: 'warning-filled',
		title: '删除端口规则【' + row.Port + '】',
		content: '删除当前端口规则，是否继续操作？',
	})
	const params = {
		...handleRowParams(row, 'remove'),
		domain: row.domain,
	}
	await useDataHandle({
		loading: '正在删除端口规则，请稍后...',
		request: addPortRules(params, false),
		message: true,
		success: () => getPortRulesData(),
	})
}

/**
 * @description 处理行数据
 */
const handleRowParams = (row: any, operation: string) => {
	const params = {
		operation,
		protocol: row.Protocol,
		address: row.Address,
		port: row.Port,
		strategy: row.Strategy,
		chain: row.Chain,
		brief: row.brief,
	}
	return params
}

/**
 * @description 修改端口规则策略
 * @param {any} data 端口规则行数据
 */
const changePolicy = async (row?: any) => {
	const isTypes = row.Strategy === 'accept' ? false : true
	await useConfirm({
		icon: 'warning-filled',
		title: '修改端口规则策略【' + row.Port + '】',
		content: `修改端口策略为“${isTypes ? '放行' : '禁止'}”，设置后该端口将${isTypes ? '恢复正常访问' : '禁止访问服务器'}，是否继续操作？`,
	})

	const params = {
		old_data: JSON.stringify({ ...row }),
		new_data: JSON.stringify({ ...handleRowParams({ ...row, Strategy: isTypes ? 'accept' : 'drop' }, 'add') }),
	}

	await useDataHandle({
		loading: '正在修改端口规则策略...',
		request: editPortRules(params, false),
		message: true,
		success: () => getPortRulesData(),
	})
}

/**
 * @description 显示端口详情
 */
const showPortDetails = async (row: any) => {
	rowData.value = row
	await useDataHandle({
		loading: '正在获取数据,请稍后...',
		request: getListeningProcesses({ port: row.Port }),
		success: ({ data }: any) => {
			process.processName[1] = data.process_name
			process.processId[1] = data.process_pid
			process.processTip[1] = data.process_cmd
		},
	})
	showDetailPopup.value = true
}

const TableBatchOptions = [
	{
		label: '删除',
		value: 'delete',
		event: async (batchConfirm: TableBatchDialogProps, nextAll: TableBatchNextAllProps) => {
			const requestHandle = async (item: any, index: number) => {
				const params = {
					...handleRowParams(item, 'remove'),
					domain: item.domain,
				}
				return await addPortRules(params, false)
			}
			await useBatchEvent(batchConfirm, nextAll, requestHandle, { label: '端口', prop: 'Port' }, getPortRulesData)
		},
	},
]
/**
 * @description 表格配置
 */
const tableColumn = ref([
	useCheckbox({ key: 'key' }),
	{ label: '协议', width: 80, prop: 'Protocol' },
	{
		label: '端口', // 用户名
		width: 120,
		renderHeader: () => renderIconTip('端口', '防火墙会加载系统所有端口信息，IPV6端口无法与IPV4分开管理，非必要勿删除IPV6端口'),
		render: (row: any, index: number) => {
			row.brief = row.brief || portsPs[row.Port]
			return <span class={'mr-[1rem]'}>{row.Port + (row.Family === 'ipv6' ? '（ipv6）' : '')}</span>
		},
	},
	{
		label: '状态',
		width: 100,
		renderHeader: () => renderIconTip('状态', 'link', 'https://www.bt.cn/bbs/thread-4708-1-1.html'),
		render: (row: any, index: number) => {
			return (
				<div>
					<span>{row.status === 0 ? '未使用' : row.status === 1 && !row.Port?.includes('-') ? '外网不通' : '正常'}</span>
					<span class={row.status !== 2 || row.Port?.includes('-') || row.Protocol === 'udp' ? '!hidden' : 'bt-link'} onClick={() => showPortDetails(row)}>
						（详情）
					</span>
				</div>
			)
		},
	},
	...useFirewallColumn({ changePolicy, change: getPortRulesData }),
	{
		label: '来源',
		render: (row: any, index: number) => {
			return <div>{row.sid > 0 ? <span title={row.domain}>{row.domain}</span> : row.Address === 'all' ? <span>所有IP</span> : <span title={row.Address}>{row.Address}</span>}</div>
		},
	},
	{
		label: '备注',
		showOverflowTooltip: true,
		render: (row: any) => <span>{row.brief || portsPs[row.Port] || ''}</span>,
	},
	{
		label: '时间',
		prop: 'addtime',
		width: 160,
		renderHeader: () => renderIconTip('时间', '-- : 表示面板数据库中未记录更新时间，规则从系统中直接读取，忽略即可'),
	},
	useFirewallOperate({
		editEvent: (row: any) => {
			rowData.value = row
			openAddRuleView(true)
		},
		deleteEvent,
	}),
])

// 页面加载完成
onMounted(() => {
	// 专版挂载方法
	nextTick(async () => {
		try {
			const plugin = await window.$extension()
			if (!plugin) return getPortRulesData()
			const status = plugin.extensionElement({
				custom: {
					useOperate,
					portsPs,
					setPortConfig: (val: any) => {
						tableColumn.value[2] = val
						getPortRulesData()
					},
				},
			}) // 专版挂载方法
			if (status.every((value: boolean) => value === false)) return getPortRulesData()
		} catch (error) {
			return getPortRulesData()
		}
	})
})
</script>

<style lang="css" scoped>
/* :deep(.el-radio-button__inner) {
	padding: 8px 16px !important;
} */
</style>
