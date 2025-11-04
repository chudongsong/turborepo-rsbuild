<template>
	<BtTableGroup>
		<template #header-left><BtOperation /></template>
		<template #header-right>
			<BtRecommendSearch type="remote-wp" placeholder="请输入域名" class="!w-[270px] mr-[10px]" />
		</template>
		<template #content><BtTable :min-height="mainHeight" /></template>
		<template #footer-left>
			<BtBatch />
		</template>
		<template #footer-right><BtPage /></template>
	</BtTableGroup>
</template>

<script setup lang="tsx">
import { useDialog, useOperation } from '@/hooks/tools'
import { useAllTable, useBatch, useRecommendSearch, useRefreshList } from '@/hooks/tools/table/index'
import { useCheckbox, useOperate } from '@/hooks/tools/table/column'
import { useGlobalStore } from '@/store/global'
import { getWpRemoteListData, useBatchEventHandle } from '@/views/wordpress/view/remote/table-controller'
import { formatTime } from '@/utils'
import { WPRemoteList } from '@/views/wordpress/types'
import { onDel } from './form-controller'
import useWPRemoteStore from './useStore'

const { isRefreshRemoteList } = storeToRefs(useWPRemoteStore())

const { mainHeight } = useGlobalStore()

/**
 * @description 打开 Wordpress 详情
 */
const onShowConfig = (row: WPRemoteList) => {
	return useDialog({
		title: `站点修改【${row.site_url}】 -- 添加时间【${formatTime(row.create_time)}】`,
		area: 55,
		compData: row,
		component: () => import('@/views/wordpress/view/remote/site-config/index.vue'),
	})
}

/**
 * @description 添加 Wordpress
 */
const addWordpress = () => {
	return useDialog({
		title: '添加 Wordpress',
		area: 55,
		compData: getWpRemoteListData,
		component: () => import('@/views/wordpress/view/remote/add-wordpress/index.vue'),
		btn: true, // 显示按钮
	})
}

/**
 * @description 网站登录
 */
const onLoginSite = (row: WPRemoteList) => {
	return useDialog({
		title: 'WP登录',
		area: 42,
		compData: row,
		component: () => import('@/views/wordpress/view/remote/login-site/index.vue'),
	})
}

const { BtOperation } = useOperation({
	options: [
		{
			type: 'button',
			label: '添加 Wordpress',
			active: true,
			onClick: () => addWordpress(),
		},
	],
})

/**
 * @description 批量操作
 */
const useTableBatch = useBatch([{ label: '删除', value: 'delete', event: useBatchEventHandle }])

/**
 * @description 获取表格
 */
const { BtTable, BtPage, BtRecommendSearch, BtRefresh, BtColumn, BtBatch, BtTableCategory, BtErrorMask, tableRef, classList, refresh } = useAllTable({
	request: (data: any) => {
		return getWpRemoteListData(data)
	},
	columns: [
		useCheckbox(),
		{
			label: '网站名',
			minWidth: 180,
			isCustom: true,
			prop: 'site_url',
			render: (row: any) => {
				return (
					<span
						class="bt-link"
						onClick={() => {
							onShowConfig(row)
						}}>
						{row.site_url}
					</span>
				)
			},
		},
		{
			label: 'WP 版本',
			isCustom: true,
			minWidth: 100,
			render: (row: any) => {
				return (
					<span
						class="bt-link"
						onClick={() => {
							onShowConfig(row)
						}}>
						{row.env_info?.wordpress_version ? row.env_info.wordpress_version : '--'}
					</span>
				)
			},
		},
		{
			label: '插件版本',
			isCustom: true,
			minWidth: 100,
			render: (row: any) => {
				return (
					<span
						class="bt-link"
						onClick={() => {
							onShowConfig(row)
						}}>
						{row.env_info?.plugin_version ? row.env_info.plugin_version : '--'}
					</span>
				)
			},
		},
		{
			label: 'PHP版本',
			isCustom: true,
			minWidth: 100,
			render: (row: any) => {
				return (
					<span
						class="bt-link"
						onClick={() => {
							onShowConfig(row)
						}}>
						{row.env_info?.php_version ? row.env_info.php_version : '--'}
					</span>
				)
			},
		},
		{
			label: '创建时间',
			align: 'center',
			render: row => formatTime(row.create_time),
		},
		useOperate([
			{
				onClick: (row: any) => {
					onLoginSite(row)
				},
				title: '登录',
			},
			{
				onClick: (row: any) => {
					onDel(row)
				},
				title: '删除',
			},
		]),
	],
	extension: [useTableBatch, useRecommendSearch('search', { name: 'wp', list: [], showHistory: false, showRecommend: false }), useRefreshList(isRefreshRemoteList)],
})
</script>

<style scoped></style>
