<template>
    <div class="domain-manger module-ui">
		<BtAlert class="!mb-[12px]" type="warning" show-icon>
			<template #title>
				<div>当前域名列表仅显示顶级域名，配置DNS，可以快速解析域名和申请证书。</div>
			</template>
		</BtAlert>
        <bt-table-group>
            <template #header-left>
                <div class="flex items-center">
                    <bt-btn-group :options="tableBtnGroup" />
					<span class="bg-darkTertiary w-[1px] h-[16px] mx-[16px]"></span>
					<div class="flex items-center ip-edit-input-group mr-[12px]">
						<el-form-item prop="ip" class="!mb-0">
							<el-input 
								disabled
								v-model="ipSearchValue"
								:value="`解析IP：${ipSearchValue}`"
								:placeholder="`解析IP：${ipSearchValue}`"
							>
								<template #append>
									<el-button type="primary" @click="handleModifyIp(ipSearchValue)">修改</el-button>
								</template>
							</el-input>
						</el-form-item>
					</div>
                    <bt-link class="flex items-center" @click="openNps">
                        <div class="flex items-center">
                            <span class="svgtofont-desired text-medium"></span>
                            <span>需求反馈</span>
                        </div>
                    </bt-link>
                </div>
            </template>
            <template #header-right>
                <!-- <GroupSearch class="mr-[1rem]"></GroupSearch> -->
                <BtTableCategory class="!w-[140px] mr-[10px]" />
                <BtRecommendSearch type="ssl-domain" placeholder="请输入域名" class="!w-[270px] mr-[10px]" />
				<BtRefresh class="mr-4" />
                <BtColumn />
            </template>
            <template #content>
                <BtTable :min-height="mainHeight" />
            </template>
            <template #footer-left>
                <BtBatch />
            </template>
            <template #footer-right>
                <BtPage />
            </template>
        </bt-table-group>
    </div>
</template>

<script setup lang="tsx">
import GroupSearch from '@ssl/public/group-search/index.vue'
import { getSslStore } from '@ssl/useStore'
import { npsSurveyV2Dialog } from '@/public/index' // 需求反馈弹窗
import { useDomainTableColumns, setDateEndDialog, dnsSettingDialog, domainDnsDialog, subDomainDialog, createSiteDialog, handleModifyIp } from './useMethod'
import { alarmDialog, dnsStatusDialog } from '@ssl/useMethod'
import { useGlobalStore } from '@store/global'
import { getDomainList, delDomains, syncDomains, removeReportTask, getDomainType, addDomainType, delDomainType } from '@api/ssl'
import { checkObjKey, checkVariable, getPageTotal, isArray, isUndefined } from '@utils/index'

import { setClassDialog } from '@ssl/useMethod'
import { useBatchStatus, useCheckbox, useOperate } from '@hooks/tools/table/column'
import { useAllTable, useBatch, useRefreshList } from '@/hooks/tools/table/index'
import { useDataHandle, useMessage, useRecommendSearch, useDialog } from '@/hooks/tools'
import { useConfirm } from '@hooks/tools/confirm'
import type { SslHistoryItemProps } from '@ssl/types.d'
import type { TableBatchDialogProps, TableBatchEventProps, TableBatchNextAllProps, TableBatchOptionsProps } from '@components/extension/bt-table-batch/types'
import { useTableCategory } from '@/hooks/business'
import { TableColumnProps } from '@/components/data/bt-table/types'
import { useRoute } from 'vue-router'
import { useDomainRegisterStore } from '@domain/views/domain-register/useStore'
import { loadAnalysisIp } from '@domain/views/domain-register/useController'
import { fetchPublicIp } from '@domain/useController'

const MessageMethod = useMessage()
const { mainHeight } = useGlobalStore()
const {
	refs: { tabActive, isRefreshDomainList, typeList },
} = getSslStore()
const { ipSearchValue, publicIp } = useDomainRegisterStore()

// 修复 typeList 类型
const typeListRef = typeList as Ref<any[]>

const domainTableList = shallowRef<any>([]) // 域名列表
const checkedList = ref<any>([])
const sslHistoryList = shallowRef<SslHistoryItemProps[]>([]) // ssl历史记录
const domainTableRef = ref<any>(null)

const tableBtnGroup: any = [
	{
		content: '添加域名',
		active: true,
		event: () => {
			handleSync()
		},
	},
	{
		content: 'DNS接口设置',
		dropdownClass: 'bg-white',
		splitButton: true,
		event: () => {
			dnsSettingDialog()
		},
	},
]

const getDomainListData = async (data: any) => {
	try {
		let params = {
			p: data.p,
			type_id: isUndefined(data.type) || data.type === 'all' ? '-1' : data.type,
			search: data.search,
			limit: data.limit,
		} as any
		if (params.type_id === '-1') delete params.type_id
		const { data: resData } = await getDomainList(params)
		return {
			data: resData.data,
			total: getPageTotal(resData.page),
			other: {
				search_history: resData.search_history,
			},
		}
	} catch (error) {
		return {
			data: [],
			total: 0,
		}
	}
}

/**
 * @description 批量处理事件
 * @param {TableBatchDialogProps} batchConfirm 选中处理事件
 * @param {TableBatchNextAllProps} nextAll 选中处理事件
 * @param {Ref<FtpTableRowProps[]>} selectList 选中的数据
 * @param {TableBatchOptionsProps} options 选中的配置
 * @returns {Promise<void>} void
 */
const useBatchEventHandle: TableBatchEventProps = async (batchConfirm: TableBatchDialogProps, nextAll: TableBatchNextAllProps, selectList: Ref<any[]>, options: TableBatchOptionsProps): Promise<void> => {
	const { label, value } = options
	const template: Map<string, string> = new Map([['delete', '即将批量删除选中的域名']])
	const requestHandle = async (item: any, index: number) => {
		const { domain: domains } = item
		switch (value) {
			case 'delete':
				return await delDomains({ domains })
		}
	}
	await batchConfirm({
		title: `批量${label}`,
		content: `${template.get(value) as string}，是否继续操作！`,
		column: [{ label: '域名', prop: 'domain' }, useBatchStatus()] as TableColumnProps[], // 弹窗配置
		onConfirm: async () => {
			await nextAll(requestHandle)
			isRefreshDomainList.value = true
			return false
		},
	})
}

const batchDomainOptions = [
	{
		label: '设置分类',
		value: 'type',
		event: (batchConfirm, nextAll, selectedList, options) => setClassDialog(selectedList.value, 'domain'),
	},
	{
		label: '配置DNS接口',
		value: 'dnsSet',
		event: (batchConfirm, nextAll, selectedList, options) => dnsStatusDialog(selectedList.value[0], selectedList.value),
	},
	{
		label: '设置到期时间',
		value: 'dateSet',
		event: (batchConfirm, nextAll, selectedList, options) => setDateEndDialog({}, selectedList.value),
	},
	{
		label: '删除',
		value: 'delete',
		event: useBatchEventHandle,
	},
] as TableBatchOptionsProps[]

const useCategory = useTableCategory({
	key: 'type',
	name: '域名分类',
	options: () => [{ label: '全部分类', value: '-1' }],
	event: {
		get: async () => {
			const { data } = await getDomainType()
			typeListRef.value = data
			typeListRef.value = checkVariable(data, 'array', []).map((item: any) => ({
				label: item.name,
				value: item.type_id,
			}))
			typeListRef.value.unshift({ label: '全部分类', value: 'all' })
			return typeListRef.value
		},
		add: (params: any) => {
			return addDomainType(params)
		},
		update: (params: any) => {
			return addDomainType(params)
		},
		delete: (params: any) => {
			return delDomainType({
				type_id: params.id,
			})
		},
	},
	ignore: ['0'],
	field: 'name',
	showEdit: false,
})

/**
 * @description 批量操作
 */
const useTableBatch = useBatch(batchDomainOptions)

const { BtTable, BtPage, BtRefresh, BtColumn, refresh, BtBatch, BtTableCategory, BtRecommendSearch } = useAllTable({
	request: getDomainListData,
	columns: [
		useCheckbox(),
		{
			label: '域名',
			prop: 'domain',
		},
		{
			label: '分组',
			width: 180,
			isCustom: true,
			render: (row: any) => {
				const item = typeListRef.value.find((item: any) => item.value == row.type_id)
				return item ? item.label : '未分组'
			},
		},
		{
			label: '解析数量',
			prop: 'sbd_count',
			isCustom: true,
		},
		{
			label: 'DNS接口',
			width: 200,
			isCustom: true,
			render: (row: any) => {
				return (
					<div class={'flex items-center'}>
						{row.dns?.dns_name ? (
							<span>{row.dns.dns_name}</span>
						) : (
							<span class={'bt-link cursor-pointer'} onClick={() => dnsStatusDialog(row)}>
								未配置
							</span>
						)}
						<div class={'el-divider el-divider--vertical'}></div>
						<span class={'bt-link cursor-pointer'} onClick={() => dnsStatusDialog(row)}>
							点击配置
						</span>
					</div>
				)
			},
		},
		{
			label: '到期时间',
			isCustom: true,
			render: (row: any) => {
				const todayStart = new Date().setHours(0, 0, 0, 0)
				const endTimeStamp = row.endtime ? new Date(row.endtime.replace(/-/g, '/')).getTime() : 0
				const isExpired = row.endtime !== 0 && endTimeStamp < todayStart
				const isOrange = row.endtime !== 0 && endTimeStamp - Date.now() < 7 * 24 * 60 * 60 * 1000
				return (
					<span
						class={'cursor-pointer ' + (isExpired ? 'bt-danger' : isOrange ? 'bt-warn' : 'bt-link')}
						onClick={() => {
							setDateEndDialog(row)
						}}>
						{isExpired ? '已过期' : row.endtime === 0 ? '未设置' : row.endtime}
					</span>
				)
			},
		},
		// {
		// 	prop: 'report_id',
		// 	label: '到期告警',
		// 	render: (row: any) => {
		// 		// 计算到期时间是否已经过期，过期显示红色
		// 		const todayStart = new Date().setHours(0, 0, 0, 0)
		// 		const isExpired = row.endtime !== 0 && new Date(row.endtime).getTime() / 1000 < todayStart / 1000
		// 		let status = row.report_id == '' ? false : true
		// 		return (
		// 			<ElSwitch
		// 				size="small"
		// 				v-model={status}
		// 				disabled={(row.endtime === 0 || isExpired) && !status}
		// 				onChange={(val: any) => {
		// 					if (val) {
		// 						row.report_id = '1'
		// 						alarmDialog({
		// 							...row,
		// 							cancel: () => {
		// 								nextTick(() => {
		// 									row.report_id = ''
		// 								})
		// 							},
		// 						})
		// 					} else {
		// 						closeAlarm(row)
		// 					}
		// 				}}></ElSwitch>
		// 		)
		// 	},
		// },
		useOperate([
			{
				onClick: (row: any) => {
					createSiteDialog(row)
				},
				title: '创建网站',
			},
			{
				onClick: (row: any) => {
					if (!row.dns_id) {
						MessageMethod.error('请先配置DNS')
						dnsStatusDialog(row)
					} else {
						domainDnsDialog(row)
					}
				},
				title: '快速解析',
			},
			{
				onClick: (row: any) => {
					if (row.dns?.dns_name) {
						subDomainDialog(row)
					} else {
						MessageMethod.error('请先配置DNS')
						dnsStatusDialog(row)
					}
				},
				title: '解析记录管理',
				width: 120,
			},
			{
				onClick: (row: any) => {
					delDomain(row)
				},
				title: '删除',
			},
		]),
	],
	extension: [
		useCategory,
		useTableBatch,
		useRefreshList(isRefreshDomainList),
		useRecommendSearch('search', {
			name: 'ssl',
			key: 'get_domain_list',
			list: [],
			showRecommend: false,
		}),
	],
})

/**
 * @description 多选
 * @param {Array} val 选中数据
 * @returns {void} void
 */
const handleSelectionChange = (val: Array<any>): void => {
	checkedList.value = val
}

const openNps = () => {
	npsSurveyV2Dialog({
		title: '域名需求反馈收集',
		type: 28,
		isNoRate: true,
		softName: '1',
		isCard: false,
		id: 993,
	})
}

/**
 * @description 删除域名
 * @param {any} row
 * @return {void}
 */
const delDomain = async (row: any, isMult: boolean = false): Promise<any> => {
	let load
	try {
		if (!isMult)
			await useConfirm({
				title: `删除【${row.domain}】域名`,
				content: '删除该域名，是否继续操作？',
				icon: 'warning',
				width: 45,
			})
		if (!isMult) load = MessageMethod.load('正在删除域名，请稍候...')
		const ress = await delDomains({ domains: row.domain })
		if (!isMult) MessageMethod.request(ress)
		if (ress.status && !isMult) isRefreshDomainList.value = true
		return ress
	} catch (error) {
		console.log('error', error)
	} finally {
		load && load.close()
	}
}

/**
 * @description: 删除域名到期告警
 * @param {any} row
 * @return {void}
 **/
const closeAlarm = async (row: any): Promise<void> => {
	let task_id = row.report_id
	try {
		row.report_id = ''
		await useConfirm({
			title: `删除【${row.domain}】到期告警`,
			content: '删除该域名到期告警，是否继续操作？',
			icon: 'warning',
			width: 45,
		})
		let load = MessageMethod.load('正在删除域名到期告警，请稍候...')
		const ress = await removeReportTask({
			task_id: task_id,
		})
		MessageMethod.request(ress)
		if (ress.status) {
			isRefreshDomainList.value = true
		}
		load && load.close()
	} catch (error) {
		if (error) {
			nextTick(() => {
				row.report_id = task_id
			})
		}
	}
}

/**
 * @description 手动同步
 */
const handleSync = async () => {
	useDialog({
		title: '添加域名',
		btn: ['确认', '取消'],
		component: () => import('./global-DNS/create-domain/index.vue'),
		area: 50,
	})
}

onMounted(async () => {
	tabActive.value = useRoute().name as string
	publicIp.value = await fetchPublicIp()
	await loadAnalysisIp()
})

provide('sslHistoryList', sslHistoryList)
</script>

<style scoped lang="scss">

.domain-manger{
	:deep(.domain-register-input-group .el-input-group__append) {
		background-color: var(--el-color-primary)!important;
		color: var(--el-color-white)!important;
		box-shadow: none!important;
	}
	:deep(.ip-edit-input-group .el-input-group__append) {
		background-color: rgb(var(--el-color-white-rgb))!important;
		color: var(--el-color-text-secondary)!important;
	}
	:deep(.ip-edit-input-group .el-input-group__append button:hover) {
		color: var(--el-color-primary)!important;
	}
}
</style>
