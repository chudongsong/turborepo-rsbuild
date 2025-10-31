<template>
	<div class="p-[2rem]">
		<BtTableGroup>
			<template #header-left>
				<BtSearch class="!w-[230px]" type="wp-sets" placeholder="搜索" />
			</template>
			<template #header-right>
				<ElButton type="primary" size="default" @click="onAddList(addRef?.tableSelectList)">添加</ElButton>
			</template>
			<template #content>
				<addTable v-if="config.data.length" :max-height="200" class="mb-[1rem]"></addTable>
				<BtTable :max-height="mainHeight - 400" />
			</template>
		</BtTableGroup>
	</div>
</template>

<script setup lang="ts">
import { useAllTable, useRefreshList } from '@/hooks/tools'
import { getAddPluginOrThemeListConfig, getInstallPluginOrThemesListData, getPluginOrThemeListConfig, getPluginOrThemeListData, onInstallSeach, onAddList } from './useController'
import { useGlobalStore } from '@/store/global'
import useWPSetsStore from '@/views/wordpress/view/local/sets-site/useStore'

const { pluginOrThemePamra, isRefreshInstallList, isRefreshPluginOrThemeList } = storeToRefs(useWPSetsStore())

const { mainHeight } = useGlobalStore()

/**
 * @description 获取表格
 */
const { BtTable, BtPage, BtRecommendSearch, BtRefresh, BtColumn, BtBatch, BtTableCategory, BtErrorMask, classList, refresh } = useAllTable({
	request: (data: any) => {
		return getPluginOrThemeListData(data)
	},
	columns: getPluginOrThemeListConfig(),
	extension: [useRefreshList(isRefreshPluginOrThemeList)],
})

/**
 * @description 获取插件或主题表格
 */
const {
	BtTable: addTable,
	refresh: addRefresh,
	ref: addRef,
	config,
	BtSearch,
} = useAllTable({
	request: (data: any) => {
		return getInstallPluginOrThemesListData(data)
	},
	columns: getAddPluginOrThemeListConfig(),
	extension: [useRefreshList(isRefreshInstallList)],
})

onMounted(() => {
	pluginOrThemePamra.value.keyword = ''
})
</script>

<style scoped></style>
