<template>
	<div class="p-20px">
		<p class="title-top">
			{{ `正在检查 ${row.results}，解析为 ${row.ip}，与 ${row.tested} 个已知黑名单进行比较...` }}
		</p>
		<p class="text-center my-16px">
			<b>已列出：{{ row.blacklisted }}</b>
		</p>
		<div class="flex box justify-center!" v-if="!row.blacklisted">
			<bt-icon icon="el-circle-check-filled" :size="24" color="var(--el-color-primary)"></bt-icon>
			您的 IP 不存在于 宝塔面板 的已知黑名单中
		</div>
		<BtTable v-else />
	</div>
</template>

<script lang="tsx" setup>
import { useTableData } from '@mail/useMethod'
import { formatTime } from '@/utils'
import { useAllTable } from '@/hooks/tools'

interface PropsData {
	row: any
}

interface Props {
	compData: PropsData
}

const props = withDefaults(defineProps<Props>(), {})

const { row } = props.compData

const { BtTable, BtPage, BtRefresh, BtColumn, BtBatch, refresh, BtSearch } = useAllTable({
	request: async data => {
		return {
			data: row.black_list || [],
			total: row.black_list.length || 0,
		}
	},
	columns: [
		{
			prop: 'blacklist',
			label: '黑名单',
		},
		{
			prop: 'time',
			label: '检查时间',
			render: (row: any) => formatTime(row.time),
		},
	],
})
</script>
<style lang="scss" scoped>
.title-top {
	@apply bg-light p-10px text-center rounded;
	border: 1px solid var(--el-color-border);
}

.box {
	@apply bg-[var(--el-color-success-light-8)] p-10px items-center rounded;
	border: 1px solid var(--el-color-primary);
}
</style>
