<template>
	<div class="p-[20px]">
		<bt-table-group>
			<template #header-left>
				<el-input v-model="classValue" placeholder="请输入分类名称" class="!w-[41rem]" />
				<el-button type="primary" class="ml-[1rem]" @click="addClassEvent"> 添加分类 </el-button>
			</template>
			<template #content>
				<bt-table v-bt-loading="loading" :column="column" :data="classList" max-height="250" />
			</template>
			<template #popup>
				<bt-dialog v-model="editClassPopup" :area="40" title="编辑分类" show-footer @confirm="editClassEvent">
					<div class="p-[20px]">
						<el-form @submit.native.prevent>
							<el-form-item label="分类名称" prop="name">
								<bt-input v-model="editorValue" autofocus placeholder="请输入分类名称" @submit="editClassEvent" width="22rem" />
							</el-form-item>
						</el-form>
					</div>
				</bt-dialog>
			</template>
		</bt-table-group>
		<ul class="mt-[8px] leading-8 text-small list-disc ml-[20px]">
			<li>【批量操作-设置分类】可修改当前分类，仅具备批量操作的列表</li>
		</ul>
	</div>
</template>

<script setup lang="tsx">
import type { SelectOptionProps } from '@components/form/bt-select/types'
import type { TableColumnProps } from '@components/data/bt-table/types'
import type { TableClassProps } from '@components/extension/bt-table-class/types'
import type { ResponseMessage } from '@axios/types'

import { useConfirm, useDataHandle, useMessage } from '@/hooks/tools'

interface Props {
	compData: TableClassProps & { field?: string }
}

const props = withDefaults(defineProps<Props>(), {
	compData: () => ({
		ignore: [],
		getClassList: () => Promise.resolve([]),
		addClass: () => Promise.resolve({}),
		editClass: () => Promise.resolve({}),
		deleteClass: () => Promise.resolve({}),
		updateOptions: () => Promise.resolve([]),
		field: 'ps',
		showEdit: true,
	}),
})

const { getClassList, addClass, editClass, deleteClass, ignore, field, updateOptions, showEdit } = unref(props.compData) // 获取分类列表接口
const classValue = ref<string>('') // 分类名称
const editorValue = ref<string>('') // 编辑器内容
const loading = ref(false) // 表格加载状态
const editClassPopup = ref(false) // 编辑分类弹窗
const classList = shallowRef<SelectOptionProps[]>([]) // 分类列表
const editorActive = shallowRef<SelectOptionProps>({ label: '', value: 0 }) // 编辑选中数据

const Message = useMessage() // 消息提示

const column: TableColumnProps[] = [
	{
		label: '分类名称',
		prop: 'label',
		showOverflowTooltip: true,
	},
	{
		label: '操作',
		align: 'right',
		render: (row: SelectOptionProps) => {
			if (row.value === 'all' || ignore?.includes(`${row.value}`)) return '不可操作'
			return (
				<div class="flex items-center">
					{showEdit && (
						<span class="flex items-center">
							<span class="bt-link" onClick={() => openEditPopupEvent(row)}>
								编辑
							</span>
							<el-divider direction="vertical"></el-divider>
						</span>
					)}
					<span class="bt-link" onClick={() => deleteClassEvent(row)}>
						删除
					</span>
				</div>
			)
		},
	},
]

const renderClassList = async () => {
	try {
		loading.value = true
		const rdata: SelectOptionProps[] = await getClassList()
		classList.value = rdata || [] // 分类列表
		updateOptions(classList.value)
	} catch (error) {
		console.error(error)
	} finally {
		loading.value = false
	}
}

/**
 * @description 添加分类
 */
const addClassEvent = async () => {
	try {
		if (!classValue.value) return Message.error('请输入分类名称')
		// 使用field作为对象字段名称
		const params = { [field]: classValue.value }
		const rdata: ResponseMessage = await useDataHandle({
			loading: '正在添加分类，请稍后...',
			request: addClass(params),
		})
		console.log(rdata)
		requestRefresh(rdata)
		classValue.value = ''
	} catch (error) {
		console.error(error)
	}
}

/**
 * @description 打开编辑分类弹窗
 * @param {SelectOptionProps} row 当前行数据
 */
const openEditPopupEvent = (row: SelectOptionProps) => {
	editClassPopup.value = true
	editorActive.value = row
	editorValue.value = row.label as string
}

/**
 * @description 编辑分类提交事件
 * @returns {void}
 */
const editClassEvent = async () => {
	try {
		const params = { [field]: editorValue.value, id: editorActive.value.value }
		const rdata: ResponseMessage = await useDataHandle({
			loading: '正在编辑分类，请稍后...',
			request: editClass(params),
		})
		if (rdata.status) editClassPopup.value = false
		editorValue.value = ''
		requestRefresh(rdata)
	} catch (error) {
		console.error(error)
	}
}

/**
 * @description 删除分类
 * @param {any} row 当前行数据
 * @returns {void}
 */
const deleteClassEvent = async (row: SelectOptionProps) => {
	try {
		// 确认删除
		await useConfirm({
			title: '提示',
			content: '确认删除该分类吗？该分类下的所有数据将会被移动至全部分类下，是否继续？',
		})
		// 删除分类
		const rdata: ResponseMessage = await useDataHandle({
			loading: '正在删除分类，请稍后...',
			request: deleteClass({ id: row.value }),
		})
		console.log(rdata, '111')
		requestRefresh(rdata)
	} catch (error) {
		console.error(error)
	}
}

/**
 * @description 请求刷新
 * @param {ResponseMessage} rdata 返回数据
 */
const requestRefresh = (rdata: ResponseMessage) => {
	console.log(rdata)
	if (rdata.status) renderClassList()
	Message.request(rdata)
}

onMounted(() => {
	renderClassList()
})
</script>
