<template>
	<div>
		<bt-table-group>
			<template #header-left>
				<div class="flex items-center">
					<bt-btn-group :options="tableBtnGroup" />
					<CustomerPopover :placement="'right'">
						<div class="flex items-center ml-[12px]">
							<bt-image :src="`/static/icons/we-com.svg`" class="mx-[4px] w-2rem h-2rem" :all="true" />
							<span class="bt-link">售前客服</span>
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
					<CertificateDeletion ref="delRef" delType="ssl" :isMulti="isMulti" :compData="delData" @cancel="handleCancelDel" />
				</bt-dialog>
			</template>
		</bt-table-group>
	</div>
</template>

<script setup lang="tsx">
import CertificateDeletion from '@ssl/views/certificate-manger/certificate-deletion/index.vue'
import { useRoute } from 'vue-router'
import { busCertVerifyInfoDialog, certVerifyWay, deploy, download, openNps, renewalBusCert } from '../useMethod'
import { getSslStore } from '@ssl/useStore'
import CustomerPopover from '@site/public/ssl-arrange/business-cert/customer-popover.vue'
import { useGlobalStore } from '@/store/global'
import { useAllTable, useBatch, useRecommendSearch, useRefreshList } from '@/hooks/tools'
import { checkObjKey, getPageTotal, isUndefined } from '@/utils'
import { getCertList } from '@/api/ssl'
import { ElDivider, ElDropdown, ElDropdownItem, ElDropdownMenu, ElPopover } from 'element-plus'
import { onlineServiceDialog } from '@/public'
import { alarmDialog } from '@/views/ssl/useMethod'
import { useCheckbox } from '@/hooks/tools/table/column'
import { batchCertificateOptions, certificateList, delData, delEvent, delPopup, delRef, handleCancelDel, isMulti, tableBtnGroup, useCategory, getBtSslStatus, getBtSslOperate } from './useMethod'
import { useCertificateStore } from '../useStore'

const {
	refs: { tabActive, expiringCertificateCount, expiredCertificateCount },
} = getSslStore()
const { sslSearchType, sslIsRefresh } = storeToRefs(useCertificateStore())
const { mainHeight } = useGlobalStore()

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
			status_id: sslSearchType.value,
			cert_type: '1',
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
								sslSearchType.value = key
								refresh()
							},
						},
						{
							default: () => h('span', { class: 'text-small flex items-center' }, [[<span class="status-header-text">订单状态{sslSearchType.value === '-1' ? '(全部)' : `(${menu.find((items: any) => items.key === sslSearchType.value).title})`}</span>], h('i', { class: 'svgtofont-el-arrow-down ' })]),
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
				// 宝塔证书SSL状态
				if (row.cert_ssl_type) return getBtSslStatus(row)
				switch (row.type) {
					case '1':
						let btnGround: any = []
						const spanRender = (className: string, text: string) => <span class={className}>{text}</span>

						const popoverRender = (color: string, text: string) => {
							return (
								<ElPopover trigger="hover" placement="left" popper-class="popover-default" width="300" enterable={false} open-delay={100} close-delay={0}>
									{{
										default: () => (
											<div class="flex items-center p-[2px] whitespace-nowrap">
												1、如填写错误，联系人工可重置订单
												<br />
												2、如验证方式选择错误，联系人工修改验证方式
											</div>
										),
										reference: () => <div style={`color: ${color};`}>{text}</div>,
									}}
								</ElPopover>
							)
						}

						let domainName = row.domainName && row.domainName.length > 0
						if (row.certId == '' && !domainName) {
							btnGround.push(
								<span class="cursor-pointer bt-warn" onClick={() => busCertVerifyInfoDialog(row)}>
									待完善资料
								</span>
							)
						} else if (row.certId == '' && row.domainName.length !== 0) {
							btnGround.push(spanRender('text-warningDark', '待提交'))
						} else if (row.status === 1) {
							switch (row.orderStatus) {
								case 'COMPLETE':
									btnGround.push(spanRender('text-primary', '订单完成'))
									break
								case 'REISSUED':
									btnGround.push(spanRender('text-primary', '已重签'))
									break
								case 'PENDING':
									btnGround.push(popoverRender('orange', '验证中'))
									break
								case 'CANCELLED':
									btnGround.push(spanRender('text-tertiary', '已取消'))
									break
								case 'FAILED':
									btnGround.push(spanRender('text-[var(--el-color-error-light-8)]', '申请失败'))
									break
								case 'EXPIRED':
									btnGround.push(spanRender('text-[var(--el-color-error-light-8)]', '已过期'))
									break
								default:
									btnGround.push(spanRender('text-warningDark', '待验证'))
									break
							}
						} else {
							switch (row.status) {
								case 0:
									btnGround.push(spanRender('text-warningDark', '未支付'))
									break
								case -1:
									btnGround.push(spanRender('text-tertiary', '已取消'))
									break
							}
						}
						const newBtnGround: JSX.Element[] = []
						btnGround.map((item: any, index: number) => {
							newBtnGround.push(item)
							index < btnGround.length - 1 ? newBtnGround.push(<ElDivider direction="vertical" />) : ''
						})
						return newBtnGround
					default:
						return []
				}
			},
		},
		{
			label: '操作',
			align: 'right',
			fixed: 'right',
			width: 280,
			render: (row: any) => {
				// 宝塔证书SSL状态
				if (row.cert_ssl_type) return getBtSslOperate(row)
				// 按钮渲染
				const spanRender = (text: string, onClick: AnyFunction) => (
					<span class="bt-link" onClick={onClick}>
						{text}
					</span>
				)
				const artificial = spanRender('人工服务', () => onlineServiceDialog())
				const _download = spanRender('下载', () => download(row))
				const _deploy = spanRender('部署', () => deploy(row))
				const verify = spanRender('验证', () => certVerifyWay(row.oid, row.cert_ssl_type, row.pid))
				const renewal = spanRender('续签', () => renewalBusCert(row.oid))
				const del = spanRender('删除', () => delEvent(row, false))
				const alarm = spanRender('到期告警', () =>
					alarmDialog({
						...row,
						cancel: () => {},
					})
				)

				let btnGround: any = []
				// 到期告警判断
				const isDisabledAlarm = () => {
					const isEndDayAndStatusInvalid = row.endDay <= 0
					return isEndDayAndStatusInvalid
				}
				if (!isDisabledAlarm()) {
					btnGround.push(alarm)
				}
				// 订单状态小于30天 要显示续签
				if (row.renew)
					btnGround.push(
						<span class="cursor-pointer bt-link" onClick={() => renewalBusCert(row.oid)}>
							续签
						</span>
					)
				if (row.certId == '') {
					if (row.install) btnGround.push(artificial)
					btnGround.push(spanRender('完善资料', () => busCertVerifyInfoDialog(row)))
				} else if (row.status === 1) {
					switch (row.orderStatus) {
						case 'COMPLETE': //申请成功
							if (row.ssl_state === 1) {
								btnGround.push(<span>已部署</span>)
							} else {
								btnGround.push(_deploy)
							}
							if (row.endDay < 30) {
								btnGround.push(renewal) // 续签
							}
							break
						case 'PENDING': //申请中
							if (row.install) btnGround.push(artificial)
							btnGround.push(verify)
							break
						case 'CANCELLED': //已取消
							btnGround.push(<span>无操作</span>)
							break
						case 'FAILED': // 申请失败
							btnGround.push(<span class="cursor-pointer bt-danger">申请失败</span>)
							break
						case 'EXPIRED':
							btnGround.push(_deploy) // 部署
							break
						case 'REISSUED':
							break
						default:
							if (row.install) btnGround.push(artificial)
							btnGround.push(verify)
							// btnGround.push(<span>已过期</span>)
							break
					}
					if (row.download_status) {
						btnGround.push(_download)
					}
					if (row.endDay && row.endDay <= 0) {
						btnGround.push(del)
					}
				} else {
					btnGround.push(<span>无操作</span>)
				}

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
		useRefreshList(sslIsRefresh),
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
