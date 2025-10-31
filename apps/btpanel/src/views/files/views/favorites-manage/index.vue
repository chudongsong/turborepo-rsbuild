<template>
	<div class="flex flex-col px-2rem lib-box">
		<bt-table-group>
			<template #header-left> </template>
			<template #header-right> </template>
			<template #content>
				<bt-table ref="favTable" height="50rem" :column="tableColumn" :data="favoriteList" :description="'收藏夹列表为空'" v-bt-loading="favTableData.loading" v-bt-loading:title="'正在加载收藏夹列表，请稍后...'" />
			</template>
			<template #footer-left> </template>
			<template #footer-right> </template>
			<template #popup> </template>
		</bt-table-group>
	</div>
</template>
<script setup lang="ts">
import { getFavoriteList } from '@files/useMethods'
import { storeToRefs } from 'pinia'
import FILES_FAVORITES_MANAGE_STORE from './store'

interface Props {
	compData?: any
}

const props = withDefaults(defineProps<Props>(), {
	compData: () => ({}),
})
const emit = defineEmits(['close'])

const store = FILES_FAVORITES_MANAGE_STORE()
const { tableColumn, favoriteList, favTableData } = storeToRefs(store)
const { onCancel, $reset } = store

onMounted(() => {
	getFavoriteList()
})

defineExpose({
	onCancel,
})

onUnmounted(() => {
	$reset()
})
</script>
