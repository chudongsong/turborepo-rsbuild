<template>
	<BtRouterTabs @cut-tab="cutTab" />
</template>

<script setup lang="ts">
import { useRouterTabs } from '@/hooks/business/router-tabs'
import { useRequestCanceler } from '@hooks/tools/axios/model/axios-cancel' // 取消请求
import useSSLStore from '@ssl/useStore'

const { tabActive } = storeToRefs(useSSLStore())

const { BtRouterTabs } = useRouterTabs({})

const cutTab = (name: string) => {
	tabActive.value = name
}
// 离开
onUnmounted(() => {

	// 取消初始化请求
	useRequestCanceler([
		'/ssl/cert/get_cert_group',
		'/ssl/cert/get_cert_list',
	])
})
</script>
