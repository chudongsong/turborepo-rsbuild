<template>
	<div class="deploy-status-info">
		<div class="site-list">
			<div class="site-item">
				<div class="site-header">网站</div>
			</div>
			<div v-for="(site, index) in sites" :key="site.url" class="site-item">
				<div class="site-header" @click="toggleSite(index)">
					<span
						>{{ site.url }}<span class="ml-[1rem]" :class="site.status ? 'text-primary' : 'text-red-500'">{{ site.status ? '(部署成功)' : '(部署失败)' }}</span></span
					>
					<i :class="['arrow', site.isExpanded ? 'arrow-down' : 'arrow-right']"></i>
				</div>
				<el-collapse-transition>
					<div v-show="site.isExpanded" class="error-details">
						<div class="error-content">
							{{ site.details }}
						</div>
					</div>
				</el-collapse-transition>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
const props = defineProps<{
	compData: AnyObject
}>()

const { faildList, successList } = props.compData

const sites = ref<any[]>([])

const toggleSite = (index: number) => {
	sites.value[index].isExpanded = !sites.value[index].isExpanded
}

onMounted(() => {
	sites.value = Array.prototype.concat(faildList, successList).map(item => ({
		url: item.siteName,
		details: item.error_msg || '暂无错误日志',
		isExpanded: false,
		status: item.status,
	}))
})
</script>

<style scoped>
.deploy-status-info {
	padding: 16px;
}

.site-list {
	border: 1px solid var(--el-color-border-dark);
	border-radius: var(--el-border-radius-base);
}

.site-item {
	border-bottom: 1px solid var(--el-color-border-dark);
}

.site-item:last-child {
	border-bottom: none;
}

.site-header {
	padding: 12px 16px;
	cursor: pointer;
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.site-header:hover {
	background-color: var(--el-fill-color-light);
}

.error-details {
	background-color: var(--el-base-primary);
}

.error-content {
	padding: 12px 16px;
	color: var(--el-color-text-disabled);
}

.arrow {
	border: solid var(--el-base-tertiary);
	border-width: 0 2px 2px 0;
	display: inline-block;
	padding: 3px;
	transition: transform 0.3s;
}

.arrow-right {
	transform: rotate(-45deg);
}

.arrow-down {
	transform: rotate(45deg);
}
</style>
