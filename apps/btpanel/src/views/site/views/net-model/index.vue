<template>
	<bt-table-group>
		<template #header-left>
			<BtOperation />
			<div class="flex items-center ml-1rem" @click="openNpsEvent">
				<i class="svgtofont-desired text-medium"></i>
				<span class="bt-link">需求反馈</span>
			</div>
		</template>
		<template #header-right>
			<BtTableCategory class="!w-[200px] mr-[10px]" />
			<BtSearch class="mr-[10px]" placeholder="请输入项目名称或备注" />
			<BtRefresh class="mr-[10px]" />
			<BtColumn />
		</template>
		<template #content>
			<BtTable />
		</template>
		<template #footer-left>
			<BtBatch />
		</template>
		<template #footer-right>
			<BtPage />
		</template>
	</bt-table-group>
</template>

<script lang="tsx" setup>
import { isUndefined } from '@/utils'
import { useAllTable, useBatch, useOperation, useRefreshList } from '@/hooks/tools'
import { useCheckbox, useOperate, usePath, usePs } from '@/hooks/tools/table/column'
import { useSiteName, useSsl, useSiteStatus, useBatchClassConfig, useBatchSslConfig, classEvent, useBatchDeleteHandle, delGeneralProject, setProjectStatus, classList } from '@site/useController'
import { SITE_STORE } from '@site/useStore'
import { useTableCategory } from '@/hooks/business'
import { openAddNetSiteView, openSettingView, openVersionPlugin } from './useController'
import { useGlobalStore } from '@/store/global'
import { openNpsEvent } from '@site/useController'

const { mainHeight } = useGlobalStore()
const { getSiteList, setSiteInfo } = SITE_STORE()
const { activeType, isRefreshList, siteInfo } = storeToRefs(SITE_STORE())

const { BtOperation } = useOperation({
	options: [
		{
			type: 'button',
			label: '添加项目',
			active: true,
			onClick: openAddNetSiteView,
		},
		{
			type: 'button',
			label: '.Net环境管理',
			onClick: openVersionPlugin,
		},
	],
})

const useCategory = useTableCategory({
	key: 'type_id',
	name: 'Net分类',
	options: () => [{ label: '全部分类', value: 'all' }],
	event: classEvent,
	ignore: ['0'],
	field: 'type_name',
})

/**
 * @description 批量操作
 */
const useTableBatch = useBatch([
	useBatchSslConfig(),
	useBatchClassConfig({
		classList: classList,
	}),
	{
		label: '删除项目',
		value: 'delete',
		event: useBatchDeleteHandle,
	},
])

const { BtTable, BtPage, BtRefresh, BtSearch, BtColumn, BtBatch, BtTableCategory, refresh, config } = useAllTable({
	request: data => {
		const { type_id: type, ...rest } = data
		return getSiteList({
			...rest,
			type_id: isUndefined(type) || type === 'all' ? '' : type,
			table: 'sites',
		})
	},
	columns: [
		useCheckbox(),
		useSiteName({
			onClick: (row: any) => {
				openSettingView(row)
			},
		}),
		useSiteStatus({
			onClick: (row: any, modules?: string) => {
				if (modules === 'setting') {
					openSettingView(row, 'state')
					return
				}
				const status = row.run ? 'stop' : 'start'
				setProjectStatus(row, modules === 'restart' ? modules : status)
			},
		}),
		usePath(),
		usePs({
			table: 'sites',
			width: 200,
		}),
		useSsl({
			onClick: (row: any) => {
				openSettingView(row, 'ssl')
			},
		}),
		useOperate([
			{
				title: '设置',
				onClick: (row: any) => {
					openSettingView(row)
				},
			},
			{
				title: '删除',
				onClick: (row: any) => {
					delGeneralProject(row)
				},
			},
		]),
	],
	extension: [useCategory, useTableBatch],
	empty: () => {
		return (
			<span>
				您的列表为空，您可以
				<span class="bt-link" onClick={openAddNetSiteView}>
					添加一个项目
				</span>
			</span>
		)
	},
})

watch(isRefreshList, async val => {
	console.log('isRefreshList', val)
	if (val) {
		await refresh()
		if (siteInfo.value?.name) {
			const items = config.data.find((item: any) => item.name === siteInfo.value.name)
			items && setSiteInfo(items)
		}
		isRefreshList.value = false
	}
})

onMounted(() => {
	nextTick(() => {
		import('@site/views/net-model/add-net/index.vue')
		import('@site/views/net-model/setting/index.vue')
	})
})
</script>
