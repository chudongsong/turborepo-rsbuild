<template>
	<bt-table-group class="p-[2rem]">
		<template #content>
			<bt-table :column="tableColumn" :data="tableData"></bt-table>
		</template>
		<template #footer-right>
			<bt-table-page :total="completedTotal" v-model:page="tableParam.p" v-model:row="tableParam.limit" @change="getRiskData" />
		</template>
	</bt-table-group>
</template>
<script lang="tsx" setup>
import { RiskTableDataProps } from '@site/types.d'

import { getRiskInfo } from '@/api/firewall'
import { useDataHandle, useDataPage } from '@/hooks/tools'
import { typeMap } from '@site/views/reverse-proxy-model/useController'
import { checkVariable, formatTime } from '@/utils'
import { useOperate } from '@/hooks/tools/table/column'
import { openEditorView } from '@/views/files/useMethods'

interface Props {
	compData: any
}
const props = withDefaults(defineProps<Props>(), {
	compData: () => {},
})

// 页面数据
const tableData = ref<Array<RiskTableDataProps>>([]) //列表数据
const completedTotal = ref(0) // 总条数

/**
 * @description 显示两个文件的对比
 * @param {string} row 行数据
 * @param {string} baseUrl 文件地址
 */
const showBothFile = (row: RiskTableDataProps, baseUrl: string) => {
	if (row.risk_type === 'title_hash_update' || row.risk_type === 'tail_hash_update') {
		baseUrl = '/www/server/panel/class/projectModel/content/hash/' + row.site_name + '/'
	}

	let sPath = baseUrl + row.source_content_file
	let nPath = baseUrl + row.new_content_file

	const fileItem: any = {
		path: sPath,
		title: sPath + ' <-> ' + nPath,
		type: 'diff',
		mode: 'diff',
	}

	showFile(nPath, '')
}

/**
 * @description 显示文件详情
 * @param {string} path 文件地址
 * @param {string} content 关键词
 */
const showFile = (path: string, content: string) => {
	openEditorView({ path })
}

const showFileEvent = (row: RiskTableDataProps) => {
	let baseUrl = '/www/server/panel/class/projectModel/content/source/'
	let url = baseUrl + row.source_file
	//需编辑器
	if (row.risk_type.indexOf('_update') > -1) {
		showBothFile(row, baseUrl)
	} else {
		showFile(url, row.content)
	}
}

const tableColumn = ref([
	{
		label: '巡检时间',
		width: '150px',
		render: (row: any) => {
			const time = checkVariable(row.time, 'number', 0)
			return <span>{formatTime(time)}</span>
		},
	},
	{
		label: 'URL',
		render: (row: any) => (
			<span class="bt-link" title={row.url} onClick={() => window.open(row.url, '_blank', 'noopener,noreferrer')}>
				{row.url}
			</span>
		),
	},
	{ label: '关键词', prop: 'content', width: '200px' },
	{ label: '类型', prop: 'risk_content', width: '200px' },
	{
		label: '风险位置',
		width: '150px',
		render: (row: any) => typeMap[row.risk_type],
	},
	useOperate([{ onClick: showFileEvent, title: '详情' }]),
])

// 表格接口请求
const tableParam = reactive({
	p: 1,
	limit: 10,
	testing_id: props.compData.testing_id,
})

/**
 * @description 切换列表页面
 * @param {number} p 当前页码
 */
const getRiskData = async (p: number = 1) => {
	await useDataHandle({
		loading: '正在获取IP规则列表，请稍后...',
		request: getRiskInfo(tableParam),
		data: {
			data: [Array, tableData],
			page: useDataPage(completedTotal),
		},
	})
}

watch(
	() => props.compData,
	val => {
		tableParam.testing_id = val.testing_id
	}
)

onMounted(() => getRiskData())
</script>
