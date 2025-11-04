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
			<BtTable>
				<template #empty> 您的列表为空，您可以添加一个项目 </template>
			</BtTable>
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
import { useTableCategory } from '@/hooks/business'
import { useAllTable, useBatch, useEmpty, useOperation, useRefreshList } from '@/hooks/tools'
import { useCheckbox, useOperate, usePath, usePs } from '@/hooks/tools/table/column'
import { useGlobalStore } from '@/store/global'
import { checkVariable, isUndefined } from '@/utils'
import { classEvent, classList, openProjectGuardianView, setProjectStatus, useBatchClassConfig, useBatchSslConfig, useEndtime, useSiteName, useSiteStatus, useSsl } from '@site/useController'
import { SITE_STORE } from '@site/useStore'
import { delProjectEvent, openAddOtherSiteView, openSettingView, useBatchEventHandle } from './useController'
import { openNpsEvent } from '@site/useController'

const { mainHeight } = useGlobalStore()
const { getSiteList, setSiteInfo } = SITE_STORE()
const { isRefreshList, siteInfo } = storeToRefs(SITE_STORE())

const { BtOperation } = useOperation({
	options: [
		{
			type: 'button',
			label: '添加项目',
			active: true,
			onClick: openAddOtherSiteView,
		},
		// {
		// 	type: 'button',
		// 	label: '项目守护隔离时间',
		// 	onClick: openProjectGuardianView,
		// },
	],
})

const useCategory = useTableCategory({
	key: 'type_id',
	name: 'Other分类',
	options: () => [{ label: '全部分类', value: 'all' }],
	event: classEvent,
	ignore: ['0'],
	field: 'type_name',
})

/**
 * @description 批量操作
 */
const useTableBatch = useBatch([
	{
		label: '启动项目',
		value: 'start',
		event: useBatchEventHandle,
	},
	{
		label: '停用项目',
		value: 'stop',
		event: useBatchEventHandle,
	},
	{
		label: '重启项目',
		value: 'restart',
		event: useBatchEventHandle,
	},
	useBatchSslConfig(),
	useBatchClassConfig({
		classList: classList,
	}),
	{
		label: '删除项目',
		value: 'delete',
		event: useBatchEventHandle,
	},
])

const { BtTable, BtPage, BtRefresh, BtSearch, BtColumn, BtBatch, BtTableCategory, refresh, config } = useAllTable({
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
		{
			label: '运行端口',
			isCustom: true,
			render: (row: any) => {
				const port = checkVariable(row.listen, 'array', [])
				return port.length == 0 ? '--' : port.join('、')
			},
		},
		usePath(),
		useEndtime(),
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
			{ title: '设置', onClick: (row: any) => openSettingView(row) },
			{ title: '删除', onClick: delProjectEvent },
		]),
	],
	extension: [useCategory, useTableBatch],
	empty: () => {
		return (
			<span>
				您的列表为空，您可以
				<span class="bt-link" onClick={openAddOtherSiteView}>
					添加一个项目
				</span>
			</span>
		)
	},
})

watch(isRefreshList, async val => {
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
	// setTimeout(() => {
	//   openSettingView(ref.value.getTable().data[0]);
	// }, 1000);
})
</script>
