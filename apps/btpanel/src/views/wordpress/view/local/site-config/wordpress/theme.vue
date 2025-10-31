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
import { getThemeList, isSetupConfigMask } from './useController'
import useWPWordpressSettingStore from './useStore'
import { useOperate, useSwitch } from '@/hooks/tools/table/column'
import { ElSwitch, ElTooltip } from 'element-plus'
import useWPLocalStore from '@/views/wordpress/view/local/useStore'
import { wpSetThemeStatus, wpSetThemeUpdate, wpUninstallTheme, wpUpdateTheme } from '@/api/wp'
import { useWpAutoLogin } from '@/views/wordpress/useMethod'
import BtDivider from '@/components/other/bt-divider'

const { isRefreshThemeList } = storeToRefs(useWPWordpressSettingStore())
const { localRow } = storeToRefs(useWPLocalStore())

const { BtOperation } = useOperation({
	options: ref([
		{
			onClick: () => {
				useDialog({
					title: '安装主题',
					area: 90,
					component: () => import('@/views/wordpress/view/local/site-config/wordpress/theme-install.vue'),
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
		return getThemeList(data)
	},
	columns: [
		{
			label: '名称',
			minWidth: 180,
			isCustom: true,
			prop: 'name',
		},
		{
			prop: 'is_theme_activate',
			label: '激活',
			render: (row: any) => {
				if (row.is_theme_activate) {
					return (
						<ElTooltip content="至少有1个主题是激活状态的，在禁用它之前请先激活另一个主题" placement="top">
							<ElSwitch modelValue={row.is_theme_activate} size="small" disabled={row.is_theme_activate} />
						</ElTooltip>
					)
				}
				return (
					<ElSwitch
						modelValue={row.is_theme_activate}
						size="small"
						onChange={(e: boolean | string | number) => {
							useDataHandle({
								loading: '激活中...',
								message: true,
								request: wpSetThemeStatus({ s_id: localRow.value.id, stylesheet: row.stylesheet }),
								success: () => {
									isRefreshThemeList.value = true
								},
							})
						}}
					/>
				)
			},
		},
		useSwitch({
			prop: 'auto_update',
			label: '自动更新',
			size: 'small',
			event: async (val, row) => {
				useDataHandle({
					loading: '设置中...',
					message: true,
					request: wpSetThemeUpdate({ s_id: localRow.value.id, stylesheet: row.stylesheet, enable: val ? 1 : 0 }),
					success: (rdata: any) => {
						if (!rdata.status) {
							row.auto_update = !val
						}
					},
				})
			},
		}),
		useOperate([
			{
				title: '更新',
				render: (row: any) => {
					return row.can_update ? (
						<span
							class="bt-link"
							onClick={() => {
								useConfirm({
									title: `更新【${row.name}】`,
									content: `将从当前版本：${row.version}更新到最新版本：${row.latest_version}，继续吗？`,
									onConfirm: async () => {
										useDataHandle({
											loading: '更新中...',
											message: true,
											request: wpUpdateTheme({ s_id: localRow.value.id, stylesheet: row.stylesheet }),
											success: () => {
												isRefreshThemeList.value = true
											},
										})
									},
								})
							}}>
							更新
							<BtDivider />
						</span>
					) : (
						''
					)
				},
			},
			{
				onClick: (row: any) => {
					console.log(row)
				},
				title: '卸载',
				render: (row: any) => {
					return row.is_theme_activate ? (
						<span class="cursor-not-allowed text-tertiary">卸载</span>
					) : (
						<span
							class="bt-link"
							onClick={() => {
								useConfirm({
									title: `卸载【${row.name}】`,
									content: '确定要卸载此主题吗？',
									onConfirm: async () => {
										useDataHandle({
											loading: '卸载中...',
											message: true,
											request: wpUninstallTheme({ s_id: localRow.value.id, stylesheet: row.stylesheet }),
											success: () => {
												isRefreshThemeList.value = true
											},
										})
									},
								})
							}}>
							卸载
						</span>
					)
				},
			},
		]),
	],
	extension: [useRefreshList(isRefreshThemeList)],
})

defineExpose({ init: refresh })
</script>

<style scoped></style>
