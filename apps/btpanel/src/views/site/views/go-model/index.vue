<template>
	<bt-table-group>
		<template #header-left>
			<BtOperation />
			<div class="flex items-center mx-12px">
				<span class="mr-4px">命令行版本</span>
				<el-select class="!w-[10rem]" placeholder="未设置" v-model="currentVersion" :options="goVersion" @change="setVersion">
					<el-option v-for="(item, index) in goVersion" :key="index" :label="item.label" :value="item.value" />
					<template #footer>
						<div class="flex items-center justify-center py-[.8rem] cursor-pointer" @click="openEnvVersionView('go',getVersionListEvent)">
							<span class="bt-link">前往管理</span>
						</div>
					</template>
				</el-select>
			</div>
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
import { getByteUnit, isUndefined } from '@/utils'
import { useAllTable, useBatch, useOperation, useRefreshList } from '@/hooks/tools'
import { useCheckbox, useOperate, usePath, usePs } from '@/hooks/tools/table/column'
import { openNpsEvent, useSiteName, useSiteStatus, useSsl, useBatchClassConfig, useBatchSslConfig, classEvent, setProjectStatus, delGeneralProject, openProjectGuardianView, openEnvVersionView, classList } from '@site/useController'
import { SITE_STORE } from '@site/useStore'
import { useTableCategory } from '@/hooks/business'
import { openAddGoSite, openSettingView, useBatchEventHandle, currentVersion, goVersion, setVersion, getVersionListEvent } from './useController'
import { useGlobalStore } from '@/store/global'

const { mainHeight } = useGlobalStore()
const { getSiteList, setSiteInfo } = SITE_STORE()
const { activeType, isRefreshList, siteInfo } = storeToRefs(SITE_STORE())

const { BtOperation } = useOperation({
	options: [
		{
			type: 'button',
			label: '添加项目',
			active: true,
			onClick: openAddGoSite,
		},
		{
			type: 'button',
			label: 'SDK版本管理',
			onClick: () => {
				openEnvVersionView('go',getVersionListEvent)
			},
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
	name: 'Go分类',
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
		label: '启用项目',
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
		useCheckbox({ type: 'page', key: 'id' }),
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
			label: 'PID',
			isCustom: false,
			render: (row: any) => {
				if (isUndefined(row.load_info) || Object.keys(row.load_info)?.length === 0) return '--'
				return Object.entries(row.load_info)
					.map(([key, value]) => `${key}`)
					.join(', ')
			},
		},
		{
			label: '监听端口',
			isCustom: false,
			render: (row: any) => {
				if (isUndefined(row.listen) || row.listen?.length === 0) return '--'
				return row.listen?.join(',') || '--'
			},
		},
		{
			label: 'CPU',
			isCustom: false,
			render: (row: any) => {
				if (isUndefined(row.load_info) || Object.keys(row.load_info)?.length === 0) return '--'
				// return row.cpu.toFixed(2) + '%'
				return Object.entries(row.load_info)
					.map(([key, value]: any) => `${value.cpu_percent.toFixed(2)}%`)
					.join(', ')
			},
		},
		{
			label: '内存',
			isCustom: false,
			render: (row: any) => {
				if (isUndefined(row.load_info) || Object.keys(row.load_info)?.length === 0) return '--'
				return Object.entries(row.load_info)
					.map(([key, value]: any) => `${getByteUnit(value.memory_used)}`)
					.join(', ')
			},
		},
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
				<span class="bt-link" onClick={openAddGoSite}>
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
	getVersionListEvent()
	nextTick(() => {
		import('@site/views/go-model/add-go/index.vue')
		import('@site/views/go-model/setting/index.vue')
	})
})
</script>
