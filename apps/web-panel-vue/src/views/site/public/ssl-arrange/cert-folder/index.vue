<template>
	<div>
		<bt-table-group>
			<template #header-left>
				<el-button type="default" @click="refreshClouds"> 从云端同步 </el-button>
			</template>
			<template #header-right>
				<div><BtTableSelect /></div>
				<BtSearch class="w-[30rem]" placeholder="请输入域名搜索" />
			</template>
			<template #content>
				<BtTable :max-height="500" />
			</template>
			<template #popup>
				<bt-dialog title="部署当前证书" v-model="setPopup" :area="52">
					<div class="relative h-[45rem]">
						<div class="p-[20px]">
							<div class="flex flex-col p-[12px] bg-light">
								<span class="mb-[4px]">认证域名：{{ certData.subject }}</span>
								<span class="mb-[4px]">证书类型：{{ certData.info?.issuer }}</span>
								<span class="mb-[4px]">到期时间：{{ certData.not_after }}</span>
							</div>
							<span class="!mt-[24px] !mb-[4px] inline-block">如下是需要批量部署证书的站点：</span>
							<div class="flex justify-between mb-[1rem]">
								<BtRadio
									type="button"
									v-model="deploySSLParams.typeValue"
									size="default"
									:options="[
										{ label: '全部', value: '全部' },
										{ label: '匹配站点', value: '匹配站点' },
									]"
									@change="changeWebTypeEvent" />
								<!-- <el-radio-group v-model="deploySSLParams.typeValue" size="default" @change="changeWebTypeEvent" class="mr-[12px]">
									<el-radio-button value="全部">全部</el-radio-button>
									<el-radio-button value="匹配站点">匹配站点</el-radio-button>
								</el-radio-group> -->
								<!-- <bt-input-search
									v-model="deploySSLParams.search"
									placeholder="请输入站点"
									width="16rem"
									@search="handleDeploySiteListSearch"
									@clear="handleDeploySiteListSearch" /> -->
							</div>
							<el-table ref="deploySiteTableRef" @selection-change="handleDeploySelectionChange" v-bt-loading:title="'正在加载中，请稍后...'" :data="deploySSLParams.data[deploySSLParams.typeValue === '全部' ? 'all' : 'site']" :max-height="180" v-bt-loading="isLoading">
								<el-table-column type="selection" width="55" />
								<el-table-column label="站点名称" prop="name">
									<template #default="scope">
										{{ String(scope.row.name) + (scope.row.current ? '(当前站点)' : '') }}
									</template>
								</el-table-column>
							</el-table>
						</div>
						<div class="absolute bottom-0 w-full bg-light flex items-center justify-end p-[12px]">
							<el-button type="info" @click="setPopup = false">取消</el-button>
							<el-button type="primary" @click="handleConfirm()">{{ deploySSLParams.btnText }}</el-button>
						</div>
					</div>
				</bt-dialog>
			</template>
		</bt-table-group>
	</div>
</template>

<script setup lang="tsx">
import { useDynamicTable, useRefreshList, useTableSelect } from '@/hooks/tools'
import { useOperate } from '@/hooks/tools/table/column'
import type { CertFolderTableProps } from '@site/types.d'
import { useSiteSSLStore } from '../useStore'
import { isLoading, certDeployEvent, deleteEvent, getListData, isCloudsRefresh, typeOptions, uploadCloudEvent, refreshClouds, handleConfirm, handleDeploySelectionChange, changeWebTypeEvent, deploySSLParams, certData, setPopup, deploySiteTableRef } from './useController'

const { isRefreshSSL } = useSiteSSLStore()

const tableType = useTableSelect({
	key: 'search_limit',
	options: typeOptions,
	other: {
		class: '!w-[10rem] mr-1rem',
		filterable: true,
	},
})

const { BtTable, BtSearch, BtTableSelect, refresh } = useDynamicTable({
	request: getListData,
	columns: [
		{
			label: '域名', // 路径
			prop: 'subject',
			render: (row: CertFolderTableProps) => {
				return h('div', { class: 'whitespace-pre-wrap' }, row.dns?.join('\n') || row.subject)
			},
		},
		{ label: '到期时间', prop: 'not_after' },
		{ label: '品牌', prop: 'info.issuer', showOverflowTooltip: true },
		{
			label: '位置',
			render: (row: CertFolderTableProps) => (row.cloud_id > 0 ? '云端' : '本地'),
		},
		useOperate([
			{
				onClick: async (row: any) => {
					await uploadCloudEvent(row)
					refresh()
				},
				width: 60,
				title: '上传云端',
				isHide: (row: CertFolderTableProps) => row.cloud_id > 0,
			},
			{ onClick: certDeployEvent, title: '部署' },
			{ onClick: deleteEvent, title: '删除' },
		]),
	],
	extension: [tableType, useRefreshList(isCloudsRefresh)],
})

defineExpose({ init: refresh })
</script>
