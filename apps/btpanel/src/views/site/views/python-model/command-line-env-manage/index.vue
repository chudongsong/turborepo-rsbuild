<!-- Python环境管理 -->
<template>
	<div class="p-2rem">
		<bt-table-group>
			<template #header-left>
				<el-button type="primary" @click="openCreatePythonEnvView">创建虚拟环境</el-button>
				<!-- <el-button class="ml-[2rem]" type="default" @click="openApplyPythonEnvView">应用命令行</el-button> -->
				<el-button class="ml-[2rem]" type="default" @click="openAddPythonEnvView">添加</el-button>
				<el-button class="ml-[2rem]" type="default" @click="openEnvVersionView('py')">版本管理</el-button>
				<!-- <el-button v-show="currentApplyEnv?.name" class="ml-[2rem]" type="default" @click="cancelApply">取消当前命令行应用</el-button> -->
			</template>
			<template #content>
				<BtTable :max-height="400" />
			</template>
		</bt-table-group>
	</div>
</template>

<script setup lang="tsx">
import { useRefreshList } from '@/hooks/tools'
import { useTable } from '@/hooks/tools'
import { openPathEvent } from '@/hooks/tools/table/event'
import { getVersionListEvent, isRefreshList, openAddPythonEnvView, deletePythonEnvEvent, currentApplyEnv, cancelApply, openCreatePythonEnvView, unmountedHandle, setPythonVersionEvent } from './useController'
import { openEnvVersionView } from '@site/useController'

import { ElTooltip } from 'element-plus'
import BtDivider from '@/components/other/bt-divider'

const { BtTable, refresh } = useTable({
	request: getVersionListEvent,
	empty: () => {
		return (
			<div class="text-secondary text-base">
				暂无数据,
				<span class="bt-link" onClick={() => openEnvVersionView('py', refresh)}>
					点击安装Python
				</span>
			</div>
		)
	},
	columns: [
		{
			label: '名称',
			prop: 'name',
			render: (row: any) => {
				const getTypeText = (type: string) => {
					if (row.bin_path.includes('/www/server/panel/pyenv')) {
						return '宝塔面板环境'
					}
					switch (type) {
						case 'venv':
							return '虚拟环境'
						case 'system':
							return row.from_panel ? '面板安装' : '系统级环境'
						case 'conda':
							return 'Conda环境'
						default:
							return '未知'
					}
				}

				return (
					<div class="truncate flex items-center gap-2" title={`${row.name}${row.isCurrent ? `【命令行使用】` : ''}`}>
						<span class="truncate">{row.name}</span>
						<span class="shrink-0 px-2 py-1 bg-light text-gray-600 rounded">{getTypeText(row.type)}</span>
					</div>
				)
			},
		},
		{
			label: 'Python版本',
			prop: 'version',
			width: 130,
		},
		{
			label: '解释器位置',
			prop: 'bin_path',
			width: 80,
			render: (row: any) => {
				return (
					<span class="flex">
						<i title="跳转解释器目录" class="text-[var(--el-color-warning-light-3)] cursor-pointer svgtofont-folder-open !text-large" onClick={() => openPathEvent({ path: row.bin_path })}></i>
					</span>
				)
			},
		},
		{
			label: '使用项目',
			prop: 'project_name',
			render: (row: any) => {
				let text = '--'
				if (row.project_name && row.project_name.length > 0) {
					text = row.project_name.join('、')
				}
				return (
					<ElTooltip effect="dark" content={text} popper-class="w-[35rem]" show-after={500} placement="top-start" disabled={!row._isOverflow}>
						<div
							class="max-w-[30rem] truncate"
							ref={(el: HTMLDivElement) => {
								if (el) {
									// 检测内容是否溢出
									row._isOverflow = el.scrollWidth > el.clientWidth
								}
							}}>
							{text}
						</div>
					</ElTooltip>
				)
			},
		},
		{
			label: '备注',
			prop: 'ps',
			render: (row: any) => {
				return (
					<ElTooltip effect="dark" content={`${row.ps}${row.type === 'venv' ? `【来自${row.system_data.name}】` : ''}`} popper-class="w-[35rem]" show-after={500} placement="top-start" disabled={!row._isPsOverflow}>
						<div
							class="max-w-[30rem] truncate"
							ref={(el: HTMLDivElement) => {
								if (el) {
									// 检测内容是否溢出
									row._isPsOverflow = el.scrollWidth > el.clientWidth
								}
							}}>
							{`${row.ps}${row.type === 'venv' ? `【来自${row.system_data.name}】` : ''}`}
						</div>
					</ElTooltip>
				)
			},
		},
		{
			label: '操作',
			align: 'right',
			width: 150,
			render: (row: any) => {
				const opGroup:JSX.Element[] = []
				if(row.isCurrent) opGroup.push(<span class="shrink-0 text-secondary">当前命令行使用</span>)
				// if(row.can_set_default) opGroup.push(<span class="cursor-pointer bt-link" onClick={() => setPythonVersionEvent(row.bin_path)}>应用命令行</span>)
				// if(row.can_create) opGroup.push(<span class="cursor-pointer bt-link" onClick={() => openCreatePythonEnvView(row)}>创建虚拟环境</span>)
				if (row.can_remove)
					opGroup.push(
						<span class="cursor-pointer bt-link" onClick={() => deletePythonEnvEvent(row.bin_path, row.name)}>
							删除
						</span>
					)
				return (
					<div class="flex items-center">
						{opGroup.map((item: JSX.Element, index: number) => {
							return opGroup[index + 1] ? (
								<>
									{item}
									<BtDivider />
								</>
							) : (
								item
							)
						})}
					</div>
				)
			},
		},
	],
	extension: [useRefreshList(isRefreshList)],
})

onUnmounted(() => {
	unmountedHandle()
})
</script>
