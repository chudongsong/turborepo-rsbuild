<template>
	<div>
		<bt-table-group>
			<template #content>
				<bt-table :column="tableColumn" :data="tableData" :description="'暂无木马文件'" v-bt-loading="tableLoad" v-bt-loading:title="'正在加载列表，请稍后...'" />
			</template>
			<template #footer-left>
				<bt-help :options="helpList" class="pl-[2rem]"></bt-help>
			</template>
		</bt-table-group>
	</div>
</template>

<script lang="tsx" setup>
import { deleteIsolation, getIsolationList, recoverIsolation } from '@/api/firewall'
import { useOperate } from '@/hooks/tools/table/column'
import { useConfirm, useDataHandle } from '@hooks/tools'
import { useGlobalStore } from '@store/global'
import { formatTime } from '@utils/index'

const { mainHeight } = useGlobalStore()

const tableData = shallowRef<any>([]) // 表格数据
const tableLoad = shallowRef(false) // 表格loading

// 提示文本
const helpList = [
	{
		content: '隔离箱是指将被感染的文件隔离到隔离箱中，隔离箱中的文件不会影响网站正常运行。',
	},
	{
		content: '隔离箱中的文件可以通过隔离箱管理功能进行查看、删除、恢复等操作。',
	},
]

// 文件编辑器打开
const fileEditorOpen = (row: any): void => {}

/**
 * @description 恢复文件
 */
const recoverEvent = async (row: any): Promise<void> => {
	await useConfirm({
		title: `恢复文件`,
		width: '35rem',
		content: `从木马隔离箱中恢复【${row.name}】文件，是否继续？`,
	})

	await useDataHandle({
		loading: '正在恢复文件，请稍后...',
		request: recoverIsolation({ path: row.rname }),
		message: true,
		success: (res: any) => {
			if (res.status) getIsolationListEvent()
		},
	})
}

/**
 * @description 删除文件
 */
const deleteEvent = async (row: any): Promise<void> => {
	await useConfirm({
		title: `删除文件`,
		width: '35rem',
		content: `永久删除【${row.name}】文件后将无法恢复，是否继续？`,
	})
	await useDataHandle({
		loading: '正在删除文件，请稍后...',
		request: deleteIsolation({ path: row.rname }),
		message: true,
		success: (res: any) => {
			if (res.status) getIsolationListEvent()
		},
	})
}

/**
 * @description 获取木马隔离箱表格数据
 */
const getIsolationListEvent = async () => {
	await useDataHandle({
		loading: tableLoad,
		request: getIsolationList(),
		data: [Array, tableData],
	})
}

// 表格列
const tableColumn = [
	{ label: '文件名', prop: 'name' },
	{
		label: '原路径',
		render: (row: any) => {
			return (
				<span class="bt-link" onClick={() => fileEditorOpen(row)}>
					{row.dname}
				</span>
			)
		},
	},
	{
		label: '被隔离时间',
		width: 150,
		render: (row: any) => h('span', formatTime(row.time)),
	},
	useOperate([
		{ onClick: recoverEvent, title: '恢复' },
		{ onClick: deleteEvent, title: '永久删除', width: 60 },
	]), // 操作
]

onMounted(() => getIsolationListEvent())
</script>
