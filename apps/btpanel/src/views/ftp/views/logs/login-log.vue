<template>
	<BtTableGroup>
		<template #header-right>
			<BtSearch type="ftps" placeholder="请输入登录IP/状态/时间" class="!w-[200px] mr-[10px]" />
			<BtRefresh />
		</template>
		<template #content><BtTable :max-height="400" /></template>
		<template #footer-right><BtPage /></template>
	</BtTableGroup>
</template>
<script lang="tsx" setup>
import { useAllTable } from '@/hooks/tools/table'
import { getFtpLoginLogs } from '@ftp/useController'
import { useFtpStore } from '@ftp/useStore'

const { rowData } = useFtpStore()

const { BtSearch, BtRefresh, BtTable, BtPage } = useAllTable({
	request: data =>
		getFtpLoginLogs({
			...data,
			user_name: rowData.value.name,
		}),
	columns: [
		{ width: 120, label: '用户名', prop: 'user' },
		{ label: '登录IP', prop: 'ip' },
		{
			label: '登录状态',
			render: (row: any, index: number) => {
				return <span class={row.status === '登录成功' ? 'text-primary' : 'text-danger'}>{row.status}</span>
			},
		},
		{ label: '登录时间', prop: 'in_time' },
		{ label: '登出时间', prop: 'out_time' },
	],
})
</script>
