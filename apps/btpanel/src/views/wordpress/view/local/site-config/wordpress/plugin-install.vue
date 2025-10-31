<template>
	<div class="p-[2rem]">
		<BtTableGroup>
			<template #header-right>
				<BtSearch type="local-setting-plugin" placeholder="请输入插件名称" class="!w-[270px] mr-[10px]" />
			</template>
			<template #content><BtTable :max-height="500" /></template>
			<template #footer-right><BtPage /></template>
		</BtTableGroup>
	</div>
</template>

<script setup lang="tsx">
import { Message, useAllTable, useDataHandle, useRecommendSearch, useRefreshList } from '@/hooks/tools'
import useWPWordpressSettingStore from './useStore'
import { getPluginInstallList } from './useController'
import BtRate from '@/components/form/bt-rate'
import { useOperate } from '@/hooks/tools/table/column'
import useWPWordpressLocalStore from '@/views/wordpress/view/local/useStore'
import { setInstallPlugin } from '@/api/wp'

const { localRow } = storeToRefs(useWPWordpressLocalStore())
const { isRefreshPluginInstall, isRefreshPluginList } = storeToRefs(useWPWordpressSettingStore())

/**
 * @description 获取表格
 */
const { BtTable, BtPage, BtRecommendSearch, BtRefresh, BtColumn, BtBatch, BtTableCategory, BtErrorMask, tableRef, classList, refresh, BtSearch } = useAllTable({
	request: (data: any) => {
		return getPluginInstallList(data)
	},
	columns: [
		{
			label: '名称',
			prop: 'name',
			minWidth: 180,
			isCustom: true,
			render: (row: any) => {
				return (
					<span class="flex items-center">
						<img class="w-[25px] h-[25px]" src={row.icons['1x'] ? row.icons['1x'] : row.icons.default} />
						<span class="ml-[5px]">{row.name}</span>
					</span>
				)
			},
		},
		{
			label: '描述',
			width: 200,
			prop: 'short_description',
			showOverflowTooltip: true,
		},
		{
			label: '作者',
			prop: 'author',
			render: (row: any) => <span v-html={row.author}></span>,
		},
		{
			label: 'WP',
			prop: 'requires',
			width: 50,
			render: (row: any) => (row.requires ? row.requires : '--'),
		},
		{
			label: 'PHP',
			prop: 'requires_php',
			render: (row: any) => (row.requires_php ? row.requires_php : '--'),
		},
		{
			label: '等级',
			prop: 'rating',
			width: 140,
			render: (row: any) => {
				const rating = row.rating ? row.rating / 20 : 0
				return (
					<div class="flex items-center">
						<BtRate modelValue={rating} disabled={true} allow-half={true} class="!text-extraLarge" />
					</div>
				)
			},
		},
		useOperate(
			(row: any) => [
				{
					title: row.installed ? '已安装' : '安装',
					render: (row: any) => {
						const isDisabled = (localRow.value.wp_version as string) < row.requires || (localRow.value.php_version as string) < row.requires_php || row.installed
						return row.installed ? (
							<span class={'text-tertiary'} style={'cursor:not-allowed'}>
								已安装
							</span>
						) : (
							<span
								class={'bt-link'}
								style={isDisabled ? 'cursor:not-allowed; color: var(--el-base-tertiary);' : ''}
								onClick={
									isDisabled
										? undefined
										: () => {
												useDataHandle({
													loading: '安装中...',
													request: setInstallPlugin({ s_id: localRow.value.id, slug: row.slug }),
													success: (rdata: any) => {
														if (rdata.status) {
															isRefreshPluginInstall.value = true
															isRefreshPluginList.value = true
															Message.success('安装成功')
														}
													},
												})
										  }
								}>
								安装
							</span>
						)
					},
				},
			],
			{
				label: '操作',
				width: 100,
				fixed: 'right',
			}
		),
	],
	extension: [useRecommendSearch('search', { name: 'local-setting-plugin', list: [] }), useRefreshList(isRefreshPluginInstall)],
})
</script>

<style scoped></style>
