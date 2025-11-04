<!--  -->
<template>
	<div class="p-[2rem] min-h-[40rem]">
		<bt-table-group>
			<template #content>
				<bt-table height="380" :column="tableColumn" :data="tableData" v-bt-loading="loading" v-bt-loading:title="'正在加载中，请稍后...'"></bt-table>
			</template>
			<template #footer-right>
				<bt-table-page :total="total" v-model:page="tableParam.p" v-model:row="tableParam.limit" @change="getSiteLogsList" />
			</template>
		</bt-table-group>
		<bt-dialog :title="compData.row.site_name + 'HTTP详情'" v-model="httpPopup" :area="60">
			<div class="p-[2rem]">
				<bt-editor v-model="httpCode" class="min-h-[48rem] max-h-[60rem] overflow-auto" :editor-option="config"></bt-editor>
			</div>
		</bt-dialog>
	</div>
</template>

<script setup lang="tsx">
import { useOperate } from '@/hooks/tools/table/column'
import { useConfirm } from '@hooks/tools'
import { useDialog } from '@hooks/tools'
import { useDataHandle, useDataPage } from '@hooks/tools/data'
import { formatTime } from '@utils/index'

import { addPhpIpWhite, addUrlWhite, getPhpSiteLog } from '@/api/firewall'
import { isDark } from '@/utils/theme-config'

interface Props {
	compData: any
}

const props = withDefaults(defineProps<Props>(), {
	compData: {},
})

const tableParam = shallowReactive({
	p: 1,
	limit: 10,
}) // 表格参数

const tableData = ref<any>() // 表格数据
const httpPopup = ref(false) // http详情弹窗
const loading = ref(false) // 表格loading

const total = ref(0) // 总条数
const httpCode = ref() // http详情

const config = {
	mode: 'ace/mode/nginx',
	theme: !isDark.value ? 'ace/theme/chrome' : 'ace/theme/clouds_midnight', //主题
	wrap: true, // 是否自动换行
	showInvisibles: false, // 是否显示空格
	showFoldWidgets: false, // 是否显示代码折叠线
	useSoftTabs: true, // 是否使用空格代替tab
	tabSize: 2, // tab宽度
	showPrintMargin: false, // 是否显示打印边距
	readOnly: true, // 是否只读
	fontSize: '12px', // 字体大小
}

/**
 * @description: 白名单
 * @param row 当前行
 */
const urlWhiteEvent = async (row: any) => {
	await useConfirm({
		title: '加入URL白名单',
		content: '加入URL白名单后此URL将不再进行防御，是否继续操作？',
		icon: 'question-filled',
	})

	await useDataHandle({
		loading: '正在加入URL白名单，请稍后...',
		request: addUrlWhite({ url_rule: row.url }),
		message: true,
	})
}

/**
 * @description: 加入IP白名单
 */
const addIpWhiteEvent = async (row: any) => {
	await useConfirm({
		title: '加入IP白名单',
		content: `是否将${row.address}添加到IP白名单？`,
		icon: 'warning-filled',
	})

	await useDataHandle({
		loading: '正在添加IP白名单，请稍后...',
		request: addPhpIpWhite({ start_ip: row.address, end_ip: row.address }),
		message: true,
	})
}

/**
 * @description: 详情
 * @param row 当前行
 */
const detailEvent = (row: any) => {
	useDialog({
		title: row.address + '-详情',
		area: 56,
		component: () => import('./log-detail.vue'),
		compData: { row, addIpWhiteEvent },
	})
}

/**
 * @description: http详情
 * @param row 当前行
 */
const getHttpDetail = (row: any) => {
	httpPopup.value = true
	// 将row对象转换有有JSON格式的字符串并赋值给httpCode
	httpCode.value = JSON.stringify(row, null, 4)
}

/**
 * @description: 获取数据
 */
const getSiteLogsList = async () => {
	await useDataHandle({
		loading,
		request: getPhpSiteLog({
			...tableParam,
			siteName: props.compData.row.site_name,
		}),
		data: { data: [Array, tableData], page: useDataPage(total) },
	})
}

const tableColumn = [
	{ label: '时间', render: (row: any) => h('span', formatTime(row.addtime)) },
	{
		label: '用户IP',
		render: (row: any) => (
			<span class="bt-link" onClick={() => addIpWhiteEvent(row)}>
				{row.address}
			</span>
		),
	},
	{ label: '恶意类型', prop: 'intercept' },
	{ label: 'URL地址', prop: 'url' },
	useOperate([
		{ onClick: urlWhiteEvent, title: 'URL加白', width: 70 },
		{ onClick: detailEvent, title: '详情' },
		{ onClick: getHttpDetail, title: 'HTTP' },
	]), // 操作
]

onMounted(() => getSiteLogsList())
</script>
