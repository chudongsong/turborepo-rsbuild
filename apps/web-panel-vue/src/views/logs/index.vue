<template>
	<BtRouterTabs/>
</template>

<script lang="ts" setup>
import { useRequestCanceler } from '@hooks/tools/axios/model/axios-cancel' // 取消请求
import { useRouterTabs } from '@/hooks/business/router-tabs'
const { BtRouterTabs } = useRouterTabs({})
// onMounted(init)
// 离开
onUnmounted(() => {

// 取消初始化请求
useRequestCanceler([
	'/data?action=getData',
])
})
</script>
