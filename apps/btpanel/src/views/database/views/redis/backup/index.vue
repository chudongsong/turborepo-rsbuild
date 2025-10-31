<template>
	<div class="p-20px">
		<bt-table-group>
			<template #header-left>
				<el-button type="primary" @click="onNowBackEvent">立即备份</el-button>
				<el-button @click="assignedBackPopup = true">指定备份</el-button>
			</template>
			<template #content>
				<bt-table max-height="400" ref="routeBackup" v-bt-loading="loading" v-bt-loading:title="'正在加载备份列表，请稍后...'" :data="tableData" class="h-full" :column="tableColumn"></bt-table>
			</template>

			<template #popup>
				<bt-dialog :area="36" title="指定备份数据库" @confirm="onAssigned" show-footer v-model="assignedBackPopup">
					<div class="flex items-center p-20px">
						数据库
						<el-select v-model="assignedDb" class="ml-20px !w-[24rem]">
							<el-option v-for="(item, index) in keyList" :key="index" :value="item.id" :label="item.name"></el-option>
						</el-select>
					</div>
				</bt-dialog>
			</template>
		</bt-table-group>
	</div>
</template>

<script lang="ts" setup>
import type { KeyItem } from '@database/types'

import { getDatabaseStore } from '@/views/database/useStore'
import { backModuleDatabase, getRedisBackupList, restoreModuleBack } from '@/api/database'
import { deleteFile } from '@/api/global'

import { useConfirm } from '@hooks/tools'
import { useOperate } from '@/hooks/tools/table/column'
import { useDataHandle } from '@hooks/tools'
import { formatTime, getByteUnit } from '@utils/index'

interface Props {
	compData: {
		sid: number
		keyList: Array<KeyItem>
	}
}

const props = withDefaults(defineProps<Props>(), {
	compData: () => ({
		sid: 0,
		keyList: [],
	}),
})

const { refreshTableList } = getDatabaseStore() // 刷新表格

const loading = ref(false) // 表格loading
const tableData = ref([]) // 表格数据
const assignedDb = ref(0) // 指定备份的数据库
const assignedBackPopup = ref(false) // 指定备份弹窗

const keyList = useVModel(props.compData, 'keyList') // 数据库key列表
const sid = useVModel(props.compData, 'sid') // 服务器id

/**
 * @description 获取备份列表
 */
const getRedisBack = async () => {
	// try {
	await useDataHandle({
		loading: loading,
		request: getRedisBackupList({ data: JSON.stringify({ sort: 'desc' }) }),
		data: [Array, tableData],
	})
}

/**
 * @description 恢复备份
 */
const restoreBackEvent = async (row: any) => {
	await useConfirm({
		title: '覆盖数据',
		icon: 'warning-filled',
		type: 'input',
		input: { content: '覆盖数据' },
		content: '即将使用【' + row.name + '】对数据进行覆盖，是否继续?',
	})
	await useDataHandle({
		loading: '正在恢复备份中，请稍后...',
		request: restoreModuleBack(
			{
				data: JSON.stringify({ file: row.filepath, sid: sid.value }),
			},
			'redis'
		),
		message: true,
	})
	refreshTableList()
}

/**
 * @description 立即备份
 */
const onNowBackEvent = async () => {
	await useDataHandle({
		loading: '正在备份数据库,请稍后...',
		request: backModuleDatabase({}, 'redis'),
		message: true,
	})
	getRedisBack()
}

/**
 * @description 指定备份
 */
const onAssigned = async () => {
	await useDataHandle({
		loading: '正在备份数据库,请稍后...',
		request: backModuleDatabase(
			{
				data: JSON.stringify({ db_idx: String(assignedDb.value), sid: sid.value }),
			},
			'redis'
		),
		message: true,
	})
	getRedisBack()
	assignedBackPopup.value = false
}

/**
 * @description 删除备份
 */
const deleteBackEvent = async (row: any) => {
	await useConfirm({
		title: '删除备份【' + row.name + '】',
		content: '是否删除【' + row.name + '】备份?',
	})
	await useDataHandle({
		loading: '正在备份数据库,请稍后...',
		request: deleteFile({ path: row.filepath }),
		message: true,
	})
	getRedisBack()
}

const tableColumn = [
	{ label: '名称', prop: 'name', showOverflowTooltip: true },
	{ label: '路径', prop: 'filepath', showOverflowTooltip: true },
	{ label: '备份时间', prop: 'mtime', render: (row: any) => h('span', formatTime(row.mtime)) },
	{ label: '大小', render: (row: any) => h('span', getByteUnit(row.size)) },
	useOperate([
		{ onClick: restoreBackEvent, title: '恢复' },
		{ onClick: deleteBackEvent, title: '删除' },
	]), // 操作
]

onMounted(() => getRedisBack())
</script>
