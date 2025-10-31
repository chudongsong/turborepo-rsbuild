<template>
	<div class="p-[2rem]">
		<bt-removed-tips></bt-removed-tips>

		<bt-table-group>
			<template #header-left>
				<el-button type="primary" @click="addGroup()">添加分组</el-button>
			</template>
			<template #header-right>
				<bt-table-refresh @refresh="getGroupEvent"></bt-table-refresh>
			</template>
			<template #content>
				<bt-table ref="groupTable" :column="tableColumn" :max-height="340" :data="projectGroupData.list" :description="'容器组列表为空'" v-bt-loading="projectGroupData.loading" v-bt-loading:title="'正在加载中，请稍后...'" />
			</template>
			<template #footer-left>
				<bt-table-batch :table-ref="groupTable" :options="tableBatchData" />
			</template>
		</bt-table-group>
	</div>
</template>
<script lang="tsx" setup>
import type { TableBatchOptionsProps, TableBatchDialogProps, TableBatchNextAllProps, TableBatchEventProps } from '@/components/data/bt-table-batch/types.d'

import { useCheckbox, useBatchStatus, useOperate } from '@hooks/tools/table/column'
import { getContainerGroupList, delContainerGroup as deleteProjectGroups, setContainerGroupStatus as modifyProjectGroups } from '@/api/docker'
import { useDataHandle, useDialog, Message, useConfirm } from '@/hooks/tools'

const groupTable = ref() // 获取表格实例
const groupName = ref('') // 容器组名

const projectGroupData = reactive({
	loading: false,
	list: [] as any[],
})

const addGroup = async () => {
	useDialog({
		title: '添加容器组',
		area: 64,
		showFooter: true,
		component: () => import('./edit-group-popup.vue'),
		compData: { isEdit: false, refreshEvent: getGroupEvent },
	})
}

/**
 * @description 设置状态事件
 * @param {FtpTableDataProps} row 行数据
 * @returns {void} void
 */
const changeStatusEvent = async (row: any): Promise<any> => {
	try {
		if (row.status === 2) return Message.error('容器组正在切换状态，请勿重复操作')

		let isOpen = true // 是否开启
		if (row.status === 1) isOpen = false
		if (isOpen && row.order.length === 0) return Message.error('容器组内没有容器，无法启动！')

		const title = !isOpen ? '停止' : '开启'

		await useConfirm({
			title: `${title}【${row.group_name}】容器组`,
			icon: 'question-filled',
			content: `${title}容器组状态后，将依次${title}该容器组内的容器，是否继续操作？`,
		})

		await useDataHandle({
			request: modifyProjectGroups({ id: row.id, status: !isOpen ? 'stop' : 'start' }),
			loading: toRef(projectGroupData, 'loading'),
			message: true,
			success: getGroupEvent,
		})
	} catch (error) {}
}

/**
 * @description: 编辑分组
 * @param {FtpTableDataProps} row 行数据
 * @return {void}
 */
const editGroupEvent = (row: any) => {
	useDialog({
		title: `编辑容器组【${row.group_name}】`,
		area: 64,
		btn: '保存',
		component: () => import('./edit-group-popup.vue'),
		compData: {
			...row,
			isEdit: true,
			refreshEvent: getGroupEvent,
		},
	})
}

/**
 * @description: 删除分组
 * @param {FtpTableDataProps} row 行数据
 * @return {Promise<void>} void
 */
const deleteGroupEvent = async (row: any) => {
	try {
		await useConfirm({
			title: `删除容器组【${row.group_name}】`,
			content: `您真的要删除容器组【${row.group_name}】吗？`,
		})
		await useDataHandle({
			loading: '正在删除...',
			request: deleteProjectGroups({ id: row.id }),
			message: true,
			success: getGroupEvent,
		})
	} catch (error) {}
}

/**
 * @description: 获取分组
 * @return {Promise<void>} void
 */
const getGroupEvent = async () => {
	useDataHandle({
		request: getContainerGroupList(),
		data: { data: [Array, toRef(projectGroupData, 'list')] },
		loading: toRef(projectGroupData, 'loading'),
		success: res => {},
	})
}

// 批量操作方法
const useBatchEvent: TableBatchEventProps = async (batchConfirm: TableBatchDialogProps, nextAll: TableBatchNextAllProps, selectedList: AnyObject[], options: TableBatchOptionsProps) => {
	const { label, value } = options
	const requestHandle = async (item: any, index: number) => {
		const { id } = item
		switch (value) {
			case 'stop':
				return await modifyProjectGroups({ id, status: 'stop' })
			case 'delete':
				return await deleteProjectGroups({ id })
		}
	}
	await batchConfirm({
		title: `批量${label}`,
		content: `批量${label}已选的容器组，是否继续操作！`,
		column: [{ label: '文件名', prop: 'group_name' }, useBatchStatus()], // 弹窗配置
		onConfirm: async () => {
			// 递归操作所有选中的数据，如果不需要递归则不需要该方法，执行单接口请求
			await nextAll(requestHandle)
			// 执行完毕的代码，刷新列表
			getGroupEvent()
			// 返回false则不关闭弹窗
			return false
		},
	})
}

// 批量操作列表
const tableBatchData: TableBatchOptionsProps[] = [
	{ label: '停止容器组', value: 'stop', event: useBatchEvent },
	{ label: '删除容器组', value: 'delete', event: useBatchEvent },
]

const tableColumn = [
	useCheckbox(),
	{ label: '分组名称', prop: 'group_name', minWidth: 100 },
	{
		label: '状态',
		prop: 'status',
		minWidth: 70,
		render: (row: any) => {
			let status = '--'
			switch (row.status) {
				case 0:
					status = '未启动'
					break
				case 1:
					status = '已启动'
					break
				case 2:
					status = '启动中'
					break
				default:
					status = '启动失败'
					break
			}
			return (
				<span class={`inline-block ${row.status === 2 || row.status === 4 ? '' : ''} bt-${row.status === 1 ? 'link' : 'danger'}`} onClick={() => changeStatusEvent(row)}>
					<span class="flex items-center">
						<span>{status}</span>
						<span class={row.status === 2 || row.status === 4 ? 'svgtofont-el-loading' : `svgtofont-icon-${row.status === 1 ? 'start' : 'stop'}`}></span>
					</span>
				</span>
			)
		},
	},
	useOperate([
		{ onClick: editGroupEvent, title: '编辑' },
		{ onClick: deleteGroupEvent, title: '删除' },
	]),
]

// 页面加载完成
onMounted(() => {
	getGroupEvent()
})
</script>
