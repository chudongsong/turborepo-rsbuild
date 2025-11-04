<template>
	<BtRouterTabs />
</template>

<script setup lang="ts">
import { useRouterTabs } from '@/hooks/business/router-tabs'
import { useRequestCanceler } from '@hooks/tools/axios/model/axios-cancel' // 取消请求

const { BtRouterTabs } = useRouterTabs()
// 离开
onUnmounted(() => {

	// 取消初始化请求
	useRequestCanceler([
		'/crontab?action=GetCrontabs',
		'/crontab?action=get_crontab_types',
		'/crontab?action=get_crontab_service',
	])
})
</script>
