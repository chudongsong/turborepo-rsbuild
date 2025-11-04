<template>
	<div class="p-[1.6rem]">
		<el-form ref="cmdFormRef" :model="cmdForm" :rules="cmdRules" @submit.native.prevent>
			<el-form-item prop="name" label="组名" class="min-w-[3rem]">
				<bt-input v-model="cmdForm.name" width="26rem" :placeholder="`请输入组名`" />
			</el-form-item>

			<el-form-item prop="interval" label="启动间隔">
				<bt-input v-model="cmdForm.interval" width="26rem" type="number" :min="0" :placeholder="`请输入启动间隔`" textType="秒">
					<template #append> 秒 </template>
				</bt-input>
			</el-form-item>

			<el-form-item prop="conList" label="容器">
				<bt-table v-show="cmdForm.conList.length" class="groupSortTable" row-key="name" :column="sortColumn" :max-height="330" :data="cmdForm.conList" :description="'容器列表为空'" v-bt-loading="tableData.loading" v-bt-loading:title="'正在加载容器列表，请稍后...'" />
				<el-button :class="cmdForm.conList.length ? '!mt-[1rem]' : ''" type="default" @click="openAddPopup"> 添加容器 </el-button>
			</el-form-item>

			<ul class="list-disc mt-[1.5rem] pl-[2rem]">
				<li>
					启动顺序：从上到下。可拖拽排序。
					<span v-show="!cmdForm.conList.length">【当前组容器为空】</span>
				</li>
			</ul>
		</el-form>

		<bt-dialog ref="popup" title="新增容器" :area="62" v-model="popupData.show" showFooter @confirm="addCon">
			<div class="p-[1.6rem]">
				<bt-table :column="tableColumn" :max-height="330" ref="sortTable" row-key="name" reserve-selection :data="tableData.list" :description="'容器列表为空'" v-bt-loading="tableData.loading" @selection-change="handleSelectionChange" v-bt-loading:title="'正在加载容器列表，请稍后...'" />
				<ul class="pl-[2rem] list-disc text-danger mt-[1.5rem]">
					<li>已选中：{{ select.selectList.length }}个</li>
				</ul>
			</div>
		</bt-dialog>
	</div>
</template>

<script setup lang="ts">
import { addContainerGroup, editContainerGroup, getContainerUnAdd } from '@/api/docker'
import { useDataHandle, Message } from '@/hooks/tools'
import { useCheckbox, useOperate, useStatus } from '@/hooks/tools/table/column'
import { checkVariable } from '@utils/index'
import Sortable from 'sortablejs'
interface Props {
	compData?: any
}

const props = withDefaults(defineProps<Props>(), {
	compData: () => ({}),
})

const { isEdit } = props.compData

// 表单
const cmdForm = reactive({
	name: '',
	interval: '',
	conList: [] as any[],
})

// 弹窗
const popupData = reactive({
	show: false,
})

// 表格
const tableData = reactive({
	loading: false,
	list: [] as any[],
})

// 容器分组列表
const useContainerGroupColumn = (config: { type: 'select' | 'sort'; deleteConEvent?: any; groupName?: string }) => {
	let column = [{ label: '容器名', prop: 'name' }, useStatus({ prop: 'status', event: () => {}, data: ['已停止', '运行中'] })]
	return config.type === 'sort'
		? [
				...column,
				useOperate(
					[
						{ onClick: config.deleteConEvent, title: '移除' },
						{
							render: () => {
								return h('i', {
									class: 'svgtofont-icon-drag cursor-move mover align-middle',
									props: { title: '拖拽排序' },
								})
							},
						},
					],
					{ fixed: false }
				),
		  ]
		: [
				// {
				// 	type: 'selection',
				// 	selectable: (row: any) => {
				// 		return row.group === '' || row.group === config.groupName
				// 	},
				// 	width: 36,
				// },
				useCheckbox({
					key: 'name',
					disabled: (row: any) => {
						return row.group !== '' && row.group !== config.groupName
					},
				}),
				...column,
				{
					label: '分组',
					prop: 'group',
					render: (row: any) => {
						return h('span', {}, row.group ? `已在分组【${row.group}】内` : '--')
					},
				},
		  ]
}

const openAddPopup = () => {
	popupData.show = true
	handleSelectionChange(cmdForm.conList, true)
}

const sortColumn = useContainerGroupColumn({
	type: 'sort',
	deleteConEvent: (row: any) => {
		cmdForm.conList = cmdForm.conList.filter(item => item.name !== row.name)
		handleSelectionChange(cmdForm.conList)
	},
}) // 排序表格

const sortTable = ref()
const cmdFormRef = ref()
// 验证规则
const cmdRules = {
	name: [{ trigger: ['blur', 'change'], required: true, message: '请输入组名' }],
	interval: [
		{
			validator: (rule: any, value: any, callback: any) => {
				if (!/^[1-9]\d*$/.test(value) && value !== '') {
					callback(new Error('请输入正整数'))
				} else {
					callback()
				}
			},
			trigger: 'blur',
		},
	],
}
// 已选数据
const select = reactive({
	selectList: [] as { name: string; group: string }[],
})

/**
 * @description: 获取选中数据
 * @param {FtpTableDataProps[]} val 选中row数据
 * @param {boolean} onOpen 是否打开弹窗
 * @return {void}
 */
const handleSelectionChange = (val: any, onOpen?: boolean): void => {
	select.selectList = val
	if (onOpen === true) {
		nextTick(() => {
			select.selectList.map((row: any) => {
				// 获取源数据
				const sourceData = tableData.list.find((item: any) => item.name === row.name)
				// 根据源数据选中已选中的数据
				if (sourceData) {
					const tableRef = sortTable.value.getTable()
					tableRef?.toggleRowSelection(sourceData, true)
				}
			})
		})
	}
}

/**
 * @description: 行拖拽
 * @return {void}
 */
const rowDrop = () => {
	const tbody = document.querySelector('.groupSortTable .el-table__body-wrapper tbody')
	Sortable.create(tbody as HTMLElement, {
		animation: 500,
		onEnd: async (e: any) => {
			const currentRow = cmdForm.conList.splice(e.oldIndex, 1)[0]
			cmdForm.conList.splice(e.newIndex, 0, currentRow)
		},
	})
}
/**
 * @description: 添加容器
 */
const addCon = () => {
	cmdForm.conList = select.selectList
	popupData.show = false
	rowDrop()
}

// 获取可添加容器列表
const getAddList = async () => {
	tableData.loading = true
	await useDataHandle({
		request: getContainerUnAdd(),
		loading: toRef(tableData, 'loading'),
		success: (res: any) => {
			const arr = checkVariable(res.data.data, 'array', [])
			tableData.list = arr.sort((a: any, b: any) => {
				if (a.group === '' && b.group !== '') {
					return -1
				}
				if (a.group !== '' && b.group === '') {
					return 1
				}
				return 0
			})
		},
		error: (msg: string) => {
			Message.error(msg)
		},
	})
}

// 提交
const onConfirm = async (close: any) => {
	try {
		await cmdFormRef.value.validate()
		let params: any = {
			group_name: cmdForm.name,
			interval: cmdForm.interval,
			container_info: cmdForm.conList.map((con: any) => con.name).join(','),
		}
		if (isEdit) params['id'] = props.compData.id
		await useDataHandle({
			loading: '正在设置，请稍后...',
			message: true,
			request: isEdit ? editContainerGroup(params) : addContainerGroup(params),
			success: async ({ status }: { status: boolean }) => {
				if (status) {
					close()
					props.compData.refreshEvent && props.compData.refreshEvent()
				}
			},
		})
	} catch (error) {}
}

const tableColumn = useContainerGroupColumn({
	type: 'select',
	groupName: props.compData.group_name || '',
}) // 添加表格

onMounted(async () => {
	await getAddList()
	if (props.compData.isEdit) {
		cmdForm.interval = props.compData.interval
		cmdForm.name = props.compData.group_name
		select.selectList = props.compData.order.map((name: string) => {
			return { name, group: props.compData.group_name }
		})
		const arr = []
		for (let i = 0; i < props.compData.order.length; i++) {
			const item = tableData.list.find((item: any) => item.name === select.selectList[i].name)
			if (item) {
				arr.push(item)
			}
		}
		cmdForm.conList = arr
	}
	rowDrop()
})

defineExpose({ onConfirm })
</script>

<style lang="css" scoped>
:deep(.el-form .el-form-item--small .el-form-item__label) {
	@apply min-w-[3rem];
}
</style>
