<template>
	<div class="w-full">
		<TopTools class="mb-8px"></TopTools>
		<!-- <div class="flex">
			<!-- 顶部工具 -->
		<!-- 应用搜索/最经使用/分类 -->

		<!-- 应用列表 -->
		<!-- </div> -->
		<AppList v-bt-loading="appData.loading" v-bt-loading:title="'正在加载列表，请稍后...'"></AppList>
	</div>
</template>

<script setup lang="ts">
import { appData, unmountedHandle } from './useController'
import { useRequestCanceler } from '@hooks/tools/axios/model/axios-cancel'

import TopTools from '@docker/views/app-store/top-tools/index.vue'
import AppList from '@docker/views/app-store/app-list/index.vue'

onBeforeUnmount(() => {
	// 取消请求
	useRequestCanceler(['/mod/docker/com/get_apps', '/mod/docker/com/get_tags', '/mod/docker/com/get_installed_apps'])
})

onUnmounted(() => {
	// 重置数据
	unmountedHandle()
})
</script>

<style lang="css" scoped>
/* // 应用分类 */
.class-item {
	@apply mr-[16px] px-[20px] h-[30px] leading-[30px] text-small cursor-pointer bg-darker rounded-large;
}
.class-item.on {
	@apply bg-primary text-white;
}
</style>
