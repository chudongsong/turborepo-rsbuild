<template>
	<div>
		<AddProxyHttp ref="addProxyHttpRef" />
	</div>
</template>
<script setup lang="tsx">
import { useDataHandle, useTabs } from '@/hooks/tools'

import AddProxyHttp from './add-proxy-http.vue'
import AddProxyTcp from './add-proxy-tcp.vue'
import { SITE_PROXY_STORE } from '../useStore'

const { proxyType } = storeToRefs(SITE_PROXY_STORE())
const tabType = ref('http')
const emits = defineEmits(['close'])
const addProxyHttpRef = ref()

const {
	BtTabs,
	tabs: tabsActive,
	tabsRefs,
} = useTabs({
	type: 'card',
	value: tabType,
	options: [
		{
			label: 'HTTP',
			name: 'http',
			render: () => <AddProxyHttp />,
		},
		// {
		// 	label: 'TCP/UDP',
		// 	name: 'tcp',
		// 	lazy: true,
		// 	render: () => <AddProxyTcp />,
		// },
	],
})

defineExpose({
	onConfirm: () => {
		switch (tabsActive.value) {
			case 'http':
				addProxyHttpRef.value.onConfirm(emits)
				break
			case 'tcp':
				tabsRefs().tcp.onConfirm(emits)
				break
		}
	},
})

onMounted(() => {
	tabType.value = proxyType.value
})
</script>
