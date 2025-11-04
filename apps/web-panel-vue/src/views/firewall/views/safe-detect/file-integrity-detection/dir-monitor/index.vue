<template>
	<div class="p-[2rem]">
		<bt-table-group>
			<template #header-left>
				<bt-input-icon v-model="ruleForm.path" name="path" placeholder="选择目录" icon="icon-file_mode" @icon-click="onPathChange()" @change.passive="clearSpace('path')" width="32rem" />
				<el-button type="primary" class="!ml-[.8rem]" @click="addDetecList"> 添加 </el-button>
			</template>
			<template #content>
				<bt-table ref="detecList" :column="tableColumn" :data="getData" :description="'检测列表为空'" v-bt-loading:title="'正在加载检测列表，请稍后...'"></bt-table>
			</template>
		</bt-table-group>
	</div>
</template>
<script lang="tsx" setup>
import { addFileMonitorList, delFileMonitorList, getFileMonitorList } from '@/api/firewall'
import { useOperate } from '@/hooks/tools/table/column'
import { fileSelectionDialog } from '@/public/index'
import { useMessage } from '@hooks/tools'
import { useConfirm } from '@hooks/tools'
import { useDataHandle } from '@hooks/tools'

const Message = useMessage()
const getData = shallowRef<any>([]) //列表数据

const ruleForm = reactive<any>({
	path: '',
	type: 'dir',
}) // 表单数据

/**
 * @description 获取检测列表
 */
const getDetecPathData = async () => {
	useDataHandle({
		request: getFileMonitorList(),
		data: {
			'msg.scan_dir': [
				Array,
				(data: any[]) => {
					getData.value = data.map((item: any) => {
						return { path: item }
					})
				},
			],
		},
	})
}

/**
 * @description: 触发目录选择
 */
const onPathChange = () => {
	fileSelectionDialog({
		type: 'dir',
		path: '/',
		change(path: any, type: any) {
			// 过滤//为/
			path = path.replace(/\/\//g, '/')
			ruleForm.path = path
			ruleForm.type = type
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
 * @description 删除目录
 * @param {any} data 行数据
 */
const deleteRow = async (data: any) => {
	await useConfirm({
		icon: 'question-filled',
		title: '删除检测目录',
		width: '34rem',
		content: '删除检测目录【' + data.path + '】，是否继续操作？',
	})
	await useDataHandle({
		request: delFileMonitorList({
			path: JSON.stringify([data.path]),
		}),
		loading: '正在删除检测目录，请稍后...',
		message: true,
	})
	getDetecPathData()
}

// 添加目录
const addDetecList = async () => {
	if (!ruleForm.path) {
		Message.error('请填写检测目录')
		return
	}
	await useDataHandle({
		request: addFileMonitorList({
			dir: ruleForm.path,
		}),
		loading: '正在添加检测目录，请稍后...',
		message: true,
	})
	getDetecPathData()
	ruleForm.path = ''
}
// 表格数据
const tableColumn = [
	{
		label: '所在目录',
		prop: 'path',
	},
	useOperate([
		{
			onClick: deleteRow,
			title: '删除',
			isHide: (row: any) => {
				return ['/bin/', '/sbin/', '/usr/bin/', '/usr/sbin/'].includes(row.path)
			},
		},
	]), // 操作
]

// 页面加载完成
onMounted(() => {
	getDetecPathData()
})
</script>
