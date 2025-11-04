<template>
	<div class="p-[16px]">
		<BtTable />
	</div>
</template>

<script setup lang="tsx">
import { getDnsDomainData, syncDnsDomain } from '@/api/ssl'
import { useAllTable, useDataHandle } from '@/hooks/tools'
import { getSslStore } from '@ssl/useStore'

const {
	refs: { isRefreshDomainList },
} = getSslStore()

const props = defineProps({
	compData: {
		type: Object,
		default: () => ({}),
	},
})

const { row } = toRefs(props.compData)

const requestData = async (params: { p: number; search: string; limit: number }) => {
	try {
		const { data } = await getDnsDomainData({
			fun_name: 'get_domain_list',
			dns_id: row.value.id,
		})
		return {
			data: data.data,
			total: data.total,
		}
	} catch (error) {
		return {
			data: [],
			total: 0,
		}
	}
}

const { BtTable, BtPage, BtRefresh, BtTableCategory, BtRecommendSearch, BtColumn, BtBatch, BtErrorMask, refresh } = useAllTable({
	request: requestData,
	columns: [
		{
			label: '域名',
			prop: 'name',
		},
		{
			label: '操作',
			align: 'right',
			width: 55,
			render: (row: any) => {
				return (
					<span class={row.sync ? 'text-primary cursor-pointer' : 'text-tertiary cursor-not-allowed'} onClick={() => row.sync && syncDomain(row)}>
						{row.sync ? '同步' : '已同步'}
					</span>
				)
			},
		},
	],
})

const syncDomain = async (item: any) => {
	useDataHandle({
		loading: '同步中...',
		request: syncDnsDomain({
			dns_id: row.value.id,
			domain_name: item.name,
		}),
		message: true,
		success: () => {
			refresh()
			isRefreshDomainList.value = true
		},
	})
}
</script>

<style scoped></style>
