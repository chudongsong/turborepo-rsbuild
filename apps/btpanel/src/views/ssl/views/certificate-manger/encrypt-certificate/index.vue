<template>
	<div>
		<bt-table-group>
			<template #header-left>
				<div class="flex items-center">
					<bt-btn-group :options="tableBtnGroup" />
					<CustomerPopover :placement="'right'">
						<div class="flex items-center ml-[12px]">
							<bt-image :src="`/static/icons/we-com.svg`" class="mx-[4px] w-2rem h-2rem" :all="true" />
							<span class="bt-link">联系客服</span>
						</div>
					</CustomerPopover>
					<bt-link class="ml-[12px] flex items-center" @click="openNps">
						<div class="flex items-center">
							<span class="svgtofont-desired text-medium"></span>
							<span>需求反馈</span>
						</div>
					</bt-link>
				</div>
			</template>
			<template #header-right>
				<div class="flex items-center">
					<BtTableCategory class="!w-[140px] mr-[10px]" />
					<BtRecommendSearch type="ssl-certificate" placeholder="请输入证书名称" class="!w-[270px] mr-[10px]" />
					<BtColumn />
				</div>
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
			<template #popup>
				<bt-dialog title="证书删除确认" v-model="delPopup" :area="['auto']" @cancel="delRef.handleCancel()">
					<CertificateDeletion ref="delRef" delType="encrypt" :isMulti="isMulti" :compData="delData" @cancel="handleCancelDel" />
				</bt-dialog>
			</template>
		</bt-table-group>
	</div>
</template>

<script setup lang="tsx">
import CertificateDeletion from '@ssl/views/certificate-manger/certificate-deletion/index.vue'
import { useRoute, useRouter } from 'vue-router'
import { autoRenewDialog, delAutoRenew, deploy, download, openNps, renewalLocalCert, verifyDomain } from '../useMethod'
import { getSslStore } from '@ssl/useStore'
import CustomerPopover from '@site/public/ssl-arrange/business-cert/customer-popover.vue'
import { useGlobalStore } from '@/store/global'
import { useAllTable, useBatch, useConfirm, useDataHandle, useDialog, useMessage, useRecommendSearch, useRefreshList } from '@/hooks/tools'
import { checkObjKey, getPageTotal, isUndefined } from '@/utils'
import { addCertGroup, delCertGroup, getCertGroup, getCertList, removeCloudCert } from '@/api/ssl'
import { ElDivider, ElDropdown, ElDropdownItem, ElDropdownMenu, ElPopover } from 'element-plus'
import { useTableCategory } from '@/hooks/business'
import { TableBatchOptionsProps } from '@/components/extension/bt-table-batch/types'
import { useCertificateStore } from '../useStore'
import { useCheckbox } from '@/hooks/tools/table/column'
import { alarmDialog, setClassDialog } from '@/views/ssl/useMethod'
import { delData, delEvent, delPopup, delRef, exceptionLog, isMulti, useBatchEventHandle } from './useMethod'
import { CertificateType, canSetCertificateAlarm, handleBatchCertificateAlarmSetting } from '../useMethod'
const {
	refs: { tabActive, expiringCertificateCount, expiredCertificateCount, typeList },
} = getSslStore()
const { encryptIsRefresh, encryptSearchType } = storeToRefs(useCertificateStore())
const { mainHeight } = useGlobalStore()

const router = useRouter()
const Message = useMessage()

const tableBtnGroup: any = [
	{
		content: '申请证书',
		dropdownClass: 'bg-white',
		splitButton: true,
		active: true,
		event: () => {
			useDialog({
				isAsync: true,
				title: "申请Let's Encrypt证书",
				area: 64,
				component: () => import('./apply-lest-ssl.vue'),
			})
		},
	},
]

const certificateList = shallowRef<any>([]) // 证书列表

const handleCancelDel = () => {
	delPopup.value = false
}

const useCategory = useTableCategory({
	key: 'type',
	name: '证书分组',
	options: () => [{ label: '全部分组', value: 'all' }],
	event: {
		get: async () => {
			let classList: any[] = []
			await useDataHandle({
				request: getCertGroup(),
				data: Array,
				success: (data: any[]) => {
					classList = [
						{ label: '全部分组', value: 'all' },
						...data.map((item: AnyObject) => ({
							label: item.name,
							value: String(item.group_id),
						})),
					]
				},
			})
			typeList.value = classList as never
			return classList
		},
		add: (params: any) => {
			return addCertGroup({
				name: params.name,
				group_id: Date.now(),
			})
		},
		delete: (params: any) => {
			return delCertGroup({
				group_id: params.id,
			})
		},
	},
	ignore: ['0'],
	field: 'name',
	showEdit: false,
})

const batchCertificateOptions = [
	{
		label: '批量分组',
		value: 'group',
		event: (batchConfirm, nextAll, selectedList, options) => setClassDialog(selectedList.value, 'certificate'),
	},
	{
		label: '批量设置告警',
		value: 'alarm',
		event: (batchConfirm, nextAll, selectedList, options) => {
			handleBatchCertificateAlarmSetting(selectedList.value, CertificateType.ENCRYPT)
		},
	},
	{
		label: '下载',
		value: 'download',
		event: useBatchEventHandle,
	},
	{
		label: '删除',
		value: 'delete',
		event: useBatchEventHandle,
	},
] as TableBatchOptionsProps[]

/**
 * @description 批量操作
 */
const useTableBatch = useBatch(batchCertificateOptions)

const { BtTable, BtPage, BtRefresh, BtTableCategory, BtRecommendSearch, BtColumn, BtBatch, BtErrorMask, refresh } = useAllTable({
	request: async data => {
		let params = {
			p: data.p,
			group_id: isUndefined(data.type) || data.type === 'all' ? '-1' : data.type,
			search: data.search,
			limit: data.limit,
			status_id: encryptSearchType.value,
			cert_type: '3',
		} as any
		if (params.group_id === '-1') delete params.group_id
		if (params.status_id === '-1') delete params.status_id
		if (params.search === '') delete params.search
		const { data: resData } = await getCertList(params)
		certificateList.value = resData.data
		const chekckObj = checkObjKey(resData) // 检查对象是否存在，柯里化函数
		if (chekckObj('will_num')) {
			expiringCertificateCount.value = resData?.will_num || 0
		}
		if (chekckObj('end_num')) {
			expiredCertificateCount.value = resData?.end_num || 0
		}
		return {
			data: resData.data,
			total: getPageTotal(resData.page),
			other: {
				search_history: resData.search_history,
			},
		}
	},
	columns: [
		useCheckbox(),
		{
			label: '认证域名',
			render: (row: any) => {
				return row.domainName?.join(', ') || '--'
			},
		},
		{
			label: '部署网站',
			isCustom: true,
			render: (row: any) => {
				return row.use_site?.join(', ') || '--'
			},
		},
		{
			label: '分组',
			prop: 'group_name',
			width: 100,
			showOverflowTooltip: true,
			isCustom: false,
		},
		{
			label: '到期时间',
			isCustom: true,
			render: (row: any) => {
				const getColor = (endDay: number) => {
					if (endDay <= 0) return 'text-danger'
					if (endDay <= 7) return 'text-danger'
					if (endDay <= 15) return 'text-warning'
					return 'text-primary'
				}

				const renderEndDate = (endDay: number, color: string) => <span class={endDay <= 10 ? 'text-danger' : color}>{endDay > 0 ? `剩余${endDay}天` : '已过期'}</span>

				const color = getColor(row.endDay)

				if (row.type === '1') {
					return row.endDate ? renderEndDate(row.endDay, row.endDay <= 30 ? 'text-warning' : color) : <span>--</span>
				}

				if (row.type === '2') {
					return row?.endDay && row?.endDay !== 0 ? renderEndDate(row.endDay, row.endDay <= 30 ? 'text-warning' : color) : <span>--</span>
				}

				return <span class={row.domainName?.length ? color : 'text-default'}>{row.domainName?.length ? (row.endDay > 0 ? `剩余${row.endDay}天` : '已过期') : '--'}</span>
			},
		},
		{
			label: '验证方式',
			isCustom: true,
			prop: 'auth_type',
			render: (row: any, index: number) => {
				return <span>{row.auth_type === 'dns' ? 'DNS验证' : '文件验证'}</span>
			},
		},
		{
			label: '订单状态',
			isCustom: true,
			renderHeader() {
				const menu: any[] = [
					{ title: '全部', key: '-1' },
					{ title: '验证中', key: '0' },
					{ title: '未到期/订单完成', key: '1' },
					{ title: '即将到期', key: '2' },
					{ title: '已到期', key: '3' },
				]
				return h('div', { class: 'flex items-center flex-nowrap' }, [
					'',
					h(
						ElDropdown,
						{
							onCommand: (key: string) => {
								encryptSearchType.value = key
								refresh()
							},
						},
						{
							default: () =>
								h('span', { class: 'text-small flex items-center' }, [[<span class="status-header-text">订单状态{encryptSearchType.value === '-1' ? '(全部)' : `(${menu.find((items: any) => items.key === encryptSearchType.value).title})`}</span>], h('i', { class: 'svgtofont-el-arrow-down ' })]),
							dropdown: () => (
								<ElDropdownMenu>
									{menu.map(item => (
										<ElDropdownItem command={item.key}>{item.title}</ElDropdownItem>
									))}
								</ElDropdownMenu>
							),
						}
					),
				])
			},
			render: (row: any) => {
				if (!row?.order_status || row?.order_status === '') {
					return <span class="text-primary">订单完成</span>
				} else {
					switch (row.order_status) {
						case 'pending':
							if (row.domainName?.length && row.endDay > 0) {
								return <span class="text-warningDark">待验证</span>
							} else {
								return <span>--</span>
							}
						case 'invalid':
							return (
								<el-tooltip content="验证失败，请尝试删除此订单后重新申请" placement="top">
									<span class="text-warningDark">{row.order_status_nm}</span>
								</el-tooltip>
							)
						default:
							return <span class="text-primary">订单完成</span>
					}
				}
			},
		},
		{
			label: '自动续签',
			renderHeader: () => {
				return (
					<div class="flex items-center">
						<span>自动续签</span>
						<ElPopover placement="top-start" width="200" trigger="hover" content="只支持let's Encrypt证书订单续签">
							{{
								reference: () => <span class=" ml-[4px] bt-ico-ask">?</span>,
							}}
						</ElPopover>
					</div>
				)
			},
			isCustom: false,
			render: (row: any) => {
				let status = row.type === '3' && row.order_status && row.crontab_id !== -1 ? true : false
				let disabled = row.type !== '3' || row.order_status !== 'valid' ? true : false
				return (
					<span class="flex items-center">
						<ElSwitch
							size="small"
							v-model={status}
							disabled={disabled}
							onChange={(val: any) => {
								if (val) {
									row.crontab_id = 1
									autoRenewDialog({
										...row,
										cancel: () => {
											nextTick(() => {
												row.crontab_id = -1
											})
										},
									})
								} else {
									delAutoRenew(row)
								}
							}}></ElSwitch>
						{row.crontab_data && Number(row.crontab_data.status) === -1 && (
							<span class="bt-link !text-danger ml-[4px]" onClick={() => exceptionLog(row)}>
								异常
							</span>
						)}
					</span>
				)
			},
		},
		{
			label: '操作',
			align: 'right',
			fixed: 'right',
			width: 280,
			render: (row: any) => {
				let btnGround: any = []
				if (row.order_status === 'valid') {
					btnGround.push(
						<span
							class="cursor-pointer bt-link"
							onClick={() => {
								renewalLocalCert(row)
							}}>
							续签
						</span>
					)

					// 使用统一的验证器检查是否可以设置告警
					if (canSetCertificateAlarm(row, CertificateType.ENCRYPT)) {
						btnGround.push(
							<span
								class="cursor-pointer bt-link"
								onClick={() =>
									alarmDialog({
										...row,
										cancel: () => {},
									})
								}>
								到期告警
							</span>
						)
					}
				}

				if (row.order_status !== 'pending' && row.order_status !== 'invalid') {
					btnGround.push(
						<span class="cursor-pointer bt-link" onClick={() => deploy(row)}>
							部署
						</span>
					)
					btnGround.push(
						<span class="cursor-pointer bt-link" onClick={() => download(row)}>
							下载
						</span>
					)
				} else if (row.domainName?.length && row.endDay > 0 && row.order_status && row.order_status !== 'invalid') {
					btnGround.push(
						<span class="cursor-pointer bt-link" onClick={() => verifyDomain(row)}>
							验证
						</span>
					)
				}
				btnGround.push(
					<span class="cursor-pointer bt-link" onClick={() => delEvent(row, false)}>
						删除
					</span>
				)
				const newBtnGround: JSX.Element[] = []
				btnGround.map((item: any, index: number) => {
					newBtnGround.push(item)
					index < btnGround.length - 1 ? newBtnGround.push(<ElDivider direction="vertical" />) : ''
				})
				btnGround = newBtnGround
				return btnGround
			},
		},
	],
	extension: [
		useCategory,
		useTableBatch,
		useRefreshList(encryptIsRefresh),
		useRecommendSearch('search', {
			name: 'ssl',
			key: 'get_cert_list',
			list: [],
			showRecommend: false,
		}),
	],
})

const cutTabs = (name: any) => {
	tabActive.value = name
	router.push({ name })
}

onMounted(() => {
	// getCertListData()
	tabActive.value = useRoute().name as string
})

defineExpose({
	init: refresh,
})
</script>

<style scoped></style>
