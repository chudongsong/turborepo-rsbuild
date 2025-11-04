<template>
	<div>
		<bt-tabs v-if="pluginInfo.setup && pluginInfo.endtime > 0" type="card" v-model="phpTabActive" :options="tabComponent" />
		<bt-product-introduce v-else :data="productData" class="px-[20%] my-[8rem]" />
	</div>
</template>

<script lang="tsx" setup>
import { getPluginStatus } from '@firewall/useMethod'
import { getFirewallStore } from '@firewall/useStore'

const {
	refs: { phpTabActive },
} = getFirewallStore()

const pluginInfo = ref<AnyObject>({})

const productData = reactive({
	title: 'PHP网站安全-功能介绍',
	ps: '基于PHP内核的监控工具，实时监控网站木马、漏洞等其他入侵行为，发现木马支持自动隔离，（不支持32位系统和arm平台和PHP5.2）',
	source: 112,
	desc: ['PHP内核实时监控', '实时监控网站木马、漏洞', '支持自动隔离'],
	tabImgs: [],
	isInstall: false,
	productSrc: 'https://www.bt.cn/Public/new/plugin/introduce/firewall/php_site_1.png',
	pluginInfo: {},
})

const tabComponent = reactive([
	{ label: '首页', name: 'home', render: () => import('./home/index.vue') },
	{
		label: '网站管理',
		name: 'site',
		render: () => import('./site-list/index.vue'),
	},
	{
		label: '木马隔离箱',
		name: 'isolation',
		render: () => import('./isolation-box/index.vue'),
	},
	{
		label: '白名单',
		name: 'white',
		render: () => import('./white-list/index.vue'),
	},
	{
		label: 'PHP模块',
		name: 'php',
		render: () => import('./php-modules/index.vue'),
	},
	{
		label: '告警设置',
		name: 'alert',
		render: () => import('./alert/index.vue'),
	},
])

onMounted(async () => {
	// 存在显示问题 需要调整公共组件
	pluginInfo.value = await getPluginStatus('security_notice')
	productData.pluginInfo = pluginInfo.value
	let arr = pluginInfo.value.introduction.split(';')
	arr.forEach((item: any, index: number) => {
		productData.tabImgs.push({
			title: item.split('|')[0],
			imgSrc: `https://www.bt.cn/Public/new/plugin/introduce/firewall/php_site_${item.split('|')[1]}`,
		} as never)
	})
	// if (pluginInfo.value.setup && authType.value === 'ltd') getIntrusionInfo()
})
</script>
