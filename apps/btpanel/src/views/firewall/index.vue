<template>
	<BtRouterTabs />
</template>

<script lang="ts" setup>
import { useRequestCanceler } from '@hooks/tools/axios/model/axios-cancel' // 取消请求
import { useRouterTabs } from '@/hooks/business/router-tabs'

const { BtRouterTabs } = useRouterTabs({})
// 离开
onUnmounted(() => {

	// 取消初始化请求
	useRequestCanceler([
		'/firewall/com/get_status',
		'/firewall/com/get_firewall_info',
		'/firewall/com/port_rules_list',
		'/firewall/com/get_www_logs_size'
	])
})
</script>
