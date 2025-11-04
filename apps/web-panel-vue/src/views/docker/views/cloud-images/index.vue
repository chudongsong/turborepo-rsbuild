<template>
	<div class="container-dialog p-[2.4rem]">
		<el-form ref="searchFormRef" :model="officiaForm" :label-position="`right`" @submit.native.prevent>
			<div class="flex items-center relative">
				<bt-input v-model="officiaForm.name" class="!w-[51rem]" @change.passive="clearSpace('name')" :placeholder="`请输入需要搜索的镜像名`" clearable @clear="manualRefresh(1)" @keyup.enter="manualRefresh(1)" />
				<el-dropdown @command="handleCommand" split-button class="ml-8px" type="primary">
					<span @click.stop="manualRefresh(1)">搜索</span>
					<template #dropdown>
						<el-dropdown-menu>
							<el-dropdown-item v-for="item in otherHref" :key="item.value" :command="item">
								<span>{{ item.text }}</span>
							</el-dropdown-item>
						</el-dropdown-menu>
					</template>
				</el-dropdown>
				<!-- <el-select v-model="registryActive" class="ml-8px !w-[12rem]" placeholder="请选择版本">
					<el-option v-for="(item, index) in registryList" :key="index" :label="item.name" :value="item.value"></el-option>
				</el-select> -->
			</div>
			<div class="py-[1rem]">
				<bt-table-group>
					<template #content>
						<BtTable :max-height="tableData.tableHeight" />
					</template>
					<template #footer-right>
						<BtPage />
						<!-- <bt-table-page class="mt-1rem" v-model:page="tableData.p" v-model:row="tableData.limit" :total="tableData.total" :useStorage="false" @change="cutList" /> -->
					</template>
				</bt-table-group>
			</div>
		</el-form>
	</div>
</template>

<script setup lang="tsx">
import { 
	officiaForm,
	tableData,
	search,
	clearSpace,
	jumpDKhub,
	init,
	unmountHandler,
	createEvent,
	pullDetails,
	delEvent,
	registryList,
	registryActive
 } from './useController'
import { useGlobalStore } from '@store/global'
import { useAllTable } from '@/hooks/tools'
import { useOperate } from '@/hooks/tools/table/column'

import BtDivider from '@/components/other/bt-divider/index'

const { mainHeight } = useGlobalStore()

const popupSetFooter = inject<any>('popupSetFooter', false)
const currentText = ref('1ms加速站搜索');

// 手动分页刷新
const manualRefresh = (p?:number) => {
	officiaForm.isRefresh = true
	if(p && !isNaN(p)) param.value.p = p
	refresh()
}
// otherHref
const otherHref = [
	{
		value: '1ms',
		text: '1ms加速站搜索',
	},
	{
		value: 'dockerHub',
		text: 'Docker Hub搜索',
	}
]
const handleCommand = (item:Record<string,string>) => {
	currentText.value = item.text;
	jumpDKhub(item.text == 'Docker Hub搜索' ? 1 : 0)
};

const { BtTable, BtPage,refresh,param } = useAllTable({
	request: data => {
		return search(data)
	},
	columns: [
		{ label: '镜像名', prop: 'name', width: 200 },
		{ label: 'Start数', prop: 'star_count', width: 70 },
		{ label: '来源', width: 60, render: (row: any) => (row.is_official ? '官方' : '非官方') },
		{ label: '描述/说明', prop: 'description', showOverflowTooltip: true },
		useOperate([
			{ onClick: createEvent, width: 80, title: '创建容器' },
			{
				onClick: (row: any) => {
				const _href = 'https://1ms.run/r/'+ (row.is_official ? 'library/' : '')
				window.open(`${_href+row.name}`, '_blank','noopener noreferrer')
			}, title: '简介' },
			{
				title: '拉取',
				render: (row: any) => (
					<span class="cursor-pointer text-primary" onClick={() => pullDetails(row,manualRefresh)}>
						{row.is_pull ? ['更新', <BtDivider />] : '拉取'}
					</span>
				),
			},
			{ onClick: (row:any)=>delEvent(row,manualRefresh), isHide: (row: { is_pull: number }) => !row.is_pull, title: '删除' },
		]),
	],
})

onMounted(() => {
	init(mainHeight,popupSetFooter,param)
})
onUnmounted(() => {
	unmountHandler()
})
</script>
