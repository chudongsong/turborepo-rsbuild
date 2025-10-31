<template>
	<bt-table-group>
		<template #header-left>
			<el-button v-if="!tableData?.length" type="primary" @click="openAddCorsEvent()">添加跨域</el-button>
		</template>
		<template #header-right>
			<bt-table-refresh @refresh="getCorsData"></bt-table-refresh>
		</template>
		<template #content>
			<bt-table :column="tableColumn" :data="tableData" v-bt-loading="tableLoading" />
		</template>
	</bt-table-group>
</template>

<script setup lang="ts">
import { deleteCorsConfig, getCorsConfig } from '@/api/site'
import { TableColumnProps } from '@/components/data/bt-table/types'
import { useConfirm, useDataHandle, useDialog } from '@/hooks/tools'
import { useOperate } from '@/hooks/tools/table/column'
import { useGlobalStore } from '@/store/global'
import { useSiteStore } from '@site/useStore'

const { plugin } = useGlobalStore()
const { webserver: webServerType } = plugin.value

const { siteInfo } = useSiteStore()

const tableLoading = ref<boolean>(false) // 表格loading
const tableData = ref<any>([]) // 表格数据

const useTableColumn = () => {
	return shallowRef<TableColumnProps[]>([
		{ label: '来源', prop: 'allowed_origins' },
		{ label: '请求方法', prop: 'allowed_methods' },
		{ label: '请求头', prop: 'allowed_headers' },
		{ label: '响应头', prop: 'exposed_headers' },
		{ label: '缓存时间', prop: 'max_age' },
		useOperate([
			{ onClick: openAddCorsEvent, title: '编辑' },
			{ onClick: deleteCorsEvent, title: '删除' },
		]), // 操作,
	])
}

/**
 * @description 打开添加编辑跨域弹窗
 */
const openAddCorsEvent = (row?: any) => {
	useDialog({
		title: row ? '编辑跨域' : '添加跨域',
		area: 62,
		component: () => import('./add-cors.vue'),
		compData: {
			rowData: row || false,
			path: `/www/server/panel/vhost/${webServerType}/${siteInfo.value.name}.conf`,
			refreshEvent: getCorsData,
		},
		btn: true,
	})
}

/**
 * @description 删除跨域事件
 */
const deleteCorsEvent = async (row: any) => {
	await useConfirm({
		icon: 'warning-filled',
		title: `删除【${row.allowed_origins}】`,
		content: '删除跨域配置后，该网站将无法进行跨域访问，是否继续操作？',
	})
	useDataHandle({
		loading: '正在删除，请稍后...',
		request: deleteCorsConfig({
			path: `/www/server/panel/vhost/${webServerType}/${siteInfo.value.name}.conf`,
			encoding: 'utf-8',
		}),
		message: true,
		success: (res: any) => {
			if (res.status) getCorsData()
		},
	})
}

/**
 * @description 获取跨域数据
 */
const getCorsData = () => {
	useDataHandle({
		loading: tableLoading,
		request: getCorsConfig({
			path: `/www/server/panel/vhost/${webServerType}/${siteInfo.value.name}.conf`,
		}),
		data: {
			msg: [Array, tableData],
		},
	})
}

const tableColumn = useTableColumn()

onMounted(() => getCorsData())
</script>

<style scoped></style>
