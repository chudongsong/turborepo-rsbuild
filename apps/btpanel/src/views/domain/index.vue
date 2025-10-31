<template>
	<BtRouterTabs contentClass="mt-[1.2rem] relative"></BtRouterTabs>
</template>

<script lang="ts" setup>
import { useRouterTabs } from '@/hooks/business/router-tabs';
import { useRequestCanceler } from '@hooks/tools/axios/model/axios-cancel'

const { BtRouterTabs } = useRouterTabs();

onUnmounted(() => {
	// 取消初始化请求
	useRequestCanceler([
		'/api/v1/user/security/get_public_ip',
		'/api/v1/user/security/get_analysis_ip', 
		'/api/v1/user/security/check_panel_access',
		'/api/v1/domain/manage/list'
	])
})
</script>
<style>

</style>
