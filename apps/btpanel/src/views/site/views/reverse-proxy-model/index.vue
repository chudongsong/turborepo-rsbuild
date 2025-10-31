<template>
	<div>
		<EnvDetectionMask ref="envRef" @init="refresh" />
		<bt-table-group>
			<template #header-left>
				<BtOperation />
				<div class="flex items-center ml-1rem" @click="openNpsEvent">
					<i class="svgtofont-desired text-medium"></i>
					<span class="bt-link">需求反馈</span>
				</div>
			</template>
			<template #header-right>
				<div class="flex items-center mr-[10px]">
					<!-- <el-radio-group v-model="proxyType" class="proxy-radio" size="default" @change="changeProxyType">
						<el-radio-button label="http">HTTP代理</el-radio-button>
						<el-radio-button label="tcp">TCP/UDP代理</el-radio-button>
					</el-radio-group> -->
				</div>
				<div v-if="proxyType === 'http'" class="flex items-center">
					<BtSearch class="mr-[10px]" placeholder="请输入域名或备注" />
					<BtRefresh class="mr-[10px]" />
					<BtColumn />
				</div>
				<div v-if="proxyType === 'tcp'" class="flex items-center">
					<BtTcpSearch class="mr-[10px]" placeholder="请输入端口" />
					<BtTcpRefresh class="mr-[10px]" />
					<BtTcpColumn />
				</div>
			</template>
			<template #content>
				<BtTable v-if="proxyType === 'http'" />
				<BtTcpTable v-else />
			</template>
			<template #footer-left>
				<BtBatch v-if="proxyType === 'http'" />
			</template>
			<template #footer-right>
				<BtPage v-if="proxyType === 'http'" />
			</template>
		</bt-table-group>
	</div>
</template>

<script lang="tsx" setup>
import EnvDetectionMask from '@site/public/env-detection-mask/index.vue'
import BtSoftState from '@/components/extension/bt-soft-state/index.vue'
import { useAllTable, useTable, useBatch, useOperation, useRefreshList } from '@/hooks/tools'
import { useCheckbox, useOperate, usePs } from '@/hooks/tools/table/column'
import { useGlobalStore } from '@/store/global'
import { openNpsEvent, useBatchSslConfig, useSiteName, useSsl, envRef } from '@site/useController'
import { SITE_STORE } from '@site/useStore'
import { deleteProxySite, multDeleteProxySite, openAddProxySiteView, openPlugin, openSettingView, getUrlList, deleteEvent, openTcpSettingView, refreshTcpTable } from './useController'
import { SITE_PROXY_STORE } from './useStore'
const { mainHeight } = useGlobalStore()
const { getSiteList } = SITE_STORE()
const { activeType, isRefreshList } = storeToRefs(SITE_STORE())
const { proxyType } = storeToRefs(SITE_PROXY_STORE())

const pluginInfo = ref<any>({})
watch(
	envRef,
	val => {
		if (val?.pluginInfo) pluginInfo.value = val.pluginInfo
	},
	{ immediate: true, deep: true }
)

const { BtOperation } = useOperation({
	options: [
		{
			type: 'button',
			label: '添加反代',
			active: true,
			onClick: openAddProxySiteView,
		},
		{
			type: 'custom',
			render: () => <BtSoftState class="ml-1rem" isRequest={false} pluginInfo={pluginInfo.value}></BtSoftState>,
		},
	],
})

/**
 * @description 批量操作
 */
const useTableBatch = useBatch([
	useBatchSslConfig(),
	{
		label: '删除项目',
		value: 'delete',
		event: async (batchConfirm, nextAll, selectedList, options, clearSelection) => {
			multDeleteProxySite(selectedList.value, clearSelection)
		},
	},
])

const { BtTable, BtSearch, BtRefresh, BtPage, BtColumn, BtBatch, refresh } = useAllTable({
	request: getSiteList,
	columns: [
		useCheckbox(),
		useSiteName({
			label: '域名',
			type: activeType.value,
			openPlugin,
			onClick: (row: any) => {
				openSettingView(row)
			},
		}),
		{
			label: '代理地址', // 路径
			prop: 'proxy_pass',
			minWidth: 220,
			isCustom: true,
			render: (row: any) => {
				return (
					<span class="flex justify-start whitespace-pre-line bt-link cursor-pointer">
						<span
							class="full-path"
							onClick={() => {
								openSettingView(row, 'urlProxy')
							}}>
							{row.proxy_pass}
						</span>
					</span>
				)
			},
		},
		usePs({ table: 'sites', width: 200 }),
		useSsl({ onClick: (row: any) => openSettingView(row, 'ssl') }),
		useOperate([
			{ onClick: (row: any) => openPlugin(row, 'monitor'), title: '统计' },
			{ onClick: (row: any) => openPlugin(row, 'bt_waf'), title: 'WAF' },
			{ title: '设置', onClick: (row: any) => openSettingView(row) },
			{ title: '删除', onClick: (row: any) => deleteProxySite(row) },
		]),
	],
	extension: [useTableBatch, useRefreshList(isRefreshList)],
	empty: () => {
		return (
			<span>
				您的列表为空，您可以
				<span class="bt-link" onClick={openAddProxySiteView}>
					添加一个项目
				</span>
			</span>
		)
	},
})

// tcp表格
const {
	BtTable: BtTcpTable,
	refresh: tcpRefresh,
	BtRefresh: BtTcpRefresh,
	BtColumn: BtTcpColumn,
	BtSearch: BtTcpSearch,
} = useAllTable({
	request: getUrlList,
	columns: [
		{
			label: '端口', // 用户名
			prop: 'listen_port',
			width: 120,
		},
		{
			label: '协议', // 用户名
			prop: 'protocol',
			isCustom: true,
			width: 80,
		},
		{
			label: '目标', // 用户名
			prop: 'proxy_pass',
		},
		{
			label: '备注', // 用户名
			prop: 'ps',
		},
		// usePs({ request: setPsEvent, prop: 'remark' }),
		useOperate([
			{
				onClick: openTcpSettingView,
				title: '设置',
			},
			{
				onClick: (row: any) => deleteEvent(row, tcpRefresh),
				title: '删除',
			},
		]),
	],
	extension: [useRefreshList(isRefreshList)],
})

watch(
	() => refreshTcpTable.value,
	val => {
		if (val) {
			tcpRefresh()
			if (proxyType.value !== 'tcp') {
				proxyType.value = 'tcp'
			}
			refreshTcpTable.value = false
		}
	}
)

/**
 * @description 切换代理类型
 */
const changeProxyType = () => {
	switch (proxyType.value) {
		case 'http':
			refresh()
			break
		case 'tcp':
			tcpRefresh()
	}
}

onMounted(() => {
	nextTick(() => {
		import('@site/views/reverse-proxy-model/add-reverse-proxy/index.vue')
		import('@site/views/reverse-proxy-model/setting/index.vue')
	})
})
</script>

<style scoped>
:deep(.proxy-radio .el-radio-button__inner) {
	padding: 0.9rem 1.2rem !important;
}
</style>
