<template>
	<div>
		<EnvDetectionMask ref="envRef" @init="refresh" />
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
	</div>
</template>

<script lang="tsx" setup>
import EnvDetectionMask from '@site/public/env-detection-mask/index.vue'
import BtSoftState from '@/components/extension/bt-soft-state/index.vue'
import { useTableCategory } from '@/hooks/business'
import { useAllTable, useBatch, useOperation, useRefreshList } from '@/hooks/tools'
import { useCheckbox, useOperate, usePath, usePs } from '@/hooks/tools/table/column'
import { isUndefined } from '@/utils'
import { openNpsEvent, envRef, classEvent, delGeneralProject, useBatchClassConfig, useBatchDeleteHandle, useBatchSslConfig, useSiteName, useSsl, classList } from '@site/useController'
import { SITE_STORE } from '@site/useStore'
import { openAddHtmlSiteView, openSettingView } from './useController'
import { useGlobalStore } from '@/store/global'
import { SITE_HTML_STORE } from './useStore'

const { mainHeight } = useGlobalStore()
const { getSiteList } = SITE_STORE()
const { activeType, isRefreshList } = storeToRefs(SITE_STORE())

const { pluginInfo } = storeToRefs(SITE_HTML_STORE())

watch(
	envRef,
	val => {
		if (val?.pluginInfo) pluginInfo.value = val.pluginInfo
	},
	{ immediate: true, deep: true }
)

const { BtOperation } = useOperation({
	options: [
		{
			type: 'button',
			label: '添加项目',
			active: true,
			onClick: openAddHtmlSiteView,
		},
		{
			type: 'custom',
			render: () => <BtSoftState class="ml-1rem" isRequest={false} pluginInfo={pluginInfo.value}></BtSoftState>,
		},
	],
})

const useCategory = useTableCategory({
	key: 'type_id',
	name: 'PHP分类',
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

const { BtTable, BtSearch, BtRefresh, BtPage, BtColumn, BtTableCategory, BtBatch, refresh } = useAllTable({
	request: data => {
		const { type_id: type, ...rest } = data
		return getSiteList({
			data: JSON.stringify({
				...rest,
				type_id: isUndefined(type) || type === 'all' ? '' : type,
			}),
		})
	},
	columns: [
		useCheckbox(),
		useSiteName({ onClick: (row: any) => openSettingView(row) }),
		usePath(),
		usePs({ table: 'sites', width: 200 }),
		useSsl({
			onClick: (row: any) => openSettingView(row, 'ssl'),
		}),
		useOperate([
			{ title: '设置', onClick: (row: any) => openSettingView(row) },
			{ title: '删除', onClick: (row: any) => delGeneralProject(row) },
		]),
	],
	extension: [useCategory, useTableBatch, useRefreshList(isRefreshList)],
	empty: () => {
		return (
			<span>
				您的列表为空，您可以
				<span class="bt-link" onClick={openAddHtmlSiteView}>
					添加一个项目
				</span>
			</span>
		)
	},
})

onMounted(() => {
	nextTick(() => {
		import('@site/views/html-model/add-html/index.vue')
		import('@site/views/html-model/setting/index.vue')
	})
})
</script>
