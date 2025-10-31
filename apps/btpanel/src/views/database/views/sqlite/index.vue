<template>
	<div>
		<bt-table-group>
			<template #header-left>
				<el-button type="primary" @click="openAddSqlite"> 添加数据库文件 </el-button>
			</template>
			<template #content>
				<bt-table ref="sqliteTableRef" :column="tableColumn" :data="sqliteList" v-bt-loading="sqliteLoading" v-bt-loading:title="'正在加载数据库列表...'"></bt-table>
			</template>
			<template #footer-left>
				<bt-table-batch :table-ref="sqliteTableRef" :options="batchOptions" />
			</template>
		</bt-table-group>
	</div>
</template>
<script lang="tsx" setup>
import type { TableColumnProps } from '@/components/data/bt-table/types.d'
import type { TableBatchEventProps } from '@/components/extension/bt-table-batch/types.d'

import { useBatchStatus, useCheckbox, useOperate, usePath, usePathSize } from '@/hooks/tools/table/column'
import { backupSqliteData, deleteDatabase, deleteSqliteData, getModulesList } from '@api/database'
import { getDatabaseStore } from '@database/useStore'
import { useConfirm, useDataHandle, useDialog } from '@hooks/tools'
import { assembBatchParams, assembBatchResults, openResultView } from '@/public'

const {
	refs: { isRefreshTable },
	resetRefresh,
} = getDatabaseStore()

const sqliteTableRef = ref() // 表格ref
const sqliteLoading = ref(false) // 加载中
const sqliteList = ref([]) // 数据库列表

/**
 * @description 批量操作
 */
const useGeneralBatch: TableBatchEventProps = async (batchConfirm, nextAll, selectedList, options, clearBatch): Promise<void> => {
	const { label, value } = options // label: 操作名称，value: 操作类型
	const requestHandle = async () => {
		const requestList: any = {
			back: backupSqliteData,
			delete: deleteSqliteData,
		}
		const fn = requestList[value]
		const list = selectedList.value.map((item: any) => ({ path: item.path, name: item.name }))
		const params = assembBatchParams([], [], false, {
			params: { database_list: list },
		})
		if (fn) return await fn(params)
	}

	await batchConfirm({
		title: `批量${label}`,
		content: `批量${label}已选数据库，是否继续操作！`,
		column: [{ prop: 'name', label: '数据库名' }, useBatchStatus()] as TableColumnProps[], // 弹窗配置
		onConfirm: async () => {
			const res = await requestHandle()
			getSqliteList() // 刷新列表
			const { data } = assembBatchResults(res.data)
			openResultView(data, { title: `${label}` })
			clearBatch && clearBatch()
		},
	})
}

/**
 * @description 添加数据库文件
 */
const openAddSqlite = () => {
	useDialog({
		title: '添加SQLite数据库',
		area: 48,
		btn: true, // 显示按钮
		component: () => import('./add-sqlite.vue'),
	})
}

/**
 * @description 备份数据库
 */
const backupSqlite = async (row: any) => {
	// try {
	// 	const { data } = await syncToSqlite({
	// 		data: JSON.stringify({ path: row.path }),
	// 	})
	// 	return data
	// } catch (error) {}
}

/**
 * @description 管理数据库
 */
const mangerSqliteEvent = (row: any) => {
	useDialog({
		title: '管理',
		area: [114, 65],
		compData: { ...row, list: sqliteList.value },
		component: () => import('./manger-sqlite/index.vue'),
	})
}

/**
 * @description 删除数据库文件
 * @param row 当前行数据
 */
const deleteDataEvent = async (row: any) => {
	try {
		await useConfirm({
			title: '删除数据库文件【' + row?.name + '】',
			content: `删除选中的数据库文件后，该数据库文件将不在列表中显示，是否继续操作？`,
		})
		await useDataHandle({
			request: deleteDatabase({ path: row.path }, 'sqlite'),
			loading: '正在删除数据库,请稍后...',
			message: true,
		})
		getSqliteList()
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description 备份数据库
 */
const sqliteBackup = (row: any) => {
	useDialog({
		title: '数据库备份详情【' + row.name + '】',
		area: 70,
		compData: row,
		component: () => import('./back-sqlite.vue'),
	})
}

/**
 * @description 获取数据库列表
 */
const getSqliteList = async () => {
	try {
		const res = await useDataHandle({
			request: getModulesList({}, 'sqlite'),
			loading: sqliteLoading,
		})
		sqliteList.value = res?.data
	} catch (error) {
		console.log(error)
	}
}

const tableColumn = [
	useCheckbox({ type: 'page', key: 'name' }), // 复选框
	{ label: '数据库名称', prop: 'name', minWidth: 90 },
	{
		label: '备份',
		minWidth: 180,
		isCustom: true,
		render: (row: any) => {
			return (
				<span class={`cursor-pointer`} style={{ color: row.backup_count > 0 ? 'var(--el-color-primary)' : '#f0ad4e' }} onClick={() => sqliteBackup(row)}>
					{row.backup_count > 0 ? `有备份(${row.backup_count})` : `点击备份`}
				</span>
			)
		},
	},
	usePath({ prop: 'path' }), // 路径
	usePathSize({ prop: 'size', width: 100 }),
	useOperate([
		{ onClick: mangerSqliteEvent, title: '管理' },
		{ onClick: deleteDataEvent, title: '删除' },
	]), // 操作
]

const batchOptions = [
	{ label: '备份数据库', value: 'back', event: useGeneralBatch },
	{ label: '删除数据库', value: 'delete', event: useGeneralBatch },
]

// 监听表格刷新
watch(
	() => isRefreshTable.value,
	async (value: boolean) => {
		if (value) await getSqliteList()
		resetRefresh() // 重置
	}
)

onMounted(() => {
	getSqliteList()
})
</script>
