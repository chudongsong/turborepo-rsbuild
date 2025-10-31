<!--  -->
<template>
	<div class="p-2rem">
		<BtTabs @tab-change="handleChangeTab" />

		<el-button type="primary" @click="getBackLog(true)">刷新日志</el-button>
		<bt-log :content="content" class="h-[40rem] mt-1.2rem" v-bt-loading="loading" v-bt-loading:title="'正在获取日志中，可能需要一段时间....'"></bt-log>
	</div>
</template>

<script setup lang="ts">
import { getSyncLogApi } from '@/api/config'
import { detailData } from '../useMethod'
import { Message, useTabs } from '@/hooks/tools'

const tabValue = ref('backup')
const { BtTabs } = useTabs({
	type: 'card',
	value: tabValue,
	options: [
		{
			label: '备份日志',
			name: 'backup',
			lazy: true,
		},
		{
			label: '还原日志',
			name: 'restore',
			lazy: true,
		},
	],
})

const content = ref('当前日志为空')
const loading = ref(false)

/**
 * @description 获取备份日志
 */
const getBackLog = async (isRefresh?: boolean) => {
	try {
		loading.value = true
		const { data: res } = await getSyncLogApi({ timestamp: detailData.value.timestamp, type: tabValue.value })
		content.value = res.data || '当前日志为空'
		isRefresh && Message.success('刷新成功')
	} catch (error) {
		console.log(error)
	} finally {
		loading.value = false
	}
}

/**
 * @description 切换日志
 * @param tab
 */
const handleChangeTab = (tab: any) => {
	tabValue.value = tab
	getBackLog()
}

onMounted(getBackLog)
</script>

<style lang="sass" scoped></style>
