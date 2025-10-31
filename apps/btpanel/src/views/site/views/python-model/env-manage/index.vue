<!--  -->
<template>
	<div>
		<div class="grid grid-cols-1 gap-y-[1rem]">
			<div>
				Python版本
				<span>{{ envData.pyVersion }}</span>
			</div>
			<div class="flex flex-col leading-[2rem]">
				<span>命令行使用项目中的环境:</span>
				<span>命令行可使用 <code>source py-project-env [项目名称]</code> 进入该项目虚拟环境，退出时使用<code>deactivate</code></span>
				<span class="flex items-center">
					示例：<code>source py-project-env {{ siteInfo.name }} </code>
					<i class="svgtofont-el-document-copy cursor-pointer text-default text-base copy ml-[4px]" title="复制启动命令" @click="() => copyText({ value: `source py-project-env ${siteInfo.name}` })"></i>
				</span>
				<span>若提示没有py-project-env文件，可尝试关闭系统加固并重启面板，然后进入Python项目页面此，时会自动设置该文件</span>
			</div>
			<div class="flex items-center">
				<span class="mr-[1rem] whitespace-nowrap">依赖记录文件</span>
				<bt-input-icon v-model="envData.path" icon="el-folder-opened" @icon-click="onPathChange" width="40rem" />
			</div>
		</div>
		<!-- <div class="mt-[2rem] h-[15rem] border"></div> -->
		<div class="h-[45rem] mt-[2rem]">
			<bt-table-group>
				<template #header-left>
					<el-button type="primary" @click="openInstall()">安装</el-button>
				</template>
				<template #header-right>
					<BtSearch width="20rem" placeholder="搜索第三方库" />
					<el-button type="default" class="!ml-[1rem]" @click="forcedRefresh">强制刷新</el-button>
				</template>
				<template #content>
					<BtTable :max-height="480" />
				</template>
			</bt-table-group>
		</div>
		<!-- <bt-help :options="helpList" list-style="none" class="ml-[20px] mt-[20px]"></bt-help> -->
	</div>
</template>

<script setup lang="tsx">
import { useRefreshList, useSearch, useTable } from '@/hooks/tools'
import { useSiteStore } from '@site/useStore'
import { copyText } from '@/utils'
import { useOperate } from '@/hooks/tools/table/column'
import { envData, getEnvData, isRefreshList, forcedRefresh, unInstallEvent, openInstall, onPathChange } from './useController'

const { siteInfo } = useSiteStore()

const { BtTable, BtSearch } = useTable({
	request: getEnvData,
	columns: [
		{
			label: '名称', // 用户名
			prop: 'name',
		},
		{
			label: '版本', // 用户名
			prop: 'version',
		},
		{
			label: '依赖记录文件中的版本', // 用户名
			prop: 'requirement',
		},
		useOperate([
			{
				onClick: openInstall,
				title: '安装',
				render: (row: any) => {
					let isRender = row.version === '--'
					isRender = isRender && !row.requirement.includes('git') && !row.requirement.includes('file')
					return isRender ? (
						<span class="text-primary cursor-pointer hover:text-primaryDark" onClick={() => openInstall(row)}>
							安装
						</span>
					) : (
						''
					)
				},
			},
			{
				onClick: unInstallEvent,
				isHide: (row: any) => {
					return row.version === '--'
				},
				title: '卸载',
			},
		]),
	],
	extension: [useRefreshList(isRefreshList), useSearch()],
})
</script>

<style lang="css" scoped>
code {
	@apply py-[1px] px-[5px] text-supplement rounded-base m-[2px];
	padding: 1px 5px;
	background-color: var(--el-fill-color-darker);
}
</style>
