<template>
	<div>
		<version-compare />
		<BtCard class="!border-none mb-[20px]">
			<template #header>
				<div class="card-header">
					<span>预设存储盘</span>
				</div>
			</template>
			<div class="p-[16px] text-base">创建用户时，用户信息将存储在此空间中</div>
			<div class="p-[10px]">
				<div class="flex items-center mb-[16px]">
					<div class="w-[150px] font-black text-base text-right h-[24px]">默认磁盘配额：</div>
					<div class="flex-1">{{ defaultDiskInfo.mountpoint }}</div>
				</div>
				<div class="flex items-center mb-[16px]">
					<div class="w-[150px] font-black text-base text-right h-[24px]">装配：</div>
					<div class="flex-1">{{ defaultDiskInfo.device }}</div>
				</div>
				<div class="flex items-center mb-[16px]">
					<div class="w-[150px] font-black text-base text-right h-[24px]">已使用：</div>
					<div class="flex w-[50rem]">
						<div class="mr-[2rem] max-w-[20rem] w-[16rem]">
							{{ getByteUnit(defaultDiskInfo.used) }}/
							{{ getByteUnit(defaultDiskInfo.total) }}
						</div>
						<div class="flex-1">
							<BtProgress :percentage="Number(defaultDiskInfo.used_percent.toFixed(2))" text-inside :stroke-width="18" :status="diskColor(defaultDiskInfo.used_percent)" />
						</div>
					</div>
				</div>
				<div class="flex items-center mb-[16px]">
					<div class="w-[150px] font-black text-base text-right h-[24px]">已分配：</div>
					<div class="flex w-[50rem]">
						<div class="mr-[2rem] max-w-[20rem] w-[16rem]">
							{{ getByteUnit(defaultDiskInfo.account_allocate) }}/
							{{ getByteUnit(defaultDiskInfo.total) }}
						</div>
						<div class="flex-1">
							<BtProgress :percentage="Number(((defaultDiskInfo.account_allocate / defaultDiskInfo.total) * 100).toFixed(2))" text-inside :stroke-width="18" :status="diskColor(defaultDiskInfo.account_percent)" />
							<div v-if="defaultDiskInfo.account_percent > 100" class="text-center text-danger">PS:您的空间分配已达上限</div>
						</div>
					</div>
				</div>
			</div>
		</BtCard>
		<BtCard class="!border-none">
			<template #header>
				<div class="card-header">
					<span>可用存储盘</span>
				</div>
			</template>
			<BtTable class="mt-[16px]" :min-height="mainHeight" />
		</BtCard>
	</div>
</template>

<script lang="ts" setup>
import VersionCompare from '@/views/vhost/public/version-compare.vue'
import { getByteUnit } from '@/utils'
import { useTable } from '@/hooks/tools'
import { useGlobalStore } from '@/store/global'
import { useStorageStore } from './useStore'

const { mainHeight } = useGlobalStore()
const { columns, getDiskList, defaultDiskInfo, diskColor, refreshInfo } = useStorageStore()

const { BtTable, refresh } = useTable({
	request: getDiskList,
	columns: columns.value,
})

watch(() => refreshInfo.value, refresh)
</script>
