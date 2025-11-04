<template>
	<div class="p-20px">
		<bt-table-group>
			<template #header-left>
				<el-button type="primary" @click="openAddView()"> 添加文件监视器 </el-button>
			</template>
			<template #header-right>
				<bt-table-refresh @refresh="refresh"></bt-table-refresh>
			</template>
			<template #content>
				<bt-table ref="fileMonitorTable" :column="tableColumn" :data="tableData" v-bt-loading="loading" :description="'暂无数据'" v-bt-loading:title="'正在加载列表，请稍后...'"></bt-table>
			</template>
		</bt-table-group>
		<bt-help :options="help_list" list-style="disc" class="mx-[1.6rem] my-[0.6rem]"></bt-help>
	</div>
</template>
<script lang="tsx" setup>
import { delPhpSiteSafe, getPhpSiteList } from '@/api/firewall'
import { useOperate } from '@/hooks/tools/table/column'
import { useConfirm, useDataHandle, useMessage } from '@hooks/tools'
import { useDialog } from '@hooks/tools/dialog'

const Message = useMessage()

interface Props {
	compData: any
}
const props = withDefaults(defineProps<Props>(), {
	compData: () => {},
})
const loading = ref(false) // 表格loading
const tableData = ref<any>([]) // 表格数据
const rowData = ref<any>({}) // 当前行数据

const help_list = [
	{ content: '告警频率：60秒某一个告警行为只会发送一次告警' },
	{
		isHtml: true,
		content: '<a class="btlink" href="https://www.bt.cn/bbs/thread-112442-1-1.html" target="_blank" rel="noreferrer noopener">使用教程</a>',
	},
]

/**
 * @description 获取监控数据
 */
const getMonitorData = (status?: boolean) => {
	let arr = []
	const { file_info } = props.compData.config
	let file_data: any = file_info
	if (status) file_data = rowData.value.config.file_info
	for (const key in file_data) {
		if (Object.prototype.hasOwnProperty.call(file_data, key)) {
			arr.push({
				path: key,
				type: file_data[key].type,
				read: file_data[key].read,
				del: file_data[key].del,
				reit: file_data[key].reit,
			})
		}
	}
	tableData.value = arr
}

const refresh = async () => {
	const { sites } = await useDataHandle({
		request: getPhpSiteList(),
		data: { sites: Array },
	})
	rowData.value = sites.find((item: any) => item.site_name === props.compData.site_name)
	getMonitorData(true)
}

/**
 * @description 添加文件监视器
 */
const openAddView = (row?: any) => {
	useDialog({
		title: `添加文件监视器`,
		area: 47,
		component: () => import('./add-file-monitor.vue'),
		compData: {
			row: row || false,
			name: props.compData.site_name,
			path: props.compData.path,
			refresh: refresh,
		},
		showFooter: true,
	})
}

/**
 * @description 删除监视器
 */
const deleteEvent = async (row: any) => {
	await useConfirm({
		title: `删除监视器`,
		content: `您真的要删除路径【${row.path}】的监视器吗？`,
	})
	useDataHandle({
		loading: '正在删除监视器，请稍后...',
		request: delPhpSiteSafe({
			domain: props.compData.site_name,
			type: row.type,
			path: row.path,
		}),
		message: true,
		success: (res: any) => {
			if (res.status) refresh()
		},
	})
}

const tableColumn = [
	{
		label: '路径',
		render: (row: any) => <span class="text-primary">{row.path}</span>,
	},
	{
		label: '类型',
		render: (row: any) => (row.type === 'dir' ? '文件夹' : '文件'),
	},
	{
		label: '告警操作',
		render: (row: any) => {
			let arr = []
			if (parseInt(row.read)) arr.push('读取')
			if (parseInt(row.del)) arr.push('写入')
			if (parseInt(row.reit)) {
				arr.push('修改')
				arr.push('增加')
			}
			return `${arr.join('/')}`
		},
	},
	// useOperate([
	//   {
	//     title: '编辑',
	//     onClick: openAddView,
	//   },
	//   {
	//     title: '删除',
	//     onClick: deleteEvent,
	//   },
	// ]),  // 9.3没有
]

onMounted(() => getMonitorData())
</script>
