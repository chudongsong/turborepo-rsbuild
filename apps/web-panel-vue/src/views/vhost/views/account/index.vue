<template>
	<div>
		<version-compare />
		<BtTableGroup>
			<template #header-left>
				<BtOperation />
				<div class="ml-[10px] flex items-center h-[30px] font-bold text-secondary">
					{{ checkedAccountLimit }}，更多信息 <bt-link href="https://www.bt.cn/new/wechat_customer" class="mx-[10px]"><img src="/static/icons/we-com.svg" class="w-[14px] h-[14px]" />联系客服</bt-link>
				</div>
				<div class="flex items-center mr-[10px]" @click="npsSurveyV2Dialog({ name: '用户管理', type: 35, id: 62 })">
					<i class="svgtofont-desired text-medium mr-[4px]"></i>
					<span class="bt-link">需求反馈</span>
				</div>
				<bt-link href="https://www.bt.cn/bbs/thread-141273-1-1.html" class="mr-[10px]">>> 使用文档</bt-link>
			</template>
			<template #header-right>
				<BtSearch placeholder="请输入用户名称" class="!w-[270px] mr-[10px]" />
				<BtRefresh class="mr-[10px]" />
				<BtColumn />
			</template>
			<template #content><BtTable :min-height="mainHeight" /></template>
			<template #footer-right><BtPage /></template>
		</BtTableGroup>
	</div>
</template>

<script setup lang="tsx">
import VersionCompare from '@/views/vhost/public/version-compare.vue'
import { useDynamicTable, useOperation, useRefresh, useColumn } from '@/hooks/tools'
import { useGlobalStore } from '@/store/global'
import { useOperate } from '@/hooks/tools/table/column'
import { editUserEvent, getAccountList, loginPanelEvent, deleteUserEvent, copyLoginInfoEvent, editorStatusEvent, useCategory } from './useController'
import { AccountRow } from '@/api/vhost'
import { getByteUnit } from '@/utils'
import { npsSurveyV2Dialog } from '@/public'
import { useAccountStore } from './useStore'

const { mainHeight } = useGlobalStore()
const { refreshInfo, checkedAccountLimit } = useAccountStore()

const { BtOperation } = useOperation({
	options: [
		{
			type: 'button',
			label: '添加用户',
			active: true,
			onClick: () => editUserEvent(),
		},
	],
})

const { BtTable, BtSearch, BtRefresh, BtPage, BtColumn, BtTableCategory, refresh } = useDynamicTable({
	request: (data: any) => {
		const newData = { rows: data.limit, search_value: data.search, p: data.p, type_id: data.type_id }
		return getAccountList(newData)
	},
	columns: [
		{
			label: '用户名',
			prop: 'username',
			minWidth: 100,
			render: (row: AccountRow) => {
				return (
					<span class="text-primary cursor-pointer" onClick={() => loginPanelEvent(row)}>
						{row.username}
					</span>
				)
			},
		},
		{
			label: '资源包',
			prop: 'package_name',
			isCustom: true,
			minWidth: 100,
		},
		// { label: '邮箱地址', prop: 'email', isCustom: true, minWidth: 120 },
		{
			label: '磁盘配额',
			prop: 'quota',
			minWidth: 100,
			isCustom: true,
			render: (row: AccountRow) => {
				return (
					<span class={row.disk_space_status === 0 ? 'text-error' : ''}>
						{row.disk_space_used === 0 && row.disk_space_quota === 0 ? '-' : getByteUnit(row.disk_space_used, true, 0)} / {row.disk_space_quota === 0 ? '无限制' : getByteUnit(row.disk_space_quota, true, 0)}
					</span>
				)
			},
		},
		{
			label: '带宽',
			prop: 'name',
			minWidth: 100,
			isCustom: true,
			render: (row: AccountRow) => {
				return (
					<span class={row.monthly_bandwidth_status === 0 ? 'text-error' : ''}>
						{getByteUnit(row.monthly_bandwidth_used, true, 0)} / {row.monthly_bandwidth_limit === 0 ? '无限制' : getByteUnit(row.monthly_bandwidth_limit, true, 0)}
					</span>
				)
			},
		},
		{
			label: '状态',
			prop: 'status',
			minWidth: 60,
			isCustom: true,
			render: (row: AccountRow) => {
				const status = new Map([
					[-1, '所有'],
					[0, '停用'],
					[1, '正常'],
					[2, '过期'],
				])
				return (
					<span onClick={() => editorStatusEvent(row)} class={`cursor-pointer ${row.status === 1 || row.status === -1 ? 'text-primary' : 'text-danger'}`}>
						{status.get(row.status)}
					</span>
				)
			},
		},
		{
			label: '过期时间',
			prop: 'expire_date',
			minWidth: 80,
			isCustom: true,
			render: (row: AccountRow) => {
				if (row.expire_date === '0000-00-00') return '永久'
				return row.expire_date
			},
		},
		{
			label: '备注',
			prop: 'remark',
			minWidth: 200,
			isCustom: true,
			render: (row: AccountRow) => {
				if (!row.remark) return '--'
				return row.remark
			},
		},
		{
			label: '登录信息',
			prop: 'info',
			minWidth: 65,
			isCustom: true,
			render: (row: AccountRow) => {
				return (
					<span class="text-primary cursor-pointer" onClick={() => copyLoginInfoEvent(row)}>
						复制
					</span>
				)
			},
		},
		useOperate([
			{ onClick: loginPanelEvent, title: '登录虚拟主机', width: 100 },
			{ onClick: (row: AccountRow) => editUserEvent(row), title: '编辑' },
			{ onClick: deleteUserEvent, title: '删除' },
		]),
	],
	extension: [useRefresh(), useColumn(), useCategory()],
})

watch(() => refreshInfo.value, refresh)
</script>

<style lang=""></style>
