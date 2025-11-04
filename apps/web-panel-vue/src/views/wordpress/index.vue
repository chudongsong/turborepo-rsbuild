<template>
	<BtRouterTabs />
</template>

<script lang="ts" setup>
import { useRouterTabs } from '@/hooks/business/router-tabs'
import { useRequestCanceler } from '@hooks/tools/axios/model/axios-cancel' // 取消请求

const { BtRouterTabs } = useRouterTabs({})
// 离开
onUnmounted(() => {

	// 取消初始化请求
	useRequestCanceler([
		'/panel/public/get_soft_status',
		'/datalist/data/get_data_list',
	])
})
</script>
