<!-- springboot -->
<template>
	<div class="p-[16px]">
		<bt-table-group>
			<template #header-left>
				<el-radio-group v-model="processType" size="default" @change="getProcessList">
					<el-radio-button value="java">Java进程</el-radio-button>
					<el-radio-button value="more">更多进程信息</el-radio-button>
				</el-radio-group>
			</template>
			<template #header-right>
				<bt-input-search v-model="processData.search" placeholder="输入关键字搜索"  @search="searchSubmit" />

				<bt-table-refresh class="ml-1rem" @refresh="getProcessList"></bt-table-refresh>
			</template>
			<template #content>
				<bt-table ref="Table" key="netTable" :column="tableColumn" :max-height="450" :data="processData.list" :description="'进程列表为空'" v-bt-loading="processData.loading" v-bt-loading:title="'正在加载进程列表，请稍后...'" />
			</template>
			<template #footer-left> </template>
			<template #footer-right> </template>
			<template #popup> </template>
		</bt-table-group>
	</div>
</template>

<script setup lang="tsx">
import { processForCreate, processInfoForCreate } from '@api/site'
import { useDataHandle, useMessage } from '@/hooks/tools'
import { TableColumnProps } from '@/components/data/bt-table/types'
import { useOperate } from '@/hooks/tools/table/column'
import { formatTime } from '@/utils'

interface Props {
	compData: any
}
const props = withDefaults(defineProps<Props>(), {
	compData: () => {
		setProject: (projectInfo: any) => {}
	},
})
const emits = defineEmits(['close'])
const Message = useMessage() // 消息提示

const processType = ref<string>('java') // 进程类型

const processData = reactive<any>({
	list: [],
	search: '',
	loading: false,
})

const useTableColumn = () => {
	return shallowRef<TableColumnProps[]>([
		{
			label: 'PID', // 路径
			prop: 'pid',
			width: 100,
		},
		{
			label: '启动指令',
			prop: 'cmdline',
			showOverflowTooltip: true,
			render: (row: any) => {
				return <div class="truncate">{row.cmdline?.length ? row.cmdline?.join(' ') : '--'}</div>
			},
		},
		{
			label: '运行用户',
			prop: 'username',
			width: 100,
		},
		{
			label: '启动时间',
			render: (row: any) => {
				return formatTime(row.create_time * 1000)
			},
			width: 150,
		},
		useOperate([{ onClick: selectHandle, width: 100, title: '解析该进程' }]),
	])
}

/**
 * @description 搜索提交
 */
const searchSubmit = (val: string = '') => {
	processData.search = val
	getProcessList()
}

/**
 * @description 获取进程列表
 */
const getProcessList = async () => {
	processData.loading = true
	const res = await useDataHandle({
		request: processForCreate({
			is_java_process: processType.value === 'java' ? 1 : 0,
			search: processData.search,
		}),
		data: Array,
	})
	processData.loading = false
	processData.list = res
}

/**
 * @description 解析进程
 * @param row
 */
const selectHandle = async (row: any) => {
	const res: any = await useDataHandle({
		loading: '获取进程信息中...',
		request: processInfoForCreate({ pid: row.pid }),
	})
	if (res.status) {
		Message.success('获取进程信息成功')
		props.compData.setProject(res.data)
		emits('close')
	} else {
		Message.error(res.msg)
	}
}
const tableColumn = useTableColumn()

onMounted(() => {
	getProcessList()
})
// 导出实例
// defineExpose({
// 	onConfirm,
// })
</script>
