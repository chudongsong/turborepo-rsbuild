<template>
	<div ref="scrollContainerRef" :style="`height:${mainHeight - 260}px`" class="overflow-hidden relative scrollBox">
		<!-- <div v-show="appData.list.length" class="AppList" :class="`grid-cols-${columnNum}`"> -->
		<RecycleScroller
			ref="virtualScrollRef"
			v-show="appData.list.length"
			class="AppList"
			:style="`height:${mainHeight - 280}px;width: calc(20px + ${itemWidth}px * ${columnNum});`"
			:items="appData.list"
			:item-size="deployMenuData.app_type === 'installed' ? 175 : 145"
			:itemSecondarySize="itemWidth"
			:gridItems="columnNum"
			:buffer="100"
			key-field="index"
			itemClass="app-item"
			@scroll-end="scrollLoad">
			<template v-slot="{ item }">
				<div class="pr-[1.5rem]">
					<AppItem :data="item" @refresh="onClickInstalled"></AppItem>
				</div>
			</template>
			<template #after>
				<el-divider v-if="noMore && appData.list.length && deployMenuData.app_type !== 'installed'"
					><span class="w-full !h-[4rem] p-2rem inline-block flex justify-center items-center text-small">没有更多了,如没有想要的应用可<bt-link @click="NPSDialog">提交需求反馈</bt-link></span></el-divider
				>
			</template>
		</RecycleScroller>
		<!-- </div> -->
		<el-empty v-if="!appData.list.length" class="w-full">
			<template #description>
				<span class="text-small">未查询到搜索内容,请尝试<span class="inline-flex bt-link" @click="refreshList(true)">更新应用列表</span>或加入QQ群：767189639反馈</span>
			</template>
		</el-empty>
	</div>
</template>

<script setup lang="ts">
import { RecycleScroller } from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'

import { useGlobalStore } from '@store/global'
import { getDockerAppStore } from '@docker/views/app-store/useStore'
import { getDockerStore } from '@docker/useStore'
import { NPSDialog } from '@docker/useMethods' // 弹窗方法
import { appData, getAppList, appParams } from '@docker/views/app-store/useController'
import { checkInstalling, onClickInstalled, noMore, refreshTimer, scrollLoad } from './useController'
import { refreshList } from '@docker/views/app-store/top-tools/useController'

import AppItem from '@docker/views/app-store/app-item/index.vue'

const { mainHeight, mainWidth } = useGlobalStore()

const {
	refs: { deployMenuData },
} = getDockerAppStore()

const {
	refs: { isRefreshAppList, isRefreshInstallList },
} = getDockerStore()

const scrollContainerRef = ref<HTMLElement | null>(null)
const virtualScrollRef = ref<any>(null)

const columnNum = computed(() => {
	if (mainWidth.value < 1125) return 1
	if (mainWidth.value < 1632) return 2
	return 3
}) // 列数

const itemWidth = computed(() => {
	return (mainWidth.value - 35) / columnNum.value
})

// useInfiniteScroll(
// 	scrollContainerRef,
// 	() => {
// 		scrollLoad()
// 	},
// 	{ distance: 15 }
// )

watch(
	() => deployMenuData.value.app_type,
	async val => {
		;(scrollContainerRef.value as HTMLElement).scrollTop = 0
		noMore.value = false
		if (val === 'installed') {
			clearTimeout(refreshTimer)
			await onClickInstalled('all')
			checkInstalling()
		} else {
			clearTimeout(refreshTimer)
		}
	}
)

watch(
	() => isRefreshAppList.value,
	val => {
		if (val) {
			getAppList(appParams)
			isRefreshAppList.value = false
		}
	}
)

watch(
	() => isRefreshInstallList.value,
	val => {
		if (val) {
			clearTimeout(refreshTimer)
			onClickInstalled('all')
			isRefreshInstallList.value = false
		}
	}
)
watch(
	() => appData.list.length,
	val => {
		virtualScrollRef.value.scrollToPosition(0)
		virtualScrollRef.value.handleResize()
	}
)

onMounted(() => {
	if (deployMenuData.value.app_type === 'installed') {
		isRefreshInstallList.value = true
	} else {
		isRefreshAppList.value = true
	}
})

onBeforeUnmount(() => {
	clearTimeout(refreshTimer)
})
</script>

<style scoped>
.AppList {
	@apply inline-grid gap-x-8 w-full overflow-auto relative px-4px pb-8px gap-y-6;
}
.scrollBox ::-webkit-scrollbar-thumb {
	background-color: var(--el-fill-color-dark);
}
.scrollBox::-webkit-scrollbar-thumb:hover {
	background-color: var(--el-fill-color-darker);
}
:deep(.app-item) {
	/* @apply z-995; */
	@apply mt-[.3rem] mb-[1.5rem] z-995;
}
/* :deep(.app-item:nth-child(-n+2)) {
	@apply pt-[1rem];
}
:deep(.app-item:first-child) {
	@apply pl-[0rem];
} */
:deep(.custom-loading) {
	@apply z-99999;
}
</style>
