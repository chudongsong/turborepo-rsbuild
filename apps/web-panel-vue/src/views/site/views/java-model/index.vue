<template>
	<bt-table-group>
		<template #header-left>
			<BtOperation />
			<div class="flex items-center ml-[12px]">
				<bt-link href="https://www.bt.cn/bbs/thread-132714-1-1.html">Java项目教程</bt-link>
				<i class="svgtofont-el-link text-primary text-medium ml-[4px]"></i>
			</div>
			<div class="flex items-center ml-1rem <xl:hidden" @click="openNpsEvent">
				<i class="svgtofont-desired text-medium"></i>
				<span class="bt-link">需求反馈</span>
			</div>
		</template>
		<template #header-right>
			<BtTableCategory class="!w-[140px] mr-[10px]" />
			<BtSearch class="mr-[10px]" placeholder="请输入项目名称或备注" :class="`!w-[${searchWidth}px]`" />
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
import { checkVariable, getByteUnit, isObject, isUndefined } from '@/utils'
import { useAllTable, useBatch, useOperation, useRefreshList } from '@/hooks/tools'
import { useCheckbox, useOperate, usePath, usePs } from '@/hooks/tools/table/column'
import { useSiteName, useEndtime, useSsl, useSiteStatus, useBatchClassConfig, useBatchSslConfig, classEvent, setProjectStatus, delGeneralProject, openProjectGuardianView, classList } from '@site/useController'
import { SITE_STORE } from '@site/useStore'
import { useTableCategory } from '@/hooks/business'
import { openAddJavaView, openJdkView, openVulScanView, openProjectGroupView, openSettingView, useBatchEventHandle, repairEvent } from './useController'
import { useGlobalStore } from '@/store/global'
import { openNpsEvent } from '@site/useController'

const { mainHeight, enterpriseRec } = useGlobalStore()
const { getSiteList } = SITE_STORE()
const { activeType, isRefreshList, searchWidth } = storeToRefs(SITE_STORE())

const { BtOperation } = useOperation({
	options: [
		{
			type: 'button',
			label: '添加项目',
			active: true,
			onClick: openAddJavaView,
		},
		...(enterpriseRec.value
			? [
					{
						type: 'button',
						label: '漏洞扫描',
						onClick: openVulScanView,
					},
			  ]
			: []),
		{
			type: 'dropdown',
			label: 'Java环境管理',
			onClick: () => openJdkView(),
			options: [
				{
					label: 'JDK管理',
					onClick: () => openJdkView('jdkSettings'),
				},
				{
					label: 'Tomcat管理',
					onClick: () => openJdkView('newTomCat'),
				},
			],
		},
		{
			type: 'button',
			label: '项目组',
			onClick: openProjectGroupView,
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
	name: 'Java分类',
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

const { BtTable, BtPage, BtRefresh, BtSearch, BtColumn, BtBatch, BtTableCategory, refresh } = useAllTable({
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
			type: activeType.value,
			onClick: (row: any) => {
				openSettingView(row)
			},
		}),
		{
			label: '项目PID',
			isCustom: true,
			render: (row: any) => {
				return row.pid ? row.pid : '--'
			},
		},
		useSiteStatus({
			type: activeType.value,
			prop: 'pid',
			onClick: (row: any, modules?: string) => {
				if (modules === 'setting') {
					openSettingView(row, 'state')
					return
				}
				const status = row.pid !== null ? 'stop' : 'start'
				setProjectStatus(row, modules === 'restart' ? modules : status)
			},
		}),
		{
			label: '端口',
			isCustom: true,
			render: (row: any) => (checkVariable(row.listen, 'array', []).length ? row.listen.join(',') : '--'),
		},
		{
			label: 'CPU / 内存',
			isCustom: false,
			width: 200,
			render: (row: any) => {
				return (!isObject(row['pid_info']) ? '--' : row.pid_info['cpu_percent'].toFixed(2)) + '%' + ' / ' + (!isObject(row.pid_info) ? '--' : getByteUnit(row.pid_info['memory_used']))
			},
		},
		usePath(),
		useEndtime(),
		usePs({ table: 'sites', width: 200 }),
		useSsl({
			onClick: (row: any) => {
				openSettingView(row, 'ssl')
			},
		}),
		useOperate([
			{
				isHide: (row: any) => !row['server_config_error'],
				onClick: repairEvent,
				title: '修复',
			},
			,
			{
				title: '设置',
				onClick: (row: any) => {
					openSettingView(row)
				},
			},
			{
				title: '删除',
				onClick: (row: any) => {
					delGeneralProject(row, activeType.value)
				},
			},
		]),
	],
	extension: [useCategory, useTableBatch, useRefreshList(isRefreshList)],
	empty: () => {
		return (
			<span>
				您的列表为空，您可以
				<span class="bt-link" onClick={openAddJavaView}>
					添加一个项目
				</span>
			</span>
		)
	},
})

onMounted(() => {
	nextTick(() => {
		import('@site/views/java-model/add-java/index.vue')
		import('@site/views/java-model/setting/index.vue')
	})
})
</script>
