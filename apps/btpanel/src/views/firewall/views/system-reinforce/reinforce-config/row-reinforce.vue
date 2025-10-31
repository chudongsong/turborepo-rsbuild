<template>
	<div class="px-[1.6rem] py-[1.6rem]">
		<bt-table-group>
			<template #header-left>
				<el-button type="primary" @click="addView = true"> 添加保护文件/目录 </el-button>
			</template>
			<template #content>
				<bt-table max-height="400" v-bt-loading="loading" v-bt-loading:title="'正在加载中，请稍后...'" :column="tableColumn" :data="tableData"></bt-table>
			</template>

			<template #popup>
				<bt-dialog title="添加保护文件/目录" v-model="addView" :area="42" @confirm="addReinforceEvent" showFooter>
					<el-form class="p-2rem" ref="addReinforceFormRef" :model="addForm" :rules="rules">
						<el-form-item label="路径" prop="path">
							<bt-input-icon icon="icon-file_mode" v-model="addForm.path" width="24rem" placeholder="被保护的文件或路径" @icon-click="onPathChange" iconType="folder"></bt-input-icon>
						</el-form-item>
						<el-form-item label="模式">
							<el-select v-model="addForm.chattr" class="!w-[24rem]">
								<el-option label="只读" value="i"></el-option>
								<el-option label="追加" value="a"></el-option>
							</el-select>
						</el-form-item>
						<el-form-item label="权限" prop="d_mode">
							<bt-input v-model="addForm.d_mode" width="24rem" :placeholder="'请输入权限'" clearable></bt-input>
						</el-form-item>
					</el-form>
				</bt-dialog>
			</template>
		</bt-table-group>
		<bt-help :options="help_list" class="mx-[1.6rem] mt-[1.6rem]"></bt-help>
	</div>
</template>
<script lang="tsx" setup>
import { addSafePath, getSafeConfig, removeSafePath } from '@/api/firewall'
import { useOperate } from '@/hooks/tools/table/column'
import { fileSelectionDialog } from '@/public/index'
import { useDataHandle } from '@hooks/tools/data'

interface Props {
	compData?: AnyObject
}
// 表格数据参数
interface tableDataProps {
	chattr: string
	d_mode: string
	path: string
	s_mode: string
	state: boolean
}

const props = withDefaults(defineProps<Props>(), {
	compData: () => ({}),
})

const key = props.compData.key
const loading = shallowRef(false) // 加载状态
const chatData = { a: '追加', i: '只读' } as { [key: string]: string }
const tableData = shallowRef<Array<tableDataProps>>([]) //列表数据

const addReinforceFormRef = ref() // 表单ref
const addView = shallowRef(false) // 添加弹窗
const addForm = ref({
	path: '',
	chattr: 'i',
	d_mode: '',
})

const help_list = [
	{ content: '【只读】无法修改、创建、删除文件和目录' },
	{ content: '【追加】只能追加内容，不能删除或修改原有内容' },
	{
		content: '【权限】设置文件或目录在受保护状态下的权限(非继承),关闭保护后权限自动还原',
	},
	{
		content: '【如何填写权限】请填写Linux权限代号,如:644、755、600、555等,如果不填写,则使用文件原来的权限',
	},
] // 帮助列表

const rules = {
	path: [
		{
			required: true,
			message: '请输入被保护的文件或路径',
			trigger: ['blur', 'change'],
		},
	],
	d_mode: [{ required: true, message: '请输入权限', trigger: ['blur', 'change'] }],
}

/**
 * @description 切换列表页面
 */
const getConfigList = async () => {
	await useDataHandle({
		loading: loading,
		request: getSafeConfig({ s_key: key }),
		data: { paths: [Array, tableData] },
	})
}

/**
 * @description 删除保护配置
 * @param {any} row 保护配置行数据
 */
const deleteRowEvent = async (row?: any) => {
	await useDataHandle({
		request: removeSafePath({ s_key: key, path: row.path }),
		loading: '正在删除保护配置，请稍后...',
		message: true,
	})
	getConfigList()
}

/**
 * @description 打开文件选择弹窗
 */
const onPathChange = () => {
	fileSelectionDialog({
		type: 'all',
		path: '/www/wwwroot',
		change: (path: string) => {
			addForm.value.path = path
		},
	})
}

/**
 * @description 添加保护文件/目录
 */
const addReinforceEvent = async () => {
	await addReinforceFormRef.value.validate()
	await useDataHandle({
		loading: '正在添加保护文件/目录，请稍后...',
		request: addSafePath({ ...addForm.value, s_key: key }),
		message: true,
	})
	addView.value = false
	getConfigList()
	// addReinforceFormRef.value.resetFields() // 重置表单
	addForm.value = { path: '', chattr: 'i', d_mode: '' } // 清空表单
}

// 表格数据
const tableColumn = [
	{ label: '路径', prop: 'path', showOverflowTooltip: true },
	{
		label: '模式',
		prop: 'chattr',
		render: (row: tableDataProps) => chatData[row.chattr],
	},
	{
		label: '权限',
		prop: 's_mode',
		render: (row: tableDataProps, index: number) => {
			return <span>{row.s_mode + (row.s_mode === row.d_mode ? '' : ' >> ' + row.d_mode)}</span>
		},
	},
	{
		label: '状态',
		prop: 'state',
		render: (row: tableDataProps) => <span class={`text-${row.state ? 'primary' : 'danger'}`}>{row.state ? '已保护' : '未保护'}</span>,
	},
	useOperate([{ title: '删除', onClick: deleteRowEvent }]),
]

// 页面加载完成
onMounted(() => getConfigList())
</script>
