<template>
	<div>
		<bt-removed-tips></bt-removed-tips>
		<bt-table-group>
			<template #header-left>
				<div class="flex items-center">
					<el-button type="primary" @click="addPackageEvent">创建</el-button>
					<div class="flex items-center ml-1rem">
						<i class="svgtofont-desired text-medium"></i>
						<span class="bt-link" @click="openNpsEvent">需求反馈</span>
					</div>
				</div>
			</template>
			<template #content>
				<bt-table ref="appEnvTableRef" :column="TableColumn" :min-height="470" :data="tableData" v-bt-loading="isLoading" v-bt-loading:title="'正在获取列表，请稍候...'"></bt-table>
			</template>
			<template #footer-left>
				<bt-table-batch :table-ref="appEnvTableRef" :options="TableBatchOptions" />
			</template>
			<template #popup>
				<bt-dialog :title="logPopupData.title" v-model="logPopupData.visible" :area="60">
					<div class="p-2rem">
						<pre class="text-secondary max-h-[50rem] overflow-y-auto" v-html="logPopupData.log"></pre>
					</div>
				</bt-dialog>
			</template>
		</bt-table-group>
		<bt-help class="mt-[2rem]" :options="helpList" />
	</div>
</template>

<script setup lang="ts">
import { delPhpApp, getPhpAppList, setPhpApp } from '@/api/site'
import { TableColumnProps } from '@/components/data/bt-table/types'
import { TableBatchOptionsProps } from '@/components/extension/bt-table-batch/types'
import { useConfirm, useDataHandle, useDialog, useMessage } from '@/hooks/tools'
import { useBatchStatus, useCheckbox, useOperate } from '@/hooks/tools/table/column'
import { getByteUnit } from '@/utils'
import { openNpsEvent } from '@site/useController'

import { useSiteStore } from '@site/useStore'

const Message = useMessage() // 消息提示

const { siteInfo } = useSiteStore()

const isLoading = ref<boolean>(false) // 加载状态
const appEnvTableRef = ref<any>() // 表格实例
const tableData = ref<any>([]) // 表格数据

const logPopupData = reactive({
	visible: false,
	title: '',
	log: '',
}) // 更新日志弹窗数据

const helpList = [
	{
		isHtml: true,
		content: `使用教程：<a
			href="https://www.bt.cn/bbs/thread-132632-1-1.html"
			target="_blank"
			class="text-primary"
			>https://www.bt.cn/bbs/thread-132632-1-1.html</a
		>`,
	},
]

const batchOptions = (): TableBatchOptionsProps[] => {
	return [
		{
			label: '删除',
			value: 'deleteApp',
			event: async (batchConfirm, nextAll, selectedList, options) => {
				const requestHandle = async (item: any) =>
					await delPhpApp({
						site_name: siteInfo.value.name,
						app_name: item.app_name,
						app_version: item.app_version,
					})
				await batchConfirm({
					title: `批量删除应用包【${siteInfo.value.name}】`,
					content: `批量删除选中的应用包，是否继续操作？`,
					column: [{ prop: 'app_name', label: '名称' }, useBatchStatus()] as TableColumnProps[], // 弹窗配置
					onConfirm: async () => {
						await nextAll(requestHandle) // 递归操作所有选中的数据
						getDataList() // 执行完毕的代码，刷新列表
						// 返回false则不关闭弹窗
						return false
					},
				})
			},
		},
	]
}

const useTableColumn = () => {
	return shallowRef<TableColumnProps[]>([
		useCheckbox(),
		{ label: '名称', prop: 'app_name' },
		{ label: '版本', prop: 'app_version' },
		{
			label: '大小',
			prop: 'size',
			render: (row: any) => {
				return getByteUnit(Number(row.size)) || '--'
			},
		},
		{ label: '时间', prop: 'addtime', width: 150 },
		useOperate([
			{
				title: '应用',
				onClick: setApplyEvent,
			},
			{
				title: '下载',
				onClick: (row: any) => {
					window.open('/download?filename=' + row.package_path, '_blank', 'noopener,noreferrer')
				},
			},
			{
				title: '更新日志',
				onClick: (row: any) => {
					if (row.update_log === '') return Message.error('暂无更新日志')
					logPopupData.title = `【${row.app_name} v${row.app_version}】更新日志`
					logPopupData.log = row.update_log
					logPopupData.visible = true
				},
				width: 80,
			},
			{
				title: '删除',
				onClick: deleteEvent,
			},
		]),
	])
}

/**
 * @description 应用
 */
const setApplyEvent = async (row: any) => {
	await useConfirm({
		title: `应用环境包【${row.app_name}】`,
		icon: 'warning-filled',
		content: `您真的要应用环境包【${row.app_name}】吗？`,
	})
	useDataHandle({
		loading: '正在应用，请稍后...',
		request: setPhpApp({
			site_name: siteInfo.value.name,
			app_name: row.app_name,
			app_version: row.app_version,
		}),
		message: true,
	})
}

/**
 * @description 删除事件
 */
const deleteEvent = async (row: any) => {
	await useConfirm({
		icon: 'warning-filled',
		title: `删除环境包【${row.app_name}】`,
		content: `您真的要删除环境包【${row.app_name}】吗？`,
	})
	useDataHandle({
		loading: '正在删除，请稍后...',
		request: delPhpApp({
			site_name: siteInfo.value.name,
			app_name: row.app_name,
			app_version: row.app_version,
		}),
		message: true,
		success: (res: any) => {
			if (res.status) getDataList()
		},
	})
}

/**
 * @description 创建应用环境包
 */
const addPackageEvent = () => {
	useDialog({
		isAsync: true,
		title: '创建应用环境包',
		area: 70,
		btn: '确定',
		component: () => import('./create-package.vue'),
		compData: { refreshEvent: getDataList },
	})
}

/**
 * @description 获取数据列表
 */
const getDataList = () => {
	useDataHandle({
		loading: isLoading,
		request: getPhpAppList({ site_name: siteInfo.value.name }),
		data: {
			data: [Array, tableData],
		},
	})
}

const TableColumn = useTableColumn()
const TableBatchOptions = batchOptions()

onMounted(getDataList)

defineExpose({ init: getDataList })
</script>

<style scoped></style>
