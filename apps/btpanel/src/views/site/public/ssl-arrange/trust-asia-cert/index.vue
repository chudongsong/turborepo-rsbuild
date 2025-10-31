<template>
	<div>
		<el-alert type="error" :closable="false">
			<template #title>
				<span class="text-small h-[4.2rem] leading-[1.8rem]">
					<span> 提示：尊敬的用户您好，感谢您对宝塔免费证书的支持，由于证书签发机制的调整，原一年的免费证书，将缩短至90天。本调整将于2024年4月25日生效。请注意及时续签。 </span>
					<bt-link class="!inline-block" href="https://www.trustasia.com/view-free-ssl-one-year-adjustment-announcement/" target="_blank"> 查看详情 </bt-link>
					。
				</span>
			</template>
		</el-alert>
		<div class="flex flex-col w-full pt-[16px]">
			<bt-table-group>
				<template #header-left>
					<el-button type="primary" @click="applyTrustCert()"> 申请证书 </el-button>
				</template>
				<template #header-right>
					<BtRefresh />
				</template>
				<template #content>
					<BtTable :default-sort="{ prop: 'date', order: 'descending' }" :max-height="sslAlertState ? 280 : 320" />
				</template>
			</bt-table-group>
		</div>
		<bt-help :options="trustAsiaHelpList" list-style="disc" class="ml-[20px]" />
	</div>
</template>

<script setup lang="tsx">
import { useRefresh, useRefreshList, useTable } from '@/hooks/tools'
import type { TrustAsiaTableProps } from '@/types/site.d'
import { formatTime } from '@/utils'
import { useSiteSSLStore } from '../useStore'
import { applyTrustCert, closeTrustCertEvent, deployCertEvent, getTrustAsiaDataList, renderState, trustAsiaHelpList, verifyDomainEvent, deployedId } from './useController'

const { sslAlertState, isRefreshSSL } = useSiteSSLStore()

const { BtTable, BtRefresh, refresh } = useTable({
	request: getTrustAsiaDataList,
	columns: [
		{ label: '域名', prop: 'commonName' },
		{
			// 状态
			label: '到期时间',
			width: 110,
			render: (row: TrustAsiaTableProps, index: number) => formatTime(row.endtime, 'yyyy/MM/dd'),
		},
		{ label: '状态', prop: 'stateName', width: 100, render: renderState },
		{
			label: '操作',
			prop: 'ps',
			width: 200,
			showOverflowTooltip: false,
			align: 'right',
			render: (row: any) => {
				if (row.stateName === '审核已终止') return <span>--</span>
				let btnGround = [
					<span class="bt-link" onClick={() => deployCertEvent(row, false)}>
						部署
					</span>,
				]
				if (row.stateCode === 'WF_DOMAIN_APPROVAL' && row.authDomain !== '') {
					btnGround = [
						<span class="bt-link" onClick={() => verifyDomainEvent(row)}>
							验证域名
						</span>,
						<el-divider direction="vertical" />,
						<span class="bt-link" onClick={() => applyTrustCert(row)}>
							修改域名
						</span>,
					]
				} else if (row.stateCode === 'WF_DOMAIN_APPROVAL' && row.authDomain === '') {
					btnGround = [
						<span class="bt-link" onClick={() => applyTrustCert(row)}>
							填写域名
						</span>,
					]
				} else if (row.partnerOrderId === deployedId.value) {
					btnGround = [
						<span>已部署</span>,
						<bt-divider />,
						<span class="bt-link" onClick={() => closeTrustCertEvent()}>
							关闭
						</span>,
					]
				}
				return btnGround
			},
		},
	],
	extension: [useRefresh(), useRefreshList(isRefreshSSL)],
})

defineExpose({ init: refresh })
</script>

<style scoped></style>
