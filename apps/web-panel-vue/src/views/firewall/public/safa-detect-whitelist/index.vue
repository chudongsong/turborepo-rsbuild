<template>
	<div class="p-[2rem]">
		<bt-table-group>
			<template #header-left>
				<bt-input-icon v-model="ruleForm.path" name="path" placeholder="选择目录/文件全路径" icon="icon-file_mode" @icon-click="onPathChange()" @change.passive="clearSpace('path')" width="32rem" />
				<el-button class="!ml-[.8rem]" type="primary" @click="addWhiteList"> 添加 </el-button>
			</template>
			<template #content>
				<bt-table ref="whiteList" :column="tableColumn" :data="getData" :description="'白名单列表为空'" v-bt-loading:title="'正在加载白名单列表，请稍后...'"></bt-table>
			</template>
			<template #footer-left>
				<bt-table-batch :table-ref="whiteList" :options="tableBatchData" />
			</template>
		</bt-table-group>
		<bt-help :options="help_list" class="mx-[1.6rem] my-[0.6rem]"></bt-help>
	</div>
</template>
<script lang="tsx" setup>
import { addWhitePath, delWhitePath, getWhitePath } from '@/api/firewall'
import { TableBatchDialogProps, TableBatchEventProps, TableBatchNextAllProps, TableBatchOptionsProps } from '@/components/extension/bt-table-batch/types'

import { useConfirm, useDataHandle, useMessage } from '@/hooks/tools'
import { useBatchStatus, useCheckbox } from '@/hooks/tools/table/column'
import { fileSelectionDialog } from '@/public'
import { TrojanWhiteTableDataProps } from '@/types/firewall'

const Message = useMessage() // 消息提示
const whiteList = ref() // 获取表格实例
const getData = shallowRef<any>([]) //列表数据
const help_list = [{ content: '注意：添加白名单目录要以"/"结尾' }] // 帮助列表

// 批量操作方法
const useBatchEventHandle: TableBatchEventProps = async (batchConfirm: TableBatchDialogProps, nextAll: TableBatchNextAllProps, selectedList: AnyObject[], options: TableBatchOptionsProps): Promise<void> => {
	const { label, value } = options
	const requestHandle = async (item: AnyObject, index: number) => {
		const { path, type } = item
		switch (value) {
			case 'delete':
				return await delWhitePath({
					path,
					type,
				})
				break
		}
	}
	await batchConfirm({
		title: `批量${label}白名单目录`,
		content: `批量${label}已选的白名单目录，是否继续操作！`,
		column: [
			{
				label: '路径',
				prop: 'path',
			},
			useBatchStatus(),
		], // 弹窗配置
		onConfirm: async () => {
			// 递归操作所有选中的数据，如果不需要递归则不需要该方法，执行单接口请求
			await nextAll(requestHandle)
			// 执行完毕的代码，刷新列表
			getWhitePathData()
			// 返回false则不关闭弹窗
			return false
		},
	})
}
// 批量操作列表
const tableBatchData: TableBatchOptionsProps[] = [
	{
		label: '删除',
		value: 'delete',
		event: useBatchEventHandle,
	},
]

const ruleForm = reactive<any>({
	path: '',
	type: 'dir',
}) // 表单数据

/**
 * @description 获取白名单列表
 */
const getWhitePathData = async () => {
	useDataHandle({
		request: getWhitePath(),
		success: (res: any) => {
			if (!Array.isArray(res.data)) {
				getData.value = [
					...res.data.dir.map((path: any) => ({
						path,
						type: 'dir',
						typeTitle: '目录',
					})),
					...res.data.file.map((path: any) => ({
						path,
						type: 'file',
						typeTitle: '文件',
					})),
				]
			}
		},
	})
}

/**
 * @description: 触发目录选择
 */
const onPathChange = () => {
	fileSelectionDialog({
		type: 'all',
		change(path: any, type: any) {
			ruleForm.path = path
			ruleForm.type = type
			// 若为dir则需要以/结尾
			if (type === 'dir' && !path.endsWith('/')) {
				ruleForm.path += '/'
			}
		},
	})
}

/**
 * @description: 清除空格
 */
const clearSpace = (name: string) => {
	ruleForm[name] = ruleForm[name].replace(/\s+/g, '')
}

/**
 * @description 删除白名单
 * @param {any} data 行数据
 */
const deleteRow = async (data: TrojanWhiteTableDataProps) => {
	await useConfirm({
		icon: 'warning-filled',
		title: '删除白名单目录',
		width: '34rem',
		content: '删除白名单目录【' + data.path + '】，是否继续操作？',
	})
	useDataHandle({
		request: delWhitePath({
			path: data.path,
			type: data.type,
		}),
		message: true,
		loading: '正在删除白名单目录，请稍后...',
		success: getWhitePathData,
	})
}

// 添加白名单
const addWhiteList = async () => {
	try {
		if (!ruleForm.path) {
			Message.error('请输入白名单目录')
			return
		}
		await useDataHandle({
			request: addWhitePath({
				path: ruleForm.path,
			}),
			message: true,
			loading: '正在添加白名单目录，请稍后...',
			success: getWhitePathData,
		})
		ruleForm.path = ''
	} catch (error) {
		console.log(error)
	}
}
// 表格数据
const tableColumn = [
	useCheckbox(),
	{
		label: '路径',
		prop: 'path',
		showOverflowTooltip: true,
	},
	{
		label: '类型',
		prop: 'typeTitle',
	},
	{
		label: '操作', // 操作
		align: 'right',
		fixed: 'right',
		render: (row: any) => {
			return (
				<span class="bt-link" onClick={() => deleteRow(row)}>
					删除
				</span>
			)
		},
	},
]

// 页面加载完成
onMounted(() => {
	getWhitePathData()
})
</script>
