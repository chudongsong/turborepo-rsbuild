<template>
	<div class="w-full flex items-center justify-between mb-[20px] flex-wrap">
		<div class="flex items-center">
			<span class="w-[80px] pr-16px text-base flex justify-end">应用搜索</span>
			<div class="flex flex-1 relative">
				<!-- 搜索框 -->
				<bt-input-search class="!w-[580px] lt-xl:(!w-[50rem]) lt-lg:(!w-[36rem]) <md:(!w-[30rem]) lt-sm:(!w-[20rem])" ref="searchRef" v-model="searchVal" :disabledPopover="disabledPopover" @search="refreshRouteData('0', 1)" placeholder="支持应用名称、字段模糊搜索">
					<!-- 搜索历史和推荐（悬浮框） -->
					<template #default>
						<soft-search-history v-if="showRefresh" />
					</template>
				</bt-input-search>

				<!-- 需求反馈 -->
				<span v-show="showNpsCollect" @click="openNPS" class="ml-[2rem] whitespace-nowrap bt-link flex items-center"> 未查询到搜索内容,提交需求反馈 </span>
			</div>
		</div>
		<div class="flex items-center mt-4px">
			<el-button @click="refreshRouteData('1')" :disabled="isLoading">
				<bt-icon icon="el-loading mr-4px" v-show="isLoading" />
				<span>更新软件列表 / 支付状态</span>
			</el-button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { SOFT_STORE } from '@/views/soft/store'
import SoftSearchHistory from './history.vue'
import { storeToRefs } from 'pinia'

const { searchRef, showNpsCollect, isLoading, searchVal, showRefresh, tabActive } = storeToRefs(SOFT_STORE())
const { refreshRouteData, openNPS } = SOFT_STORE()

const disabledPopover = computed(() => tabActive.value === 'deployment')

onUnmounted(SOFT_STORE().$reset_history)
</script>

<style lang="css" scoped>
.boxCon {
	@apply flex items-center text-small;
}
.title {
	@apply ml-[.6rem] mr-[2rem];
	white-space: nowrap;
}
.con {
	@apply flex items-center;
}
.search {
	@apply w-[57rem] relative;
}
</style>
