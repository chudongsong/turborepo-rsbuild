<template>
	<div class="p-[20px] h-full">
		<bt-table-group>
			<template #header-left>
				<el-button type="primary" @click="routeBackupBtn">备份</el-button>
			</template>
			<template #content>
				<bt-table ref="routeBackup" :data="tableData" v-bt-loading="tableLoading" v-bt-loading:title="'正在加载中，请稍后...'" :max-height="400" :column="backTableColumn"></bt-table>
			</template>
		</bt-table-group>
	</div>
</template>
<script lang="ts" setup>
import { backupSqlite, delSqliteBackup, getSqliteBackup } from '@/api/database'
import { useOperate, usePath } from '@/hooks/tools/table/column'
import { getDatabaseStore } from '@database/useStore'
import { useDataHandle } from '@hooks/tools'
import { formatTime, getByteUnit } from '@utils/index'

interface Props {
	compData: any
}

const { refreshTableList } = getDatabaseStore()

const props = withDefaults(defineProps<Props>(), {
	compData: () => ({}),
})

const tableLoading = ref(false) // 表格loading
const tableData = ref([]) // 表格数据

/**
 * @description 备份数据库
 */
const routeBackupBtn = async () => {
	try {
		await useDataHandle({
			loading: '正在备份数据库，请稍后...',
			message: true,
			request: backupSqlite({
				data: JSON.stringify({ path: props.compData.path }),
			}),
		})
		getList()
		refreshTableList()
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description 下载数据库备份文件
 */
const downBackEvent = (row: any) => {
	window.open('/download?filename=' + row.filepath, '_blank', 'noopener,noreferrer')
}

/**
 * @description 删除数据库备份文件
 */
const delBackEvent = async (row: any) => {
	try {
		await useDataHandle({
			loading: '正在删除数据库备份文件...',
			message: true,
			request: delSqliteBackup({
				data: JSON.stringify({ file: row.filepath }),
			}),
		})
		getList()
		refreshTableList()
	} catch (error) {}
}

const backTableColumn = [
	{ label: '名称', prop: 'name', showOverflowTooltip: true }, // 名称
	{
		label: '时间',
		width: 160,
		render: (row: any) => h('span', formatTime(row.mtime)),
	},
	{ label: '大小', render: (row: any) => getByteUnit(row.size) }, //大小
	useOperate([
		{ onClick: downBackEvent, title: '下载' },
		{ onClick: delBackEvent, title: '删除' },
	]), // 操作
]

/**
 * @description 获取数据库备份列表
 */
const getList = async () => {
	await useDataHandle({
		loading: tableLoading,
		request: getSqliteBackup({
			data: JSON.stringify({ path: props.compData.path }),
		}),
		data: [Array, tableData],
	})
}

onMounted(() => {
	getList()
})
</script>
