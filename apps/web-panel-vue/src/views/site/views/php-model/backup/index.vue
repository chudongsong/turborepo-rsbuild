<template>
	<div class="p-[20px] h-full">
		<bt-tabs type="card" v-model="tabActive" :options="tabComponent" class="bt-tabs bt-tabs-card"></bt-tabs>
	</div>
</template>
<script lang="tsx" setup>
const IncrementBackup = defineAsyncComponent(() => import('@site/views/php-model/backup/increment-backup/index.vue'))
const RouteBackup = defineAsyncComponent(() => import('@site/views/php-model/backup/route-backup/index.vue'))

interface Props {
	compData?: any
}
const props = withDefaults(defineProps<Props>(), {
	compData: () => [],
})

const tabActive = ref('routeBackup') // tab默认选中

const tabComponent = [
	{
		label: '常规备份',
		name: 'routeBackup',
		lazy: true,
		render: () => <RouteBackup compData={props.compData} />,
	},
	{
		label: '增量备份',
		name: 'incrementBackup',
		lazy: true,
		render: () => <IncrementBackup compData={props.compData} />,
	},
]
</script>
<style lang="css" scoped>
.change-label-class :deep(.el-form-item__label) {
	min-width: 4.8rem;
	margin-right: 1rem;
}

.text-wrapper {
	white-space: pre-wrap;
}

.el-empty__image {
	width: 60px !important;
}
</style>
