<template>
	<div>
		<!-- <bt-install-mask v-if="maskLayer">
			<template #content>
				<div class="content-mask">
					<i class="svgtofont-el-warning text-warning !text-subtitleLarge mr-4px"></i>
					未安装Python版本，
					<bt-link @click="openEnvVersionView('py', refresh)" class="!text-base">点击安装</bt-link>
				</div>
			</template>
		</bt-install-mask> -->
		<bt-table-group>
			<template #header-left>
				<BtOperation />
				<div class="flex items-center mx-12px">
					<span class="mr-4px">命令行版本</span>
					<el-select class="!w-[10rem]" placeholder="未设置" v-model="currentVersion" :options="pyVersion" @change="setPythonVersionEvent">
						<el-option v-for="(item, index) in pyVersion" :key="index" :label="item.label" :value="item.value" />
						<template #footer>
							<div class="flex items-center justify-center py-[.8rem] cursor-pointer" @click="openPythonEnvManageView(getVersionListEvent)">
								<span class="bt-link">前往管理</span>
							</div>
						</template>
					</el-select>
				</div>
				<div class="flex items-center ml-[12px]">
					<bt-link href="https://www.bt.cn/bbs/thread-144409-1-1.html"> Python项目教程 </bt-link>
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
	</div>
</template>

<script lang="tsx" setup>
import { useTableCategory } from '@/hooks/business'
import { useAllTable, useBatch, useOperation, useRefreshList } from '@/hooks/tools'
import { useCheckbox, useOperate, usePath, usePs } from '@/hooks/tools/table/column'
import { useGlobalStore } from '@/store/global'
import { isUndefined, getByteUnit } from '@/utils'
import { openNpsEvent, classEvent, classList, delGeneralProject, openEnvVersionView, setProjectStatus, useBatchClassConfig, useBatchSslConfig, useEndtime, useSiteName, useSiteStatus, useSsl } from '@site/useController'
import { SITE_STORE } from '@site/useStore'
import { maskLayer, checkVersion, openAddPythonSiteView, openPythonEnvManageView, openPythonModule, openPythonTerminal, openSettingView, useBatchEventHandle, currentVersion, pyVersion, setPythonVersionEvent, getVersionListEvent } from './useController'

const { mainHeight } = useGlobalStore()
const { getSiteList, setSiteInfo } = SITE_STORE()
const { activeType, isRefreshList, siteInfo, searchWidth } = storeToRefs(SITE_STORE())

const { BtOperation } = useOperation({
	options: [
		{
			type: 'button',
			label: '添加项目',
			active: true,
			onClick: openAddPythonSiteView,
		},
		// {
		// 	type: 'button',
		// 	label: 'Python版本管理',
		// 	onClick: () => openEnvVersionView('py'),
		// },
		{
			type: 'button',
			label: 'Python环境管理',
			onClick: openPythonEnvManageView,
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
	name: 'Python分类',
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
		useSiteName({ onClick: openSettingView }),
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
				if (isUndefined(row.pids) || row.pids?.length === 0) return '--'
				return row.pids?.join(',') || '--'
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
				if (isUndefined(row.cpu)) return '--'
				return row.cpu.toFixed(2) + '%'
			},
		},
		{
			label: '内存',
			isCustom: false,
			render: (row: any) => {
				if (isUndefined(row.mem)) return '--'
				return getByteUnit(row.mem)
			},
		},
		usePath(),
		useEndtime(),
		usePs({ table: 'sites', width: 200 }),
		useSsl({ onClick: (row: any) => openSettingView(row, 'ssl') }),
		useOperate([
			{ title: '终端', onClick: openPythonTerminal },
			{ title: '设置', onClick: (row: any) => openSettingView(row) },
			{ title: '模块', onClick: (row: any) => openSettingView(row, 'envManager') },
			{
				title: '删除',
				onClick: (row: any) => {
					delGeneralProject(row, activeType.value)
				},
			},
		]),
	],
	extension: [useCategory, useTableBatch],
	empty: () => {
		return (
			<span>
				您的列表为空，您可以
				<span class="bt-link" onClick={openAddPythonSiteView}>
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
	checkVersion()
	getVersionListEvent()
	nextTick(() => {
		import('@site/views/python-model/add-python/index.vue')
		import('@site/views/python-model/setting/index.vue')
	})
})
</script>
