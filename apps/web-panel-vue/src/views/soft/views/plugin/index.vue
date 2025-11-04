<template>
	<div class="w-full h-full">
		<!-- 搜索，搜索值 -->
		<Search />

		<!-- 最近使用 -->
		<Recently />
		<!-- 应用分类 -->
		<div class="w-full items-center flex mb-16px">
			<span class="w-[80px] pr-16px text-base flex justify-end mb-4px">应用分类</span>
			<div class="flex flex-1 relative flex-wrap">
				<div v-for="item in typeList" :key="item.id" class="class-item mb-4px" :class="{ on: tabTypeActive === item.id }" @click="toggleClassEvent(item.id)">
					{{ item.title }}
				</div>
			</div>
		</div>
		<!-- 企业版和专业版推荐，传入 -->
		<Recommend v-if="!aliyunEcsLtd" />
		<!-- 应用 -->
		<bt-table-group>
			<template #content>
				<bt-table class="soft-table" :column="TableColumn" :data="softTableList" v-bt-loading="isLoading" v-bt-loading:title="'正在获取软件列表，请稍候...'">
					<template #empty>
						<span class="bt-link" @click="openNpsEvent">未查询到搜索内容,提交需求反馈</span>
					</template>
				</bt-table>
			</template>
			<template #footer-right>
				<bt-table-page v-model:page="tablePage.page" v-model:row="tablePage.row" :total="tablePage.total" :rowList="[10, 15, 20, 30, 50, 100]" @change="refreshPluginList()" />
			</template>
		</bt-table-group>
	</div>
</template>

<script setup lang="tsx">
import { storeToRefs } from 'pinia'

import { useGlobalStore } from '@store/global'
import { SOFT_STORE } from '@soft/store'
import SOFT_PLUGIN_STORE from './store'

import Search from '@soft/public/search/index.vue'
import Recently from '@soft/public/recently/index.vue'
import Recommend from '@soft/views/plugin/recom-products/index.vue'

const { isLoading, tabTypeActive } = storeToRefs(SOFT_STORE())
const { isRefreshSoftList, forceLtd, aliyunEcsLtd } = useGlobalStore()

const { refreshPluginList, openNpsEvent, toggleClassEvent, $reset } = SOFT_PLUGIN_STORE()
const { TableColumn, tablePage, softTableList, typeList } = storeToRefs(SOFT_PLUGIN_STORE())

watch(
	() => isRefreshSoftList.value,
	val => {
		if (val) {
			refreshPluginList()
			isRefreshSoftList.value = false
		}
	}
)

onMounted(refreshPluginList)
onUnmounted($reset)
</script>

<style lang="css" scoped>
.class-item {
	@apply mr-[12px] px-[20px] h-[30px] leading-[30px] text-small cursor-pointer bg-darker rounded-large;
}
.class-item.on {
	@apply bg-primary text-white;
}
</style>
