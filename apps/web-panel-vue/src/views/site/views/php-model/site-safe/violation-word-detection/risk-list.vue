<template>
	<bt-table-group :class="{ 'p-[2rem]': isPopup }">
		<template #content>
			<bt-table ref="table" :column="tableColumn" :data="tableData" v-bt-loading="tableLoad" :description="'风险列表为空'" :max-height="isPopup ? 500 : mainHeight - 300" v-bt-loading:title="'正在加载风险列表，请稍后...'"></bt-table>
		</template>
		<template #footer-right>
			<bt-table-page :total="completedTotal" v-model:page="tableParam.p" v-model:row="tableParam.limit" @change="getRiskListEvent" />
		</template>
	</bt-table-group>
</template>
<script lang="tsx" setup>
import type { RiskTableDataProps } from '@/types/site'

import { getRiskList } from '@/api/site'
import { useDataHandle, useDataPage } from '@/hooks/tools'
import { useOperate } from '@/hooks/tools/table/column'
import { useGlobalStore } from '@/store/global'
import { checkVariable, formatTime } from '@/utils'
import { typeMap } from '@site/views/reverse-proxy-model/useController'
import { openEditorView } from '@/views/files/useMethods'

interface Props {
	compData: {
		isPopup?: boolean
	}
}

const props = withDefaults(defineProps<Props>(), {
	compData: () => ({
		isPopup: false,
	}),
})

const { mainHeight } = useGlobalStore()

const tableLoad = shallowRef(false) // 加载状态
const tableData = ref<Array<RiskTableDataProps>>([]) //列表数据
const completedTotal = ref(0) // 总条数
const isPopup = ref(props.compData.isPopup) // 是否弹窗

const riskColumn = () => {
	return [
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
	]
}

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

/**
 * @description 显示文件
 * @param row
 */
const showFileEvent = (data: RiskTableDataProps) => {
	let baseUrl = '/www/server/panel/class/projectModel/content/source/'
	let url = baseUrl + data.source_file
	//需编辑器
	if (data.risk_type?.indexOf('_update') > -1) {
		showBothFile(data, baseUrl)
	} else {
		showFile(url, data.content)
	}
}

const tableParam = shallowReactive({
	p: 1,
	limit: 20,
})

/**
 * @description 切换列表页面
 * @param {number} p 当前页码
 */
const getRiskListEvent = async () => {
	await useDataHandle({
		loading: tableLoad,
		request: getRiskList({ ...tableParam }),
		data: {
			data: [Array, tableData],
			page: useDataPage(completedTotal),
		},
	})
}

const tableColumn = riskColumn()

onMounted(() => getRiskListEvent())
</script>
