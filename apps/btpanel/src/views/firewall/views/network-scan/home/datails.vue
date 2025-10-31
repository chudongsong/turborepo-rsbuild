<template>
	<div class="p-[20px]">
		<el-card shadow="never" class="p-[20px]">
			<div class="card-header">
				<h3 class="text-extraLarge font-bold text-default mb-[10px]">{{ props.compData.ip }}</h3>
				<div class="title">{{ info.locationInfo }}</div>
				<el-divider class="my-[10px]" />
				<div class="mb-[20px] p-[10px] bg-light rounded-base">
					<span class="text-secondary mr-[10px]">总扫描次数：</span>
					<span class="text-default text-medium font-bold">{{ info.total_scan_count }}</span>
				</div>
				<bt-table :data="info.daily_scan_count_list" :column="columns" />
			</div>
		</el-card>
	</div>
</template>
<script lang="ts" setup>
import { getScanPerceptionDetail } from '@/api/firewall'

const props = defineProps<{
	compData: {
		ip: string
	}
}>()
const info = ref({
	locationInfo: '',
	total_scan_count: '',
	daily_scan_count_list: [],
})

const init = async () => {
	const { data } = await getScanPerceptionDetail({ ip: props.compData.ip })
	const { ip_detail, total_scan_count, daily_scan_count_list } = data
	if (ip_detail.country === '局域网') {
		info.value.locationInfo = '局域网'
	} else {
		info.value.locationInfo = [ip_detail.country, ip_detail.province, ip_detail.city].filter(Boolean).join('.')
	}
	info.value.total_scan_count = total_scan_count
	info.value.daily_scan_count_list = daily_scan_count_list
}
const columns = [
	{
		label: '日期',
		prop: 'date',
		width: 150,
	},
	{
		label: '扫描次数',
		render: (row: any) => {
			return row.scan_count.toLocaleString() || 0
		},
	},
]
init()
</script>
