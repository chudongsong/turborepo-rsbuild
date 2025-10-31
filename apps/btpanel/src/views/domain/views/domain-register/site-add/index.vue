<template>
	<div class="site-add-wrap">
		<BtTabs v-model="tabs" class="min-h-[400px]" />
	</div>
</template>

<script setup lang="tsx">
import { useTabs } from '@/hooks/tools'
import { useSiteAddStore } from './useStore'
const { domainId, domainName, createSiteType } = useSiteAddStore()

interface Props {
	compData?: {
		domainId?: number
		domainName?: string
		type?: 'domain' | 'local'
	}
}

const props = withDefaults(defineProps<Props>(), {
	compData: () => ({})
})
if (props.compData?.domainId) {
	domainId.value = props.compData.domainId
}

if (props.compData?.domainName) {
	domainName.value = props.compData.domainName
}

if (props.compData?.type) {
	createSiteType.value = props.compData.type
}

const activeTab = ref('php')
const { BtTabs, tabs, tabsRefs } = useTabs({
	value: activeTab,
	type: 'card',
	options: [
		{ label: 'PHP站点', name: 'php', lazy: true, render: () => import('./views/php-site/index.vue') },
		{ label: '反向代理', name: 'proxy', lazy: true, render: () => import('./views/reverse-proxy/index.vue') },
	],
})

const onConfirm = (close?: any) => {
	const refMap: any = tabsRefs && tabsRefs()
	const name = (activeTab as any).value
	const target = refMap?.[name]
	if (target?.onConfirm) return target.onConfirm(close)
	return false
}

onUnmounted(() => {
	domainName.value = ''
	domainId.value = 0
	createSiteType.value = 'domain'
})

defineExpose({ onConfirm })
</script>

<style scoped lang="scss">
.site-add-wrap {
	padding: 2rem;
}
</style>


