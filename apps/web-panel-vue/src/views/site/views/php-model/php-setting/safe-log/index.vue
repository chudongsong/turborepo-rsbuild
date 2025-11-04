<template>
	<div class="relative p-[16px]">
		<bt-table-group>
			<template #header-left></template>
			<template #header-right></template>
			<template #content>
				<bt-table ref="ftpTable" :column="tableColumn" :max-height="360" :data="logData.list" :description="'暂无数据'" v-bt-loading="logData.load" v-bt-loading:title="'正在加载中，请稍后...'" />
			</template>
			<template #footer-right>
				<bt-table-page v-model:page="logData.p" v-model:row="logData.limit" :total="logData.total" @change="getList()"></bt-table-page>
			</template>
		</bt-table-group>
	</div>
</template>

<script lang="tsx" setup>
import { getList, initSafeLog, logData, tableColumn } from './useController'

interface Props {
	compData: any
}
const props = withDefaults(defineProps<Props>(), {
	compData: () => ({}),
})

// 页面加载完成
onMounted(() => {
	initSafeLog(props.compData)
})
</script>
