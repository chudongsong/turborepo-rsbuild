<template>
	<div class="h-full">
		<div class="recommendList">
			<div v-for="(item, index) in recommendList" :key="index" :class="`${index === 6 ? 'w-[22rem]' : 'w-[14rem]'} recomItem`">
				<i class="svgtofont-el-check font-bold text-[#ff8d00] text-medium"></i>
				<span class="text-small ml-[8px] text-stroke-primary">
					{{ item }}
				</span>
			</div>
		</div>
		<div class="flex flex-col w-full pt-[16px]">
			<bt-table-group>
				<template #header-left>
					<div class="flex items-center">
						<el-button type="primary" @click="applyBusSslEvent"> 申请证书 </el-button>
						<CustomerPopover :placement="'right'">
							<div class="flex items-center">
								<bt-image :src="`/static/icons/we-com.svg`" class="mx-[4px] w-2rem h-2rem" :all="true" />
								<span class="bt-link">售前客服</span>
							</div>
						</CustomerPopover>
					</div>
				</template>
				<template #header-right>
					<BtRefresh />
				</template>
				<template #content>
					<BtTable :max-height="sslAlertState ? 320 : 380" @wheel="removeTips" />
				</template>
			</bt-table-group>
		</div>
		<bt-help :options="busSslHelp" listStyle="disc" />
	</div>
</template>

<script setup lang="tsx">
import { useRefresh, useRefreshList, useTable } from '@/hooks/tools'
import type { BusinessTableProps } from '@site/types.d'
import { ElPopover } from 'element-plus'
import { applyBusSslEvent, renewalBusCertEvent } from '../useController'
import { busSslHelp, getBtSslOperate, buyArtificialService, certVerifyWayEvent, downloadBusSslEvent, getCertBusinessList, openBusCertVerifyInfoView, recommendList, renderEndDate, setBusSslDeploy, submitCertInfo, getBtSslStatus } from './useCertController'
import { onlineServiceDialog } from '@/public'
import { useSiteSSLStore } from '../useStore'
import { useThrottleFn } from '@vueuse/core'
import CustomerPopover from './customer-popover.vue'

const { sslAlertState, isRefreshSSL } = useSiteSSLStore()

const { BtTable, BtRefresh, refresh } = useTable({
	request: getCertBusinessList as any,
	columns: [
		{
			label: '域名',
			prop: 'domainName',
			width: 120,
			render: (row: BusinessTableProps, index: number) => {
				return <span class="w-full whitespace-pre-line">{row.domainName ? row.domainName.join('、') : '--'}</span>
			},
		},
		{ label: '证书类型', prop: 'title', showOverflowTooltip: true },
		{ label: '到期时间', width: 100, render: renderEndDate, showOverflowTooltip: true },
		{
			label: '状态',
			prop: 'expire',
			width: 160,
			showOverflowTooltip: false,
			render: (row: BusinessTableProps, index: number) => {
				const btnGround = []
				const spanRender = (color: string, text: string) => <span style={`color: ${color};`}>{text}</span>
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
				const troub = (
					<ElPopover placement="bottom-end" width="400" popper-class="white-theme" trigger="click">
						{{
							default: () => (
								<div class="bus-ssl-popover">
									<div class="ssl-popover-item">
										<span class="ssl-popover-title">自行排查</span>
										<p>以图文的形式，一步步教您验证并部署商业SSL</p>
										<a class="bt-link" href="https://www.bt.cn/bbs/thread-85379-1-1.html" target="_blank">
											如何验证商用证书?
										</a>
									</div>
									<div class="ssl-popover-item">
										<span class="ssl-popover-title">购买人工</span>
										<p>不会部署?人工客服帮你全程部署，不成功可退款</p>
										<el-button size="small" type="primary" onClick={() => buyArtificialService(row)}>
											购买人工
										</el-button>
									</div>
								</div>
							),
							reference: () => <span class="bt-link">排查方法?</span>,
						}}
					</ElPopover>
				)
				// 宝塔证书SSL状态
				if (row.cert_ssl_type) return getBtSslStatus(row)

				let domainName = row.domainName && row.domainName.length > 0
				if (row.certId == '' && !domainName) {
					btnGround.push(
						<span class="bt-warn" onClick={() => openBusCertVerifyInfoView(row)}>
							待完善资料
						</span>
					)
					btnGround.push(troub)
				} else if (row.certId == '' && row.domainName.length !== 0) {
					btnGround.push(<span class="bt-warn">待提交</span>)
				} else if (row.status === 1) {
					switch (row.orderStatus) {
						case 'COMPLETE':
							btnGround.push(spanRender('primary', '订单完成'))
							break
						case 'PENDING':
							// btnGround.push(spanRender('orange', '验证中'))
							// btnGround.push(troub)
							btnGround.push(popoverRender('orange', '验证中'))
							break
						case 'CANCELLED':
							btnGround.push(spanRender('medium', '已取消'))
							break
						case 'REISSUED':
							btnGround.push(spanRender('primary', '已重签'))
							break
						case 'FAILED':
							btnGround.push(spanRender('danger', '申请失败'))
							break
						case 'EXPIRED':
							btnGround.push(spanRender('medium', '已过期'))
							break
						default:
							btnGround.push(spanRender('orange', '待验证'))
							break
					}
				} else {
					switch (row.status) {
						case 0:
							btnGround.push(spanRender('orange', '未支付'))
							break
						case -1:
							btnGround.push(spanRender('medium', '已取消'))
							break
					}
				}
				const newBtnGround: JSX.Element[] = []
				btnGround.map((item, index) => {
					newBtnGround.push(item)
					index < btnGround.length - 1 ? newBtnGround.push(<bt-divider />) : ''
				})
				return newBtnGround
			},
		},
		{
			label: '操作',
			prop: 'ps',
			width: 170,
			align: 'right',
			render: (row: BusinessTableProps, index: number) => {
				// 宝塔证书SSL状态
				if (row.cert_ssl_type) return getBtSslOperate(row)
				// 按钮渲染
				const spanRender = (text: string, onClick: AnyFunction) => (
					<span class="bt-link" onClick={onClick}>
						{text}
					</span>
				)
				const artificial = spanRender('人工服务', () => onlineServiceDialog())
				const download = spanRender('下载', () => downloadBusSslEvent(row))
				const deploy = spanRender('部署', () => setBusSslDeploy(row))
				const verify = spanRender('验证', () => certVerifyWayEvent(row.oid, row.cert_ssl_type, row.pid))
				const renewal = spanRender('续签', () => renewalBusCertEvent(row.oid))

				const btnGround = []

				const domainName = row.domainName && row.domainName.length > 0
				if (row.certId == '' && !domainName) {
					if (row.install) btnGround.push(artificial) // 人工服务
					btnGround.push(spanRender('完善资料', () => openBusCertVerifyInfoView(row)))
				} else if (row.certId == '' && row.domainName.length !== 0) {
					btnGround.push(spanRender('提交', () => submitCertInfo(row)))
				} else if (row.status === 1) {
					switch (row.orderStatus) {
						case 'COMPLETE': //申请成功
							if (row.ssl_state === 1) {
								btnGround.push(<span>已部署</span>)
							} else {
								btnGround.push(deploy) // 部署
							}
							if (row.endDay < 30) {
								btnGround.push(renewal) // 续签
							}

							btnGround.push(download) // 下载
							break
						case 'PENDING': //申请中
							if (row.install) btnGround.push(artificial)
							btnGround.push(verify) // 验证
							break
						case 'CANCELLED': //已取消
							btnGround.push(<span>无操作</span>)
							break
						case 'FAILED': // 申请失败
							btnGround.push(<span class="bt-danger cursor-default">申请失败</span>)
							break
						case 'EXPIRED':
							btnGround.push(deploy) // 部署
							btnGround.push(download) // 下载
							break
						case 'REISSUED':
							break
						default:
							if (row.install) btnGround.push(artificial)
							btnGround.push(verify) // 验证
							// btnGround.push(<span>已过期</span>)
							break
					}
				} else {
					btnGround.push(<span>无操作</span>)
				}
				const newBtnGround: JSX.Element[] = []
				btnGround.map((item, index) => {
					newBtnGround.push(item)
					index < btnGround.length - 1 ? newBtnGround.push(<bt-divider />) : ''
				})
				return newBtnGround
			},
		},
	],
	extension: [useRefresh(), useRefreshList(isRefreshSSL)],
})

// 移除提示（解决排除方法popover随滚动错位问题）
const removeTips = useThrottleFn(() => {
	const con = document.querySelector('#pane-busSslList')
	if (con) {
		con.click() // 触发点击事件，隐藏popover
	}
}, 1000)

defineExpose({ init: refresh })
</script>

<style scoped>
.recommendList {
	@apply flex flex-row flex-wrap px-[2rem] py-[1rem] rounded-base text-small;
	background-color: var(--el-color-primary-light-9);
	border: 1px solid var(--el-color-primary-light-8);
	color: var(--el-color-primary-dark-2);
	.recomItem {
		@apply h-[2.5rem] lining-[2.5rem] flex items-center;
	}
}

:deep(.el-table .el-popover__reference-wrapper) {
	@apply inline-block;
}
</style>

<style lang="css">
.bus-ssl-popover {
	@apply flex flex-row py-[8px] text-medium;
}
.ssl-popover-item {
	@apply flex-1 px-[8px];
}
.ssl-popover-title {
	@apply text-base font-bold text-primary;
}
.el-popover.white-theme {
	background-color: var(--el-color-white) !important;
	box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1) !important;
}
.el-popover.white-theme .popper__arrow {
	border-bottom-color: var(--el-color-white) !important;
}
.el-popover.white-theme .popper__arrow::after {
	border-bottom-color: var(--el-color-white) !important;
}

.error .el-table--border .el-table__cell {
	border-right: 1px solid var(--el-fill-color-dark) !important;
}
</style>
