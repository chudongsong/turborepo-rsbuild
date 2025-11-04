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
					<CertificateDeletion ref="delRef" delType="other" :isMulti="isMulti" :compData="delData" @cancel="handleCancelDel" />
				</bt-dialog>
			</template>
		</bt-table-group>
	</div>
</template>

<script setup lang="tsx">
import CertificateDeletion from '@ssl/views/certificate-manger/certificate-deletion/index.vue'
import { useRoute } from 'vue-router'
import { busCertVerifyInfoDialog, certVerifyWay, deploy, download, openNps, renewalBusCert, renewalLocalCert, uploadCertificateDialog, verifyDomain } from '../useMethod'
import { getSslStore } from '@ssl/useStore'
import CustomerPopover from '@site/public/ssl-arrange/business-cert/customer-popover.vue'
import { useGlobalStore } from '@/store/global'
import { useAllTable, useBatch, useDataHandle, useMessage, useRecommendSearch, useRefreshList } from '@/hooks/tools'
import { checkObjKey, getPageTotal, isUndefined } from '@/utils'
import { addCertGroup, delCertGroup, getCertGroup, getCertList } from '@/api/ssl'
import { ElDivider } from 'element-plus'
import { useTableCategory } from '@/hooks/business'
import { TableBatchOptionsProps } from '@/components/extension/bt-table-batch/types'
import { applyTrustCert } from '@/views/site/public/ssl-arrange/trust-asia-cert/useController'
import { useCertificateStore } from '../useStore'
import { useCheckbox } from '@/hooks/tools/table/column'
import { onlineServiceDialog } from '@/public'
import { alarmDialog, setClassDialog } from '@/views/ssl/useMethod'
import { delData, deleteCloudCert, delEvent, delPopup, delRef, isMulti, updateCertFromCloudData, uploadCloudCert, useBatchEventHandle } from './useMethod'
import { CertificateType, canSetCertificateAlarm, handleBatchCertificateAlarmSetting } from '../useMethod'

const {
	refs: { tabActive, certificateParams, expiringCertificateCount, expiredCertificateCount, typeList },
} = getSslStore()
const { otherIsRefresh } = storeToRefs(useCertificateStore())
const { mainHeight } = useGlobalStore()
const Message = useMessage()

const tableBtnGroup: any = [
	{
		content: '上传证书',
		dropdownClass: 'bg-white',
		splitButton: true,
		active: true,
		event: () => {
			uploadCertificateDialog()
		},
	},
	{
		content: '从云端同步',
		dropdownClass: 'bg-white',
		splitButton: true,
		event: () => {
			updateCertFromCloudData()
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
			handleBatchCertificateAlarmSetting(selectedList.value, CertificateType.OTHER)
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
			status_id: certificateParams.value.status_id,
			cert_type: '4',
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
			label: '证书类型',
			prop: 'title',
			showOverflowTooltip: true,
			width: 180,
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
			label: '操作',
			align: 'right',
			fixed: 'right',
			width: 280,
			render: (row: any) => {
				const renderButton = (text: string, onClick: () => void) => (
					<span class="cursor-pointer bt-link" onClick={onClick}>
						{text}
					</span>
				)

				const buttons = []

				if (row.endDay > 0) {
					buttons.push(renderButton('部署', () => deploy(row)))
					buttons.push(renderButton('下载', () => download(row)))

					if (row.cloud_id === -1) {
						buttons.push(renderButton('上传云端', () => uploadCloudCert(row)))
					} else {
						buttons.push(renderButton('从云端删除', () => deleteCloudCert(row)))
					}

					// 使用统一的验证器检查是否可以设置告警
					if (canSetCertificateAlarm(row, CertificateType.OTHER)) {
						buttons.push(
							renderButton('到期告警', () =>
								alarmDialog({
									...row,
									cancel: () => {},
								})
							)
						)
					}
				}

				buttons.push(renderButton('删除', () => delEvent(row, false)))

				return buttons.map((button, index) => (
					<div>
						{button}
						{index < buttons.length - 1 && <ElDivider direction="vertical" />}
					</div>
				))
			},
		},
	],
	extension: [
		useCategory,
		useTableBatch,
		useRefreshList(otherIsRefresh),
		useRecommendSearch('search', {
			name: 'ssl',
			key: 'get_cert_list',
			list: [],
			showRecommend: false,
		}),
	],
})

onMounted(() => {
	// getCertListData()
	tabActive.value = useRoute().name as string
})

defineExpose({
	init: refresh,
})
</script>

<style scoped></style>
