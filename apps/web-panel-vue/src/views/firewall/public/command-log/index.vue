<template>
	<div class="px-[1.6rem] py-[1.6rem]">
		<bt-table-group>
			<template #header-left>
				<div class="flex items-center">
					<span class="w-[6rem]">选择日期：</span>
					<el-select class="!w-[16rem]" v-model="tableParam.day" @change="changePage(1)">
						<el-option v-for="(item, index) in dateOptions" :key="index" :value="item.key" :label="item.title"></el-option>
					</el-select>
				</div>
			</template>
			<template #content>
				<bt-table maxHeight="360" :column="tableColumn" :data="tableData" v-bt-loading="tableLoad"></bt-table>
			</template>
			<template #footer-right>
				<bt-page-text :limit="tableParam.num" :p="tableParam.p" :num="total" @click="changePage" />
			</template>
		</bt-table-group>
	</div>
</template>
<script lang="tsx" setup>
import { getCommandLogData } from '@/api/firewall'
import { useDataHandle } from '@/hooks/tools'
import { formatTime } from '@/utils'

interface Props {
	compData?: any
}

interface dataProps {
	cmd: string
	cwd: string
	filename: string
	login: string
	sid: string
	timestamp: string
	tty: string
	uid: string
}

const props = withDefaults(defineProps<Props>(), {
	compData: () => ({}),
})

const { user, dateTime, dateOptions } = useVModels(props.compData)

// 页面数据
const tableData = ref<Array<dataProps>>([]) //列表数据
const total = ref(0) // 总条数
const tableLoad = ref(false) // 加载状态

// 表格接口请求
const tableParam = reactive({
	p: 1,
	num: 8,
	day: dateTime.value,
})

// 表格数据
const tableColumn = [
	//用户
	{ label: '用户', render: (row: dataProps, index: number) => user.value },
	{ label: '运行目录', prop: 'cwd' },
	{ label: '执行的命令', prop: 'cmd' },
	{ label: '命令的路径', prop: 'filename' },
	{
		label: '时间',
		render: (row: dataProps, index: number) => formatTime(row.timestamp),
	},
]

/**
 * @description 页码切换
 * @param {number} p 当前页码
 */
const changePage = (p: number) => {
	tableParam.p = p
	getCommandLog()
}

/**
 * @description 切换列表页面
 */
const getCommandLog = async () => {
	let params = {
		...tableParam,
		user: user.value,
	}
	const res = await useDataHandle({
		loading: tableLoad,
		request: getCommandLogData(params),
		data: [Array, tableData],
	})
	total.value = res.length + 1
}

onMounted(() => getCommandLog())
</script>
