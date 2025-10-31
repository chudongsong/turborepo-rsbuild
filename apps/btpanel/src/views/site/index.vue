<template>
	<BtRouterTabs />
</template>

<script lang="ts" setup>
import { useRequestCanceler } from '@hooks/tools/axios/model/axios-cancel' // 取消请求
import { useRouterTabs } from '@/hooks/business/router-tabs'

const { BtRouterTabs } = useRouterTabs()

// 离开
onUnmounted(() => {
	// 取消初始化请求
	useRequestCanceler(['/site?action=get_site_types', '/panel/public/get_soft_status', '/datalist/data/get_data_list', '/project/scanning/list', '/mod/java/project/project_list'])
})
</script>
