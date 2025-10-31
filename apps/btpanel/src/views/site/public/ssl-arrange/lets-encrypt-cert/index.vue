<template>
	<div>
		<bt-table-group>
			<template #header-left>
				<el-button type="primary" @click="applyLetsEncrypt">申请证书</el-button>
			</template>
			<template #header-right>
				<BtRefresh />
			</template>
			<template #content>
				<BtTable :default-sort="{ prop: 'date', order: 'descending' }" :maxHeight="sslAlertState ? 280 : 320" />
			</template>
		</bt-table-group>
		<bt-help :options="helpList" list-style="disc" class="pl-1rem"></bt-help>
	</div>
</template>

<script setup lang="tsx">
import { useRefresh, useRefreshList, useTable } from '@/hooks/tools'
import type { LetsTableProps } from '@site/types.d'

import { useSiteSSLStore } from '../useStore'
import { applyLetsEncrypt, delLetsEvent, deployCertEvent, downloadCertEvent, getLetsDataList, helpList, renderExpire, renderStatus, renewCertEvent, verifyDomainEvent } from './useController'

const { isRefreshLetSSL, sslAlertState } = useSiteSSLStore()

const { BtTable, BtRefresh, refresh } = useTable({
	request: getLetsDataList,
	columns: [
		{
			label: '域名',
			prop: 'domains',
			render: (row: LetsTableProps, index: number) => {
				return <span class="w-full whitespace-pre-line">{row.domains ? row.domains.join('\n') : '--'}</span>
			},
		},
		{ label: '到期时间', prop: 'expires', width: 110, render: renderExpire },
		{
			label: '订单状态',
			prop: 'status',
			width: 80,
			render: renderStatus,
		},
		{
			label: '验证方式',
			prop: 'auth_type',
			width: 80,
			render: (row: LetsTableProps, index: number) => {
				return <span>{row.auth_type === 'dns' ? 'DNS验证' : '文件验证'}</span>
			},
		},
		{
			label: '操作',
			prop: 'ps',
			width: 190,
			showOverflowTooltip: false,
			align: 'right',
			render: (row: LetsTableProps, index: number) => {
				let btnGround: any = []
				if (row.status !== 'invalid') {
					if (row.status !== 'pending') {
						btnGround = [
							<span class="cursor-pointer bt-link" onClick={() => deployCertEvent(row, false)}>
								部署
							</span>,
							<bt-divider />,
							<span class="cursor-pointer bt-link" onClick={() => downloadCertEvent(row)}>
								下载
							</span>,
							<bt-divider />,
							<span class="cursor-pointer bt-link" onClick={() => renewCertEvent(row)}>
								续签
							</span>,
							<bt-divider />,
						]
					} else {
						// 证书没过期时显示验证按钮
						if (row.expires >= new Date().getTime() / 1000)
							btnGround = [
								<span class="cursor-pointer bt-link" onClick={() => verifyDomainEvent(row)}>
									验证
								</span>,
								<bt-divider />,
							]
					}
				}
				btnGround.push(
					<span class="cursor-pointer bt-link" onClick={() => delLetsEvent(row)}>
						删除
					</span>
				)
				return btnGround
			},
		},
	],
	extension: [useRefresh(), useRefreshList(isRefreshLetSSL)],
})

defineExpose({ init: refresh })
</script>

<style scoped></style>
