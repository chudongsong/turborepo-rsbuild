<template>
	<div>
		<bt-table-group>
			<template #content>
				<bt-table ref="table" :column="tableColumn" :data="tableData" v-bt-loading="tableLoading" :description="'概览列表为空'" v-bt-loading:title="'正在加载概览列表，请稍后...'"></bt-table>
			</template>
			<template #popup></template>
		</bt-table-group>
		<bt-help :options="help_list" class="mx-[1.6rem]"></bt-help>
	</div>
</template>
<script lang="tsx" setup>
import { useOperate } from '@/hooks/tools/table/column'
import { Message, useDataHandle, useDialog } from '@hooks/tools'
import { useGlobalStore } from '@store/global'

import { getLogsList, setUserLog, startUserSecurity } from '@api/firewall'

const { mainHeight } = useGlobalStore()

const infoData = inject('infoData') // 入侵防御数据
const getIntrusionInfo = inject('getIntrusionInfo', () => {}) // 获取入侵防御数据

const tableLoading = isRef(false) // 加载状态
const tableData = ref() //列表数据

const help_list = [
	{ content: '开启防提权，系统会针对该用户操作命令进行限制，并记录跟踪' },
	{ content: '不开启防提权，系统只针对该用户操作过的命令做记录跟踪' },
	{ content: '目前防提权默认只针对www,redis,mysql操作引起的提权问题进行处理' },
	{
		class: 'text-warning',
		content: '消息推送需要更新至最新面板的版本(2020-06-17日之后安装的版本|或者2020-06-17日之后点击过修复面板)',
	},
] // 帮助列表

/**
 * @description 修改防入侵状态
 * @param {any} row 概览行数据
 */
const changeIntrusion = async (row: any, val: boolean) => {
	await useDataHandle({
		loading: '正在' + (val ? '开启' : '关闭') + '防入侵，请稍后...',
		request: startUserSecurity(!row[3], { user: row[0] }),
		message: true,
	})
	getIntrusionInfo() // 刷新概览数据
}

/**
 * @description 修改日志状态
 * @param {any} row 概览行数据
 */
const changeLog = async (row: any, index: number, val: boolean) => {
	await useDataHandle({
		loading: '正在' + (val ? '开启' : '关闭') + '日志状态，请稍后...',
		request: setUserLog(row[5] ? false : true, { uid: row[1] }),
		message: true,
	})
	getIntrusionInfo() // 刷新概览数据
}

/**
 * @description 获取命令日志
 * @param {any} row 概览行数据
 */
const getLogs = async (row: any) => {
	const res = await useDataHandle({
		loading: '正在获取日志，请稍后...',
		request: getLogsList({ user: row[0] }),
		data: Array,
	})
	if (!res.length) return Message.error('当前暂无日志')
	useDialog({
		title: '命令日志',
		area: 72,
		component: () => import('@firewall/public/command-log/index.vue'),
		compData: {
			user: row[0],
			dateTime: res[0],
			dateOptions: res.map((item: any) => ({ title: item, key: item })),
		},
	})
}

const tableColumn = [
	{ label: '用户', prop: '0' },
	{
		label: '总次数',
		prop: '4',
		render: (row: any) => <span class={row[4].totla > 0 ? '!text-danger' : ''}>{row[4].totla}</span>,
	},
	{
		label: '当日次数',
		prop: '4',
		render: (row: any) => <span class={row[4].day_totla > 0 ? '!text-danger' : ''}>{row[4].day_totla}</span>,
	},
	{
		label: '防入侵',
		prop: '3',
		render: (row: any) => {
			return h(ElSwitch, {
				modelValue: row[3],
				size: 'small',
				onChange: (val: any) => changeIntrusion(row, val),
			})
		},
	},
	{
		label: '日志状态',
		prop: '5',
		render: (row: any, index: number) => {
			return h(ElSwitch, {
				modelValue: row[5],
				size: 'small',
				onChange: (val: any) => changeLog(row, index, val),
			})
		},
	},
	{ label: '描述', prop: '6', showOverflowTooltip: true },
	useOperate([{ onClick: getLogs, title: '命令日志', width: 70 }]),
]

watch(
	() => infoData.value,
	val => {
		val && (tableData.value = val.system_user)
	},
	{ immediate: true, deep: true }
)
</script>
