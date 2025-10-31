<template>
	<BtTabs @change="changeHandler" />
</template>

<script setup lang="tsx">
import { getCommonData,rowData,tabActive,getLogContent,unMountedler } from './useController';
import { useTabs } from '@/hooks/tools';

import AddProxyTcp from '@site/views/reverse-proxy-model/add-reverse-proxy/add-proxy-tcp.vue'


const props = defineProps({
	compData: {
		type: Object,
		default: () => ({}),
	},
})

const { BtTabs } = useTabs({
	type: 'left-bg-card',
	value: tabActive,
	options: [
		{
			label: 'TCP/UDP代理',
			name: 'proxy',
			lazy: true,
			render: () => <AddProxyTcp compData={{isEdit:true,row:props.compData.row}} />,
		},
		{
			label: '自定义配置',
			name: 'custom',
			lazy: true,
			render: () => import('@site/views/reverse-proxy-model/tcp-proxy/setting-custom.vue'),
		},
		// {
		// 	label: 'IP黑名单',
		// 	name: 'ipBlackList',
		// 	lazy: true,
		// 	render: () => import('@site/views/reverse-proxy-model/tcp-proxy/setting-ip-list.vue'),
		// },
		// {
		// 	label: 'IP白名单',
		// 	name: 'ipWhiteList',
		// 	lazy: true,
		// 	render: () => import('@site/views/reverse-proxy-model/tcp-proxy/setting-ip-list.vue'),
		// },
		{
			label: '日志',
			name: 'siteLogs',
			lazy: true,
			render: () => import('@site/views/reverse-proxy-model/tcp-proxy/setting-log.vue'),
		},
	],
});

onMounted(() => {
	rowData.value = props.compData.row
})

const changeHandler = (val: string) => {
	if (val !== 'siteLogs') {
		getCommonData()
	} else {
		getLogContent()
	}
}

onUnmounted(() => {
	unMountedler()
})

</script>

<style lang="css" scoped>
</style>
