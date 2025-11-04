<template>
	<div class="p-[16px]">
		<bt-table-group>
			<template #header-left>
				<el-alert class="font-bold" :title="toolsTop" type="info" :closable="false"></el-alert>
			</template>

			<template #content>
				<bt-table v-if="tabActive === 'mysql'" max-height="300" v-bt-loading="tableLoading" ref="mysqlToolsRef" v-bt-loading:title="'正在查询中，请稍后...'" :column="tableColumn" :data="toolsDataValue" />

				<bt-table v-if="!(tabActive === 'mysql')" max-height="300" ref="modulesToolsRef" :column="moduleColumn" :data="toolsDataValue" />
			</template>

			<template #footer-left v-if="tabActive == 'mysql'">
				<bt-table-batch :options="batchOptions" :table-ref="mysqlToolsRef" />
			</template>

			<template #popup>
				<bt-dialog :title="`导出表【${exportTableRow.table_name}】结构`" v-model="exportPopup" :area="[50]" show-footer @confirm="onConfirmExport()" @cancel="onCancelExport()">
					<el-form ref="exportTableForm" class="px-2rem py-3rem" :model="exportTableRow" :rules="rules">
						<el-form-item label="导出文件路径" prop="filename">
							<bt-input-icon icon="icon-file_mode" v-model="exportTableRow.filename" v-trim name="filename" @icon-click="onPathChange" width="32rem" />
						</el-form-item>
					</el-form>
				</bt-dialog>
			</template>
		</bt-table-group>

		<ul class="mt-[8px] ml-[16px] leading-8 text-small list-disc" v-if="tabActive === 'mysql'">
			<li>【优化】执行OPTIMIZE命令，可回收未释放的磁盘空间，建议每月执行一次</li>
			<li>【修复】尝试使用REPAIR命令修复损坏的表，仅能做简单修复，若修复不成功请考虑使用myisamchk工具</li>
			<li>【MyISAM】转换数据表引擎，建议将所有表转为InnoDB</li>
			<li>数据库大小是从数据库表中读取，会与数据库配额容量中获取存在些许误差，请注意</li>
		</ul>
	</div>
</template>
<script lang="tsx" setup>
import type { TableColumnProps } from '@components/data/bt-table/types'
import type { TableBatchEventProps } from '@components/extension/bt-table-batch/types'

import { conversionTable, exportTableStr, getModulesTableInfo, getTableInfo, modifyTableComment, optimizeTable, repairTable } from '@api/database'
import { getDatabaseStore } from '@database/useStore'

import { useBatchStatus, useCheckbox, useOperate, usePs } from '@/hooks/tools/table/column'
import { fileSelectionDialog } from '@/public/index'
import { Message, useDataHandle, useHandleError } from '@hooks/tools'
import { getByteUnit } from '@utils/index'

interface Props {
	compData?: {
		name: string
	}
}

interface OperateData {
	tables: string
	db_name: string
	table_type?: string
}

const props = withDefaults(defineProps<Props>(), {
	compData: () => ({
		name: '',
	}),
})

const {
	refs: { tabActive },
} = getDatabaseStore()

const mysqlToolsRef = ref() // 表格ref

const tableLoading = ref(false) // 表格loading
const toolsTop = ref('暂无数据') // 顶部提示
const toolsDataValue = ref([]) // 工具箱数据

const exportPopup = ref(false) // 导出表结构弹窗
const exportTableForm = ref() // 导出表结构表单实例
const exportTableRow = reactive({
	db_name: '',
	table_name: '',
	filename: '',
}) // 导出表结构行数据
const rules = reactive({
	filename: [
		{
			required: true,
			message: '请输入导出文件路径',
			trigger: ['blur', 'input'],
		},
	],
})

/**
 * @description 批量操作事件
 * @param {string} type  操作类型
 * @param {AnyFunction} request 请求方法
 */
const batchEvent: TableBatchEventProps = async (batchConfirm, nextAll, selectedList, options) => {
	let describe: { [key: string]: Array<string> } = {
		Repair: ['修复', ''],
		Optimization: ['优化', '，将回收未释放的磁盘空间，'],
		InnoDB: ['转换引擎', '为【InnoDB】'],
		MyISAM: ['转换引擎', '为【MyISAM】'],
	}
	const { label, value } = options
	await batchConfirm({
		title: `批量${label}`,
		content: `批量${describe[value][0]}已选数据库表${describe[value][1]}，是否继续？`,
		column: [{ prop: 'table_name', label: '表名' }, useBatchStatus()] as TableColumnProps[], // 弹窗配置
		onConfirm: async () => {
			// 递归操作所有选中的数据，如果不需要递归则不需要该方法，执行单接口请求
			await nextAll((data: any) => handleOperateRequest(data, value))
			init() // 执行完毕的代码，刷新列表
			return false
		},
	})
}

/**
 * @description 操作事件
 * @param data  行数据
 * @param type  操作类型 Repair,Optimization,InnoDB,MyISAM
 */
const handleOperateRequest = async (data: any, type: string) => {
	const { table_name } = data
	try {
		let params: OperateData = {
			db_name: props.compData.name,
			tables: JSON.stringify([table_name]),
			table_type: type,
		}
		// 如果是Repair,Optimization操作则不需要传递table_type
		if (type === 'Repair' || type === 'Optimization') delete params.table_type
		switch (type) {
			case 'Repair':
				return await repairTable(params)
			case 'Optimization':
				return await optimizeTable(params)
			case 'InnoDB':
			case 'MyISAM':
				return await conversionTable(params)
		}
	} catch (error) {
		useHandleError(error, 'tools-handleOperateRequest')
	}
}

/**
 * @description: 设置Mysql工具表备注
 * @param {ToolsTableDataProps} row 行数据
 * @return {Promise<void>}
 */
const setPsEvent = async (row: any, comment: string) => {
	await useDataHandle({
		loading: '正在修改中，请稍后...',
		request: modifyTableComment({
			db_name: props.compData.name,
			table_name: row.table_name,
			comment: comment,
		}),
		message: true,
	})
	init()
}

/**
 * @description 表格配置
 * @returns {Promise<void>} void
 */
const useToolsTableColumn = () => {
	return [
		useCheckbox({ key: 'table_name' }), // 复选框
		{ label: '表名', prop: 'table_name', showOverflowTooltip: true },
		usePs({ request: (row, item) => setPsEvent(row, item), prop: 'comment' }),
		{ label: '引擎', prop: 'type', width: 80 },
		{ label: '字符集', prop: 'collation', showOverflowTooltip: true },
		{ label: '行数', align: 'center', width: 60, prop: 'rows_count' },
		{ label: '大小', prop: 'data_size' },
		useOperate([
			{
				onClick: (row: any) => {
					exportTableRow.db_name = props.compData.name
					exportTableRow.table_name = row.table_name
					exportPopup.value = true
				},
				title: '导出表结构',
				width: 70,
			},
			{
				onClick: (row: any) => handleOperateResult(row, 'Repair'),
				title: '修复',
			},
			{
				onClick: (row: any) => handleOperateResult(row, 'Optimization'),
				title: '优化',
			},
			{
				onClick: (row: any) => handleOperateResult(row, row.type === 'MyISAM' ? 'InnoDB' : 'MyISAM'),
				title: '转换引擎',
				width: 70,
			},
		]), // 操作
	]
}

/**
 * @description 导出表结构
 */
const exportTable = async (row: any) => {}

/**
 * @description: 触发目录选择
 */
const onPathChange = () => {
	fileSelectionDialog({
		type: 'dir',
		change: (path: string) => {
			exportTableRow.filename = path + '/' + exportTableRow.db_name + '_' + exportTableRow.table_name + '.sql'
		},
	})
}

/**
 * @description: 导出表结构确认
 * @return {void}
 */
const onConfirmExport = async () => {
	try {
		if (exportTableRow.filename === '') {
			Message.error('请填写导出文件路径')
			return false
		}
		await useDataHandle({
			loading: '正在导出中，请稍候...',
			request: exportTableStr(exportTableRow),
			message: true,
			success: () => {
				exportTableRow.table_name = ''
				exportTableRow.filename = ''
				exportTableForm.value.clearValidate()
				exportPopup.value = false
			},
		})
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description 取消导出表结构
 */
const onCancelExport = () => {
	exportPopup.value = false
	exportTableForm.value.resetFields()
	exportTableForm.value.clearValidate()
}

/**
 * @description 操作结果
 * @param row  行数据
 * @param type  操作类型
 */
const handleOperateResult = async (row: any, type: string) => {
	const loading = Message.load(`正在操作表【${row.table_name}】，请稍后...`)
	const res = await handleOperateRequest(row, type)
	loading.close()
	Message.request(res)
	init()
}

/**
 * @description 模块表格配置
 */
const modeulesTableColumn = () => {
	return [
		{ label: '集合名称', prop: 'collection_name' },
		{ label: '文档数量', prop: 'count' },
		{ label: '内存中的大小', render: (row: any) => getByteUnit(row.size) },
		{
			label: '对象平均大小',
			render: (row: any) => getByteUnit(row.avg_obj_size),
		},
		{ label: '存储大小', render: (row: any) => getByteUnit(row.storage_size) },
		{ label: '索引数量', prop: 'nindexes' },
		{
			label: '索引大小',
			render: (row: any) => getByteUnit(row.total_index_size),
		},
	]
}

const tableColumn = useToolsTableColumn() // 表格配置
const moduleColumn = modeulesTableColumn() // 模块表格配置

// 批量操作按钮组
const batchOptions = [
	{ label: '修复', value: 'Repair', event: batchEvent },
	{ label: '优化', value: 'Optimization', event: batchEvent },
	{ label: '转为InnoDB', value: 'InnoDB', event: batchEvent },
	{ label: '转为MyISAM', value: 'MyISAM', event: batchEvent },
]

/**
 * @description: 获取工具箱表格数据
 * @return {Promise<void>}
 */
const init = async () => {
	let params = { db_name: props.compData.name }
	const { data: res } = await useDataHandle({
		loading: tableLoading,
		request: tabActive.value == 'mysql' ? getTableInfo(params) : getModulesTableInfo({ data: JSON.stringify(params) }, tabActive.value),
	})
	// 表格数据
	if (tabActive.value === 'mysql') toolsDataValue.value = res.tables
	else toolsDataValue.value = res.data.collection_list
	// 顶部提示
	if (tabActive.value == 'mysql') {
		toolsTop.value = `数据库名称: ${res.database} 大小: ${res.data_size || 0}`
	} else {
		toolsTop.value = `数据库名称: ${res.data.db}
			 集合数量: ${res.data.collections || 0}
			 存储大小: ${getByteUnit(res.data.totalSize) || 0}
			 索引大小: ${getByteUnit(res.data.indexSize) || 0}`
	}
}

onMounted(() => {
	init()
})
</script>
