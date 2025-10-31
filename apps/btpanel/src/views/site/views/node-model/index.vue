<template>
	<div>
		<bt-install-mask v-if="maskLayer">
			<template #content>
				<div class="content-mask">
					<i class="svgtofont-el-warning text-warning !text-subtitleLarge mr-4px"></i>
					未安装Node版本管理器，<span class="bt-link" @click="openNodeVersionEvent">点击安装</span>
				</div>
			</template>
		</bt-install-mask>
		<bt-table-group>
			<template #header-left>
				<BtOperation />
				<div class="flex items-center mx-12px">
					<span class="mr-4px">命令行版本</span>
					<el-select class="!w-[10rem]" placeholder="未设置" v-model="currentVersion" :options="nodeVersion" @change="setVersion">
						<el-option v-for="(item, index) in nodeVersion" :key="index" :label="item.label" :value="item.value" />
						<template #footer>
							<div class="flex items-center justify-center py-[.8rem] cursor-pointer" @click="openNodeVersionEvent">
								<span class="bt-link">前往管理</span>
							</div>
						</template>
					</el-select>
				</div>
				<div class="flex items-center ml-1rem" @click="openNpsEvent">
					<i class="svgtofont-desired text-medium"></i>
					<span class="bt-link ml-1">需求反馈</span>
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
	</div>
</template>

<script lang="tsx" setup>
import { checkVariable, getByteUnit, isUndefined } from '@/utils'
import { useAllTable, useBatch, useOperation, useRefreshList } from '@/hooks/tools'
import { useCheckbox, useOperate, usePath, usePs } from '@/hooks/tools/table/column'
import { useSiteName, useSiteStatus, useEndtime, useSsl, useBatchClassConfig, useBatchSslConfig, classEvent, setProjectStatus, classList } from '@site/useController'
import { SITE_STORE } from '@site/useStore'
import { useTableCategory } from '@/hooks/business'
import { maskLayer, nodeVersion, currentVersion, setVersion, getNodeVersionData, openNodeVersionEvent, openAddNodeSite, openPm2View, delProject, openSettingView, useBatchEventHandle } from './useController'
import { useGlobalStore } from '@/store/global'
import { openNpsEvent } from '@site/useController'

const { mainHeight } = useGlobalStore()
const { getSiteList, setSiteInfo } = SITE_STORE()
const { activeType, isRefreshList, siteInfo, searchWidth } = storeToRefs(SITE_STORE())

const { BtOperation } = useOperation({
	options: [
		{
			type: 'button',
			label: '添加项目',
			active: true,
			onClick: () => {
				if (!nodeVersion.value?.length) return openNodeVersionEvent()
				openAddNodeSite()
			},
		},
		{
			type: 'button',
			label: 'Node版本管理器',
			onClick: openNodeVersionEvent,
		},
		{
			type: 'button',
			label: 'PM2监控',
			onClick: openPm2View,
		},
	],
})

const useCategory = useTableCategory({
	key: 'type_id',
	name: 'Node分类',
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
		useCheckbox({ type: 'page', key: 'id' }),
		useSiteName({
			onClick: (row: any) => {
				openSettingView(row)
			},
		}),
		useSiteStatus({
			type: activeType.value,
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
			isCustom: true,
			render: (row: any) => {
				// 判定是否为空
				const obj = checkVariable(row['load_info'], 'object', {})
				if (Object.keys(obj).length == 0) return '--'
				// 获取所有的pid
				let _id = []
				for (var i in row.load_info) {
					if (row.load_info.hasOwnProperty(i)) {
						_id.push(i)
					}
				}
				return _id.join(',')
			},
		},
		{
			label: 'CPU',
			isCustom: false,
			render: (row: any) => {
				const obj = checkVariable(row['load_info'], 'object', {})
				if (Object.keys(obj).length == 0) return '--'
				let _cpu_total = 0
				for (var i in row.load_info) {
					_cpu_total += row.load_info[i]['cpu_percent']
				}
				return _cpu_total.toFixed(2) + '%'
			},
		},
		{
			label: '内存',
			isCustom: false,
			render: (row: any) => {
				const obj = checkVariable(row['load_info'], 'object', {})
				if (Object.keys(obj).length == 0) return '--'
				let _cpu_total = 0
				for (var i in row.load_info) {
					_cpu_total += row.load_info[i]['memory_used']
				}
				return getByteUnit(_cpu_total)
			},
		},
		usePath(),
		useEndtime(),
		usePs({
			table: 'sites',
			width: 200,
		}),
		{
			label: 'Node版本',
			isCustom: true,
			render: (row: any) => {
				return row['project_config']['nodejs_version'] || '--'
			},
		},
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
					delProject(row)
				},
			},
		]),
	],
	extension: [useCategory, useTableBatch],
	empty: () => {
		return (
			<span>
				您的列表为空，您可以
				<span class="bt-link" onClick={openAddNodeSite}>
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
	getNodeVersionData()
	nextTick(() => {
		import('@site/views/node-model/add-node/index.vue')
		import('@site/views/node-model/setting/index.vue')
	})
})
</script>
