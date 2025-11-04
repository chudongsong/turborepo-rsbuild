<!-- 添加站点--应用环境包 -->
<template>
	<div class="h-[58rem]">
		<bt-table-group>
			<template #header-left>
				<el-button type="primary" @click="importPackageEvent">导入应用包</el-button>
			</template>
			<template #header-right></template>
			<template #content>
				<bt-table ref="appEnvPackRef" :column="tableColumns" :data="tableData" :max-height="480" v-bt-loading="tableLoading" />
			</template>
			<template #footer-left>
				<bt-table-batch :table-ref="appEnvPackRef" :options="TableBatchOptions" />
			</template>
		</bt-table-group>
		<bt-help :options="helpList" class="list-disc mt-[2rem] ml-[2rem]"></bt-help>
	</div>
</template>

<script setup lang="tsx">
import { TableColumnProps } from '@/components/data/bt-table/types'
import { TableBatchEventProps, TableBatchOptionsProps } from '@/components/extension/bt-table-batch/types'
import { useConfirm } from '@/hooks/tools'
import { useDataHandle } from '@/hooks/tools'
import { useDialog } from '@/hooks/tools'
import { useBatchStatus, useCheckbox, useOperate } from '@/hooks/tools/table/column'
import { delPhpUploadApp, getPhpAppUploadList } from '@api/site'

const appEnvPackRef = ref<any>()
const popupClose = inject<any>('popupClose') //     弹窗关闭

const tableData = ref([]) // 响应式数据
const tableLoading = ref(false) // 响应式数据

const helpList = [{ content: '请选择您的环境包进行网站部署' }, { content: '如需导入,请选择本地计算机中后缀为tar.gz格式的应用环境包' }]

/**
 * @description 批量处理事件
 * @param {TableBatchDialogProps} batchCofirm 选中处理事件
 * @param {TableBatchNextAllProps} nextAll 选中处理事件
 * @param {AnyObject[]} selectedList 选中的数据
 * @param {TableBatchOptionsProps} options 选中的配置
 * @returns {Promise<void>} void
 */
const useBatchEventHandle: TableBatchEventProps = async (batchCofirm, nextAll, selectedList, options) => {
	const { label, value } = options
	const template: Map<string, string> = new Map([['delete', '批量删除选中的应用包']])
	const requestHandle = async (item: AnyObject, index: number) => {
		const requestList: Map<string, AnyFunction> = new Map([['delete', delPhpUploadApp]])
		const { app_name, app_version } = item
		const fn = requestList.get(value)
		switch (value) {
			case 'delete':
				if (fn) {
					return await fn({ app_name, app_version })
				}
		}
	}
	await batchCofirm({
		title: `批量${label}`,
		content: `${template.get(value) as string}，是否继续操作？`,
		column: [
			{
				label: '环境包',
				prop: 'app_name',
			},
			useBatchStatus(),
		] as TableColumnProps[], // 弹窗配置
		onConfirm: async () => {
			// 递归操作所有选中的数据，如果不需要递归则不需要该方法，执行单接口请求
			await nextAll(requestHandle)
			// 执行完毕的代码，刷新列表
			getList()
			return false
		},
	})
}

const batchOptions = (): TableBatchOptionsProps[] => {
	return [
		{
			label: '删除',
			value: 'delete',
			event: useBatchEventHandle,
		},
	]
}

const useTableColumn = () => {
	return ref<TableColumnProps[]>([
		useCheckbox(),
		{
			label: '名称',
			prop: 'app_name',
		},
		{
			label: '版本',
			prop: 'app_version',
		},
		{
			label: '时间',
			width: 150,
			prop: 'addtime',
		},
		useOperate([
			{ onClick: deployEvent, title: '部署' },
			{
				onClick: deleteEvent,
				title: '删除',
			},
		]),
	])
}

/**
 * @description: 删除事件
 * @param {any} row 行数据
 */
const deleteEvent = async (row: any) => {
	await useConfirm({
		title: `删除环境包【${row.app_name}】`,
		content: `您真的要删除环境包【${row.app_name}】吗？`,
	})
	const res: AnyObject = await useDataHandle({
		loading: '正在删除环境包，请稍后...',
		request: delPhpUploadApp({
			app_name: row.app_name,
			app_version: row.app_version,
		}),
		message: true,
	})
	if (res.status) getList()
}

/**
 * @description 导入应用环境包
 */
const importPackageEvent = async () => {
	useDialog({
		title: `上传应用环境包`,
		isAsync: true,
		component: () => import('./upload-app.vue'),
		area: 80,
		btn: ['开始上传', '取消'],
		compData: {
			refreshEvent: getList,
			path: '/www/backup/upload_package/temp',
			api: '/mod/php/aepg/upload_package',
			accept: '.gz',
			help: [{ text: `只支持.tar.gz文件格式导入` }],
			useEmptyPlaceholder: false,
		},
	})
}

/**
 * @description 部署事件
 * @param {any} row 行数据
 */
const deployEvent = (row: any) => {
	useDialog({
		isAsync: true,
		title: '部署应用环境包',
		area: 70,
		btn: '确定',
		component: () => import('./deploy-package.vue'),
		compData: {
			...row,
			close: popupClose,
		},
	})
}

/**
 * @description 获取上传的应用环境包列表
 */
const getList = async () => {
	const res = await useDataHandle({
		loading: tableLoading,
		request: getPhpAppUploadList(),
		data: {
			data: [Array, tableData],
		},
	})
}

const tableColumns = useTableColumn() // 响应式数据
const TableBatchOptions = batchOptions() // 响应式数据

onMounted(getList)

defineExpose({ init: getList })
</script>
