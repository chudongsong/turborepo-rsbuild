<template>
<div>
		<bt-tabs v-if="pluginInfo.setup && pluginInfo.endtime > 0" type="card" v-model="networkActive" :options="tabComponent" />
		<bt-product-introduce v-else :data="productData" class="px-[20%] my-[8rem]" />
	</div>
</template>

<script lang="tsx" setup>
import { getPluginStatus } from '@firewall/useMethod'
import { getFirewallStore } from '@firewall/useStore'

const { refs: { networkActive } } = getFirewallStore();  
const pluginInfo = ref<AnyObject>({})
const productData = reactive({
	title: '扫描感知-功能介绍',
	ps: '一款堡塔扫描感知，全天识别恶意扫描服务器的恶意IP',
	source: 117,
	desc: ['防止恶意扫描攻击', '快速定位异常流量'],
	tabImgs: [
		{
			title: '概览',
			imgSrc:'https://www.bt.cn/Public/new/plugin/introduce/firewall/network_scan/1.png'
		},
		{
			title: '封锁记录',
			imgSrc:'https://www.bt.cn/Public/new/plugin/introduce/firewall/network_scan/2.png'
		},
		{
			title: '操作日志',
			imgSrc:'https://www.bt.cn/Public/new/plugin/introduce/firewall/network_scan/3.png'
		},
		{
			title: '实时日志',
			imgSrc:'https://www.bt.cn/Public/new/plugin/introduce/firewall/network_scan/4.png'
		}
	],
	isInstall: false,
	productSrc: 'https://www.bt.cn/Public/new/plugin/introduce/firewall/network_scan/1.png',
	pluginInfo: {},
})

const tabComponent = [
	{
		label: '概览',
		name: 'home',
		render: () => import('./home/index.vue')
	},
	{
		label: '封锁记录',
		name: 'blockde',
		lazy: true,
		render: () => import('./blockde/index.vue')
	},
	{
		label: '操作日志',
		name: 'operationLog',
		lazy: true,
		render: () => import('./operation/index.vue')
	},
	{
		label: '实时日志',
		name: 'realTimeLog',
		lazy: true,
		render: () => import('./realtime/index.vue')
	}
]

onMounted(async () => {
	// 存在显示问题 需要调整公共组件
	pluginInfo.value = await getPluginStatus('networkscan')
	productData.pluginInfo = pluginInfo.value
})
</script>

<style lang="css" scoped>

</style>