<template>
	<div class="p-[2rem]">
		<BtTableGroup>
			<template #header-left>
				<div class="flex flex-col">
					<!-- <div class="flex items-center">
						<ElButton :disabled="!config.data.length" type="primary" size="default" @click="changeMigrateSite">迁移站点</ElButton>
						<span v-if="!config.data.length" class="ml-[1rem]">没有可以从网站迁移的WordPress</span>
					</div> -->
					<div class="text-secondary">* 迁移后无法将WordPress网站恢复到网站</div>
				</div>
			</template>
			<template #header-right>
				<BtRecommendSearch type="remote-wp" placeholder="请输入域名" class="!w-[270px] mr-[10px]" />
			</template>
			<template #content><BtTable :min-height="200" /></template>
		</BtTableGroup>
		<bt-help :options="[{ content: '迁移后，您将能够在WP工具包中管理WordPress网站，但是您将无法继续在网站中管理WordPress网站！' }]" style="list-style: disc"></bt-help>
	</div>
</template>

<script setup lang="tsx">
import { useAllTable, useDataHandle, useRefreshList } from '@/hooks/tools'
import { changeMigrateSite, getMigrateSiteList } from './useController'
import useWPLocalStore from '@/views/wordpress/view/local/useStore'
import { useOperate } from '@/hooks/tools/table/column'
import { title } from 'process'
import { migrateSiteToWptoolkit } from '@/api/wp'
import { RequestProps } from '@/hooks/tools/message/types'

const { isRefreshMigrateSiteList } = storeToRefs(useWPLocalStore())

/**
 * @description 获取表格
 */
const { BtTable, BtPage, BtRecommendSearch, BtRefresh, BtColumn, BtBatch, BtTableCategory, BtErrorMask, tableRef, classList, refresh, config } = useAllTable({
	request: (data: any) => {
		return getMigrateSiteList(data)
	},
	columns: [
		{
			label: '网站名',
			minWidth: 180,
			isCustom: true,
			prop: 'name',
		},
		useOperate([
			{
				title: '迁移站点',
				width: 100,
				onClick: (row: any) => {
					useDataHandle({
						loading: '迁移中，请稍候...',
						message: true,
						request: migrateSiteToWptoolkit({ site_id: row.id }),
						success: (rdata: RequestProps) => {
							if (rdata.status) {
								isRefreshMigrateSiteList.value = true
							}
						},
					})
				},
			},
		]),
	],
	extension: [useRefreshList(isRefreshMigrateSiteList)],
})
</script>

<style scoped></style>
