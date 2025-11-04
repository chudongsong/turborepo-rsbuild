<template>
	<div>
		<bt-table v-bt-loading="tableLoading" v-bt-loading:title="'正在加载中，请稍后...'" :column="tableColumn" :data="tableData"></bt-table>
	</div>
</template>

<script lang="tsx" setup>
import { getPhpSiteList, setSiteSecurityStatus } from '@/api/firewall'
import { useOperate } from '@/hooks/tools/table/column'
import { useDialog } from '@hooks/tools'
import { useDataHandle } from '@hooks/tools'
import { useGlobalStore } from '@store/global'

const { mainHeight } = useGlobalStore()

const tableLoading = ref<boolean>(false) // 表格loading
const tableData = ref([]) // 表格数据

//设置文件监视器
const setFileMonitor = (row: any) => {
	useDialog({
		title: `【${row.site_name}】设置`,
		area: [95, 58],
		component: () => import('./file-monitor/index.vue'),
		compData: row,
	})
}

//网站安全日志
const lookSiteSafeLog = (row: any) => {
	useDialog({
		title: `【${row.site_name}】网站安全日志`,
		area: 93,
		component: () => import('./site-safe-log/index.vue'),
		compData: { row },
	})
}

/**
 * @description: 切换防护状态
 * @param siteName 站点名称
 * @param status 状态
 */
const changeSafeStatus = async (siteName: string, status: boolean) => {
	await useDataHandle({
		loading: '正在' + (status ? '开启' : '关闭') + '防护状态，请稍后...',
		request: setSiteSecurityStatus(status, { siteName }),
		message: true,
	})
	getPhpSiteSafeList()
}

/**
 * @description 获取PHP网站安全列表
 */
const getPhpSiteSafeList = async () => {
	await useDataHandle({
		loading: tableLoading,
		request: getPhpSiteList(),
		data: { sites: [Array, tableData] },
	})
}

const tableColumn = [
	{ label: '网站名称', prop: 'site_name' },
	{
		label: '防护状态',
		render: (row: any) => {
			return h(ElSwitch, {
				modelValue: row.open,
				onChange: (val: any) => changeSafeStatus(row.site_name, val),
				size: 'small',
			})
		},
	},
	{ label: '今日触发', prop: 'total.day_total' },
	{ label: '触发总数', prop: 'total.total' },
	{
		label: 'PHP版本',
		render: (row: any) => <span class={row.version.includes('不兼容') ? '!text-danger' : ''}>{row.version}</span>,
	},
	useOperate([
		// { onClick: setFileMonitor, title: '设置' },
		{ onClick: lookSiteSafeLog, title: '日志' },
	]), // 操作
]

onMounted(async () => getPhpSiteSafeList())
</script>
