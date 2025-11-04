<template>
	<div>
		<bt-install-mask v-if="isSetupConfigMask.value">
			<template #content>
				<div class="content-mask">
					<i class="text-warning !text-subtitleLarge svgtofont-el-warning mr-4px"></i>
					<span class="mr-8px">{{ isSetupConfigMask.message }}</span>
				</div>
			</template>
		</bt-install-mask>
		<BtTableGroup>
			<template #header-left>
				<el-button type="primary" class="mr-[12px]" @click="useWpAutoLogin(localRow.id, 'local')">
					<i class="svgtofont-icon-ltd !text-extraLarge text-ltd mr-4px"></i>
					WP管理
				</el-button>
				<BtOperation />
			</template>
			<template #content><BtTable /></template>
		</BtTableGroup>
	</div>
</template>

<script setup lang="tsx">
import { useAllTable, useConfirm, useDataHandle, useDialog, useOperation, useRefreshList } from '@/hooks/tools'
import { getPluginList, isSetupConfigMask } from './useController'
import useWPWordpressSettingStore from './useStore'
import { useOperate, useSwitch } from '@/hooks/tools/table/column'
import BtDivider from '@/components/other/bt-divider'
import useWPLocalStore from '@/views/wordpress/view/local/useStore'
import { wpSetPluginStatus, wpSetPluginUpdate, wpUninstallPlugin, wpUpdatePlugin } from '@/api/wp'
import { useWpAutoLogin } from '@/views/wordpress/useMethod'

const { isRefreshPluginList } = storeToRefs(useWPWordpressSettingStore())
const { localRow } = storeToRefs(useWPLocalStore())

const { BtOperation } = useOperation({
	options: ref([
		{
			onClick: () => {
				useDialog({
					title: '安装插件',
					area: 90,
					component: () => import('@/views/wordpress/view/local/site-config/wordpress/plugin-install.vue'),
				})
			},
			type: 'button',
			label: '安装',
		},
	]),
})

/**
 * @description 获取表格
 */
const { BtTable, BtPage, BtRecommendSearch, BtRefresh, BtColumn, BtBatch, BtTableCategory, BtErrorMask, tableRef, classList, refresh } = useAllTable({
	request: (data: any) => {
		return getPluginList(data)
	},
	columns: [
		{
			label: '名称',
			minWidth: 180,
			isCustom: true,
			prop: 'name',
		},
		useSwitch({
			prop: 'is_plugin_activate',
			label: '激活',
			size: 'small',
			event: async (val, row) => {
				useDataHandle({
					loading: '设置中...',
					message: true,
					request: wpSetPluginStatus({
						s_id: localRow.value.id,
						plugin_file: row.plugin_file,
						activate: val ? 1 : 0,
					}),
					success: (rdata: any) => {
						if (!rdata.status) {
							row.is_plugin_activate = !val
						}
					},
				})
			},
		}),
		useSwitch({
			prop: 'auto_update',
			label: '自动更新',
			size: 'small',
			event: async (val, row) => {
				useDataHandle({
					loading: '设置中...',
					message: true,
					request: wpSetPluginUpdate({
						s_id: localRow.value.id,
						plugin_file: row.plugin_file,
						enable: val ? 1 : 0,
					}),
					success: (rdata: any) => {
						if (!rdata.status) {
							row.is_plugin_activate = !val
						}
					},
				})
			},
		}),
		useOperate(
			[
				{
					title: '更新',
					render: (row: any) => {
						return row.can_update ? (
							<div class="inline-flex items-center">
								<span
									class="bt-link"
									onClick={() => {
										useDataHandle({
											loading: '更新中...',
											message: true,
											request: wpUpdatePlugin({
												s_id: localRow.value.id,
												plugin_file: row.plugin_file,
											}),
											success: (rdata: any) => {
												isRefreshPluginList.value = true
											},
										})
									}}>
									更新
								</span>
								<BtDivider />
							</div>
						) : (
							''
						)
					},
				},
				{
					onClick: (row: any) => {
						useConfirm({
							title: `卸载 【${row.name}】`,
							content: '确定要卸载该插件吗？',
							onConfirm: async () => {
								useDataHandle({
									loading: '卸载中...',
									message: true,
									request: wpUninstallPlugin({ s_id: localRow.value.id, plugin_file: row.plugin_file }),
									success: (rdata: any) => {
										isRefreshPluginList.value = true
									},
								})
							},
						})
					},
					title: '卸载',
				},
			],
			{
				fixed: 'right',
				label: '操作',
				width: 120,
			}
		),
	],
	extension: [useRefreshList(isRefreshPluginList)],
})

defineExpose({ init: refresh })
</script>

<style scoped></style>
