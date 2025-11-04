<template>
	<div class="">
		<EnvDetectionMask ref="envRef" @init="refresh" />
		<bt-table-group>
			<template #header-left>
				<BtOperation />
				<div class="flex items-center ml-1rem">
					<div class="flex items-center" @click="NPSDialog">
						<i class="svgtofont-desired text-medium"></i>
						<span class="bt-link">需求反馈</span>
					</div>
					<bt-link href="https://www.bt.cn/bbs/thread-140664-1-1.html" class="ml-10px">>>使用帮助</bt-link>
				</div>
			</template>
			<template #header-right>
				<BtTableCategory class="!w-[160px] mr-[10px]" />
				<BtSearch class="mr-[10px] !w-[26rem]" placeholder="请输入项目名称或备注" />
				<BtRefresh class="mr-[10px]" />
				<BtColumn />
			</template>
			<template #content>
				<BtTable :max-height="mainHeight" />
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
import { getDockerStore } from '@docker/useStore'
import { DOCKER_SITE_STORE } from './useStore'
import { openPathEvent } from '@table/event'
import { classEvent, useBatchClassConfig, useEndtime, useSiteName, useSiteStatus, useSsl, useBatchEventHandle, getNginxStatus, createSite, siteEnv, openCommonSettingsDialog, openSettingView, openPlugin } from './useController'
import { NPSDialog } from '@docker/useMethods'

import type { DockerSiteTableRowProps } from '@docker/types'

import BtSoftState from '@/components/extension/bt-soft-state/index.vue'
import EnvDetectionMask from '@docker/views/docker-site/env-mask/index.vue'
import { ElDropdown, ElDropdownItem, ElDropdownMenu } from 'element-plus'

const { mainHeight } = useGlobalStore()
const { getDockerSiteList, setDockerSiteStatus, setDockerSiteRemark, delDockerSite, resetData } = DOCKER_SITE_STORE()
const {
	refs: { isRefreshSiteList },
} = getDockerStore()
const { pluginInfo, classList, statusFilterKey } = storeToRefs(DOCKER_SITE_STORE())

const { BtOperation } = useOperation({
	options: [
		{
			type: 'button',
			label: '创建',
			active: true,
			onClick: () => createSite(),
		},
		{
			type: 'button',
			label: '运行环境',
			onClick: () => siteEnv(),
		},
		{
			type: 'button',
			label: '常用设置',
			onClick: () => openCommonSettingsDialog(),
		},
		{
			type: 'custom',
			render: () => <BtSoftState style="margin-left:1.2rem;" isRequest={false} pluginInfo={pluginInfo.value}></BtSoftState>,
		},
	],
})

/**
 * @description 批量操作
 */
const useTableBatch = useBatch([
	useBatchClassConfig({
		callback: () => {},
		classList: classList,
	}),
	{
		label: '删除项目',
		value: 'delete',
		event: useBatchEventHandle,
	},
])

const useCategory = useTableCategory({
	key: 'classify',
	name: 'Docker分类',
	options: () => [{ label: '全部分类', value: 'all' }],
	event: classEvent,
	ignore: ['0', '-2'],
	field: 'name',
})

const { BtTable, BtPage, BtRefresh, BtSearch, BtColumn, BtBatch, BtTableCategory, refresh } = useAllTable({
	request: data => {
		return getDockerSiteList({
			p: data.p || 1,
			row: data.limit || 20,
			query: data.search || '',
			...(data.classify && data.classify !== 'all' ? { classify: data.classify } : {}),
			...(statusFilterKey.value !== 'all' ? { type: statusFilterKey.value } : {}),
		})
	},
	columns: [
		useCheckbox(),
		useSiteName({ onClick: openSettingView, openPlugin }),
		{
			label: '类型',
			prop: 'type',
			minWidth: 90,
			renderHeader() {
				const menu: any[] = [
					{ title: '全部', key: 'all' },
					{ title: 'JAVA', key: 'java' },
					{ title: 'Go', key: 'go' },
					{ title: 'PHP', key: 'php' },
					{ title: 'Python', key: 'python' },
					{ title: '反向代理', key: 'proxy' },
					{ title: 'Docker应用', key: 'app' },
				]
				return h('div', { class: 'flex items-center flex-nowrap' }, [
					'',
					h(
						ElDropdown,
						{
							onCommand: (key: string) => {
								statusFilterKey.value = key
								refresh()
							},
						},
						{
							default: () =>
								h('span', { class: 'text-small flex items-center' }, [
									[
										<span class="status-header-text leading-[1.5] whitespace-nowrap">
											类型
											{statusFilterKey.value === 'all' ? '' : `(${menu.find((items: any) => items.key === statusFilterKey.value).title})`}
										</span>,
									],
									h('i', { class: 'svgtofont-el-arrow-down ' }),
								]),
							dropdown: () => (
								<ElDropdownMenu>
									{menu.map(item => (
										<ElDropdownItem command={item.key}>{item.title}</ElDropdownItem>
									))}
								</ElDropdownMenu>
							),
						}
					),
				])
			},
		},
		useSiteStatus({
			prop: 'status',
			onClick: (row: DockerSiteTableRowProps) => {
				const status = row.status === '1' ? 0 : 1
				setDockerSiteStatus({ status, id: row.id, site_name: row.name, edate: row.edate })
			},
			onFilterEvent: (key: string) => {
				statusFilterKey.value = key
				refresh()
			},
		}),
		// usePath(),
		{
			label: '根目录', // 路径
			prop: 'path',
			minWidth: 200,
			isCustom: true,
			render: row => {
				return (
					<div>
						<span class="w-full whitespace-pre-line inline-block bt-link leading-[16px]" onClick={() => openPathEvent(row, 'path')} title={'点击打开目录'}>
							{row.path}
						</span>
					</div>
				)
			},
		},
		useEndtime(),
		usePs({
			request: (row: DockerSiteTableRowProps, remark: string) => {
				setDockerSiteRemark({ remark, id: row.id, site_name: row.name })
			},
			prop: 'remark',
			width: 200,
		}),
		useSsl({ onClick: (row: DockerSiteTableRowProps) => openSettingView(row, 'ssl') }),
		useOperate([
			{
				onClick: (row: any) => {
					openPlugin(row, 'monitor-setting')
				},
				title: '统计',
			},
			{
				onClick: (row: any) => {
					openPlugin(row, 'bt_waf')
				},
				title: 'WAF',
			},
			// { title: '终端', onClick: openPythonTerminal },
			{ title: '设置', onClick: openSettingView },
			// { title: '模块', onClick: openPythonModule },
			{
				title: '删除',
				onClick: (row: DockerSiteTableRowProps) => {
					delDockerSite(row)
				},
			},
		]),
	],
	extension: [useCategory, useTableBatch, useRefreshList(isRefreshSiteList)],
})
onMounted(() => {
	getNginxStatus()
})

onUnmounted(() => {
	resetData()
})
</script>
<style scoped>
/* :deep(.el-table .cell){
	display:block;
} */
</style>
