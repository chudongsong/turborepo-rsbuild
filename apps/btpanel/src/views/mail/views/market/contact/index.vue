<template>
	<div>
		<echarts-view :active="search.active"></echarts-view>
		<bt-table-group>
			<template #header-left>
				<el-button type="primary" @click="onImport">导入</el-button>
				<header-nav-tools class="ml-16px" />
			</template>
			<template #header-right>
				<el-radio-group v-model="search.active" @change="onChangeType" class="w-[120px] mr-[12px]">
					<el-radio-button label="订阅" :value="1"></el-radio-button>
					<el-radio-button label="取消订阅" :value="0"></el-radio-button>
				</el-radio-group>
				<mail-type v-model:value="typeId" class="mr-[12px]" @update:value="refresh"></mail-type>
				<BtSearch v-model="search.keyword" class="!w-[240px]" placeholder="请输入邮箱" @search="onSearch">
				</BtSearch>
			</template>
			<template #content>
				<BtTable ref="tableRef" />
			</template>
			<template #footer-left>
				<BtBatch ref="batchRef" />
			</template>
			<template #footer-right>
				<BtPage ref="pageRef" />
			</template>
		</bt-table-group>
	</div>
</template>

<script lang="tsx" setup>
// import { isObject, formatTime } from '@/utils'
import { getUnsubscribeList, delUnsubscribe, editSubscribeState } from '@/api/mail'

import ChangeList from './change-list/index.vue'
import ImportContact from './import/index.vue'
import MailType from './mail-type/index.vue'
import SetMailType from './mail-type/batch.vue'
import { Message, useAllTable, useBatch, useConfirm, useDataHandle, useDialog } from '@/hooks/tools'
import EchartsView from './echarts/index.vue'
import { useBatchStatus, useCheckbox, useOperate } from '@/hooks/tools/table/column'
import { formatTime } from '@/utils'
import { typeId } from '@mail/views/market/useMethod'
import { openResultView } from '@/public'
import HeaderNavTools from '@/views/mail/public/header-nav-tools.vue'

const search = reactive({
	p: 1,
	size: 10,
	active: 1,
	keyword: '',
})

/**
 * @description 批量操作
 */
const handleBatch = async (batchConfirm, nextAll, selectedList, options) => {
	const { label, value } = options
	const titleMap: any = {
		del: '删除',
		subscribe: '订阅',
		unsubscribe: '取消订阅',
	}
	const requestHandle = async (data: any) => {
		const requestList: Map<string, any> = new Map([
			['subscribe', editSubscribeState],
			['unsubscribe', editSubscribeState],
			['del', delUnsubscribe],
		])
		const fn = requestList.get(value)
		switch (value) {
			case 'subscribe':
			case 'unsubscribe':
				const status = value === 'subscribe' ? 1 : 0
				if (fn) return await fn({ recipient: data.recipient, active: status })
				break
			case 'del':
				if (fn) return await fn({ ids: data.id, active: data.active })
				break
		}
	}
	useConfirm({
		title: `批量${titleMap[value]}`,
		content: `确定${titleMap[value]}选定项吗？`,
		onConfirm: async () => {
			let resultData: any[] = []
			let load = Message.load(`批量${titleMap[value]}中...`)
			await nextAll(async (data: any) => {
				const res = await requestHandle(data)
				resultData.push({
					name: data.recipient,
					status: res.status,
					message: res.msg,
					msg: res.msg,
				})
				load.close()
			})
			openResultView(resultData, { title: `${titleMap[value]}` })
			refresh()
		},
	})
}

/**
 * @description 批量操作
 */
const useTableBatch = useBatch([
	{
		label: '删除',
		value: 'del',
		event: handleBatch,
	},
	{
		label: '订阅',
		value: 'subscribe',
		event: handleBatch,
	},
	{
		label: '取消订阅',
		value: 'unsubscribe',
		event: handleBatch,
	},
	{
		label: '设置分组',
		value: 'category',
		event: (batchConfirm, nextAll, selectedList, options) => {
			useDialog({
				title: '设置分组',
				area: 45,
				showFooter: true,
				compData: {
					rows: selectedList.value,
					onRefresh: refresh,
				},
				component: SetMailType,
			})
		},
	},
])

const { BtTable, BtPage, BtSearch, BtRefresh, BtColumn, BtBatch, BtTableCategory, BtErrorMask, tableRef, classList, refresh } = useAllTable({
	request: async (params: any) => {
		let param: any = {
			etype: typeId.value,
			search: params.search,
			p: params.p,
			size: params.limit,
			active: search.active,
		}
		if (param.etype === -1) {
			delete param.etype
		}
		const {
			data: { data, total },
		} = await getUnsubscribeList(param)
		return {
			data,
			total,
		}
	},
	columns: [
		useCheckbox(),
		{
			prop: 'recipient',
			label: '邮箱',
			showOverflowTooltip: true,
		},
		{
			prop: 'mail_type',
			label: '分组',
			render: row => row.mail_type.map(obj => Object.values(obj)[0]).join(', '),
		},
		{
			prop: 'created',
			label: '添加时间',
			width: 140,
			render: row => formatTime(row.created),
		},
		useOperate((row: any) => [
			{
				title: '更改列表',
				onClick: async () => {
					useDialog({
						title: '更改列表',
						area: 50,
						showFooter: true,
						compData: {
							row,
							onRefresh: () => {
								refresh()
							},
						},
						component: ChangeList,
					})
				},
			},
			{
				title: row.active ? '取消订阅' : '订阅',
				onClick: async () => {
					useConfirm({
						title: `${row.active ? '取消订阅' : '订阅'} [${row.recipient}]`,
						content: `您确定要从此邮箱${row.active ? '取消订阅' : '订阅'}吗？`,
						onConfirm: async () => {
							useDataHandle({
								request: editSubscribeState({
									recipient: row.recipient,
									active: row.active === 0 ? 1 : 0,
								}),
								loading: '更改中...',
								message: true,
								success: () => {
									refresh()
								},
							})
						},
					})
				},
			},
			{
				title: '删除',
				onClick: async () => {
					useConfirm({
						title: `删除 [${row.recipient}]`,
						content: `您确定要删除此${row.active ? '订阅' : '取消订阅'}邮件吗？`,
						onConfirm: async () => {
							useDataHandle({
								request: delUnsubscribe({ ids: row.id, active: row.active }),
								loading: '删除中...',
								message: true,
								success: () => {
									refresh()
								},
							})
						},
					})
				},
			},
		]),
	],
	extension: [useTableBatch],
})

const onImport = () => {
	useDialog({
		title: '导入联系人',
		area: 45,
		showFooter: true,
		compData: {
			active: search.active,
			group: typeId.value,
			refresh: () => {
				refresh()
			},
		},
		component: ImportContact,
	})
}

const onChangeType = (val: any) => {
	search.active = val
	search.p = 1
	refresh()
}

const onSearch = () => {
	search.p = 1
	refresh()
}

// const batchOptions: BatchOptions<MailUnsubscribe> = [
// 	{
// 		key: 'del',
// 		type: 'confirm',
// 		label: t('Public.Btn.Del'),
// 		confirm: {
// 			title: t('Public.Batch.Del'),
// 			desc: t('Site.Batch.index_11'),
// 			api: row => delUnsubscribe({ ids: row.id, active: row.active }, false),
// 			done: () => {
// 				getList()
// 			},
// 			columns: [
// 				{
// 					key: 'recipient',
// 					title: t('Mail.Unsubscribe.index_1'),
// 					ellipsis: {
// 						tooltip: {
// 							width: 'trigger',
// 						},
// 					},
// 				},
// 			],
// 		},
// 	},
// 	{
// 		key: 'subscribe',
// 		type: 'confirm',
// 		label: t('Mail.Mass.index_71'),
// 		confirm: {
// 			title: t('Mail.Mass.index_79'),
// 			desc: t('Mail.Mass.index_80'),
// 			api: row => editSubscribeState({ recipient: row.recipient, active: 1 }, false),
// 			done: () => {
// 				getList()
// 			},
// 			columns: [
// 				{
// 					key: 'recipient',
// 					title: t('Mail.Unsubscribe.index_1'),
// 					ellipsis: {
// 						tooltip: {
// 							width: 'trigger',
// 						},
// 					},
// 				},
// 			],
// 		},
// 	},
// 	{
// 		key: 'unsubscribe',
// 		type: 'confirm',
// 		label: t('Mail.Mass.index_72'),
// 		confirm: {
// 			title: t('Mail.Mass.index_81'),
// 			desc: t('Mail.Mass.index_82'),
// 			api: row => editSubscribeState({ recipient: row.recipient, active: 0 }, false),
// 			done: () => {
// 				getList()
// 			},
// 			columns: [
// 				{
// 					key: 'recipient',
// 					title: t('Mail.Unsubscribe.index_1'),
// 					ellipsis: {
// 						tooltip: {
// 							width: 'trigger',
// 						},
// 					},
// 				},
// 			],
// 		},
// 	},
// 	{
// 		key: 'category',
// 		label: 'Set Groups',
// 		onBatch: rows => {
// 			useDialog({
// 				title: 'Batch Set Groups',
// 				width: 440,
// 				footer: true,
// 				data: {
// 					rows,
// 					onRefresh: () => {
// 						getList()
// 					},
// 				},
// 				component: SetMailType,
// 			})
// 		},
// 	},
// ]

// const getParams = () => {
// 	return {
// 		...(typeId.value === -1 ? {} : { etype: typeId.value }),
// 		search: search.keyword,
// 		p: search.p,
// 		size: search.size,
// 		active: search.active,
// 	}
// }

// const getList = async () => {
// 	try {
// 		setLoading(true)
// 		const { message } = await getUnsubscribeList(getParams())
// 		if (isObject<{ data: MailUnsubscribe[]; total: number }>(message)) {
// 			table.data = message.data
// 			table.total = message.total
// 		}
// 	} finally {
// 		keys.value = []
// 		setLoading(false)
// 	}
// }

onUnmounted(() => {
	typeId.value = -1
})

// defineExpose({
// 	init: getList,
// })
</script>
