<template>
	<BtRouterTabs />
</template>

<script setup lang="ts">
import { getDatabaseStore } from '@database/useStore'
import { useCheckSoftStatus } from '@database/useMethod'
import { useRequestCanceler } from '@hooks/tools/axios/model/axios-cancel' // 取消请求
import { useRouterTabs } from '@/hooks/business/router-tabs'
import { useGlobalStore } from '@/store/global'

const {
	refs: { tabActive, softData, isHaveServer },
} = getDatabaseStore()

const { plugin } = useGlobalStore()

const { BtRouterTabs } = useRouterTabs()

watch(
	tabActive,
	async val => {
		softData.value = { setup: true }

		// 初始化setup
		if (tabActive.value === 'mysql') softData.value.setup = plugin.value.mysql.setup
		if (tabActive.value === 'redis') softData.value.setup = plugin.value.redis.setup

		isHaveServer.value = true
		softData.value = await useCheckSoftStatus(val)
	},
	{ immediate: true }
)
// 离开
onUnmounted(() => {

	// 取消初始化请求
	useRequestCanceler([
		'/database?action=GetCloudServers',
		'/panel/public/get_soft_status',
		'/datalist/data/get_data_list',
		'/database?action=view_database_types',
		'/crontab?action=get_auto_config',
	])
})
</script>

<style scoped></style>
