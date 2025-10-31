<template>
	<div>
		<version-compare />
		<BtTableGroup>
			<template #header-left>
				<BtOperation />
				<bt-button type="primary" @click="editPackageEvent()">添加资源包</bt-button>
				<div class="flex items-center ml-1rem" @click="npsSurveyV2Dialog({ name: '用户管理', type: 35, id: 62 })">
					<i class="svgtofont-desired text-medium mr-[4px]"></i>
					<span class="bt-link">需求反馈</span>
				</div>
			</template>
			<template #header-right>
				<BtTableCategory class="!w-[140px] mr-[10px]" />
				<BtSearch placeholder="请输入资源包名称" class="!w-[270px] mr-[10px]" />
				<BtRefresh />
			</template>
			<template #content><BtTable :min-height="mainHeight" /></template>
			<template #footer-left>
				<BtBatch />
			</template>
			<template #footer-right><BtPage /></template>
		</BtTableGroup>
	</div>
</template>

<script lang="tsx" setup>
import VersionCompare from '@/views/vhost/public/version-compare.vue'
import { useDynamicTable, useRefresh } from '@/hooks/tools'
import { useGlobalStore } from '@/store/global'
import { useOperate } from '@/hooks/tools/table/column'
import { formatTime, getByteUnit } from '@/utils'
import { npsSurveyV2Dialog } from '@/public'

import { usePackageStore } from './useStore'
import { editPackageEvent, getPackageList, removePackageEvent } from './useController'
import type { PackageList } from './types'

const { mainHeight } = useGlobalStore()
const { refreshInfo } = usePackageStore()

const { BtTable, BtSearch, BtRefresh, BtPage, refresh } = useDynamicTable({
	request: (data: any) => {
		return getPackageList(data)
	},
	columns: [
		{ label: '资源包名称', prop: 'package_name', minWidth: 84 },
		{
			label: '网站',
			prop: 'php_start_children',
			minWidth: 80,
			render: (row: PackageList) => {
				return <div>{row.max_site_limit === 0 ? '无限制' : row.max_site_limit}</div>
			},
		},
		{
			label: '磁盘配额',
			prop: 'disk_space_quota',
			minWidth: 100,
			render: (row: PackageList) => {
				return <div>{row.disk_space_quota === 0 ? '无限制' : getByteUnit(row.disk_space_quota, true, 0)}</div>
			},
		},
		{
			label: '月带宽限制',
			prop: 'monthly_bandwidth_limit',
			minWidth: 100,
			render: (row: PackageList) => {
				return <div>{row.monthly_bandwidth_limit === 0 ? '无限制' : getByteUnit(row.monthly_bandwidth_limit, true, 0)}</div>
			},
		},
		{
			label: '备注',
			prop: 'remark',
			minWidth: 80,
			render: (row: PackageList) => {
				if (!row.remark) return '--'
				return row.remark
			},
		},
		{
			label: '创建时间',
			prop: 'create_time',
			minWidth: 140,
			render: (row: PackageList) => {
				return formatTime(row.create_time)
			},
		},
		useOperate([
			{ onClick: editPackageEvent, title: '编辑' },
			{ onClick: removePackageEvent, title: '删除' },
		]),
	],
	extension: [useRefresh()],
})

watch(() => refreshInfo.value, refresh)
</script>
