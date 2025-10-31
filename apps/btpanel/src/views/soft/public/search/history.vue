<template>
	<div class="history-box w-[580px] lt-xl:(!w-[50rem]) lt-lg:(!w-[36rem]) <md:(!w-[30rem]) lt-sm:(!w-[20rem])" @mousedown.prevent>
		<div class="type-item">
			<span class="type-name justify-between">
				<span>搜索历史</span>
				<el-button type="default" size="small" @click.stop="clearAllHistoryEvent">
					<span class="flex items-center"> <i class="svgtofont-el-delete mr-[4px]"></i><span>清空</span> </span>
				</el-button>
			</span>
			<div class="history-list relative max-h-[20rem] overflow-x-hidden overflow-y-auto">
				<template v-for="(item, index) in historyList">
					<div class="history-item max-w-[calc(100%+1rem)] h-[3rem]" @click="inputHistoryEvent(item.val)" :title="item.val">
						<span class="truncate leading-16px">{{ item.val }}</span>
						<i class="svgtofont-el-close p-[2px]" @click.stop="clearFindHistoryEvent(item.val, index)"></i>
					</div>
				</template>
			</div>
		</div>
		<div class="type-item">
			<span class="type-name">
				<span>搜索排行</span>
				<img class="w-[2.4rem] h-[1.2rem] ml-[.5rem]" src="/static/images/soft_ico/hot.png" alt="" />
			</span>
			<div class="search-list">
				<div v-for="item in softSearchList" class="search-item" @click="handleOpenPluginEvent(item.ename)">
					{{ item.name }}
				</div>
			</div>
		</div>
		<div class="type-item">
			<span class="type-name">
				<span>热门推荐</span>
				<img class="w-[1.4rem] h-[1.4rem] ml-[.5rem]" src="/static/images/soft_ico/hots.png" alt="" />
			</span>
			<div class="recommend-list">
				<template v-for="item in softRecommendList">
					<div class="recommend-item" @click="handleOpenPluginEvent(item.ename, 210)">
						<img :src="`../static/images/soft_ico/ico-${item.ename}.png`" />
						<span>{{ item.name }}</span>
					</div>
				</template>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { SOFT_STORE } from '@soft/store'
import { storeToRefs } from 'pinia'

const { historyList, softSearchList, softRecommendList } = storeToRefs(SOFT_STORE())
const { handleOpenPluginEvent, clearFindHistoryEvent, inputHistoryEvent, clearAllHistoryEvent, initHistory } = SOFT_STORE()

onMounted(initHistory)
</script>

<style lang="css" scoped>
.history-box {
	@apply rounded-md z-9999;
	background-color: rgba(var(--el-color-white-rgb), 1);
}
.type-item {
	@apply text-tertiary text-base;
}
.type-name {
	@apply flex items-center;
}
.history-list,
.search-list,
.recommend-list {
	@apply mt-[8px] pb-[18px] flex flex-wrap flex-row pt-[8px] border-t border-extraLight border-dashed;
}
.history-item,
.search-item,
.recommend-item {
	@apply py-[6px] px-[8px] text-small text-secondary mb-[4px] rounded-sm mr-[8px] cursor-pointer flex items-center;
}
.history-item:hover,
.search-item:hover,
.recommend-item:hover {
	@apply bg-base text-primary;
}
.history-item i {
	@apply opacity-0 ml-[4px];
}
.history-item:hover i {
	@apply opacity-100 text-red-500;
}
.recommend-list {
	@apply pb-0;
}
.recommend-item img {
	@apply max-w-[20px] max-h-[20px] mr-[8px];
}
.recommend-item span {
	@apply flex;
}
</style>
