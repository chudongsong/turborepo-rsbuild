<!--  -->
<template>
	<div class="p-2rem">
		<BtTabs @tab-change="onTabChange"></BtTabs>

		<div class="p-1.2rem pt-0">
			<div class="flex flex-col leading-[22px]">
				<el-descriptions :title="false" :column="1" size="small" border  class="table-descriptions">
					<el-descriptions-item :label="`${desc}时间：`">{{ backAllData.backup_time }}</el-descriptions-item>
					<el-descriptions-item :label="`${desc}大小：`">{{ getByteUnit(Number(backAllData.size)) || '--' }}</el-descriptions-item>
					<el-descriptions-item :label="`${desc}存储位置：`">
						<span class="max-w-[58rem] truncate inline-block">
							{{ backAllData.path || '--' }}
						</span>
					</el-descriptions-item>
					<el-descriptions-item :label="`SHA-256：`">
						<span class="max-w-[58rem] truncate inline-block" :title="detailData['SHA-256']">
							{{ backAllData['SHA-256'] || '--' }}
						</span>
					</el-descriptions-item>
					<el-descriptions-item :label="`${desc}耗时：`"> {{ `${backAllData.time_count ? `${backAllData.time_count}s` : ''}` || '--' }}</el-descriptions-item>
				</el-descriptions>
			</div>

			<div v-if="config.total != 0">
				<p class="font-bold text-dangerDark my-1.2rem">失败详情</p>
				<BtTable :max-height="360" />
			</div>

			<div class="w-full flex justify-end mt-[1.2rem]">
				<el-button type="primary" @click="openDetail">查看全部详情 </el-button>
			</div>

			<bt-dialog title="详情信息" :area="74" v-model="showAllDetailDialog">
				<DetailAllTable :data="allData" />
			</bt-dialog>
		</div>
	</div>
</template>

<script setup lang="tsx">
import { useAllTable, useTabs } from '@/hooks/tools'
import { getDetailAllData, detailTab, showAllDetailDialog, backAllData, allData } from './useMethod'
import { detailData } from '../useMethod'
import { getByteUnit } from '@utils/index'
import DetailAllTable from '../add-back/index.vue'

const desc = computed(() => (detailTab.value === 'restore' ? '还原' : '备份'))

const openDetail = () => {
	detailData.value = { operateType: 'detail', ...detailData.value }
	showAllDetailDialog.value = true
}

const tabOptions = [
	{
		label: '备份详情',
		name: 'backup',
		lazy: true,
	},
	{
		label: '还原详情',
		name: 'restore',
		lazy: true,
	},
]

const columns = [
	{ type: 'index' },
	{ label: '失败项', prop: 'name' },
	{
		label: '失败原因',
		prop: 'msg',
		width: 320,
		render: (row: any) => {
			return <span class={`text-[${row.task_status ? 'var(--el-color-primary)' : '#ef0808'}]`}>{row.task_status ? '成功' : row.msg}</span>
		},
	},
]

const { BtTabs } = useTabs({
	type: 'card',
	value: detailTab,
	options: detailData.value.restore_status !== 0 ? tabOptions : tabOptions.filter(item => item.name !== 'restore'),
})

const { BtTable, config, refresh } = useAllTable({
	request: getDetailAllData,
	columns: columns,
})

const onTabChange = (tab: string) => {
	detailTab.value = tab
	refresh()
}
</script>

<style lang="css" scoped>
:deep(.el-descriptions__body .el-descriptions__label) {
	min-width: 90px !important;
}
</style>
