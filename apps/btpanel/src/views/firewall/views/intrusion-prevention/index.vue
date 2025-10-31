<template>
	<div>
		<div v-if="pluginInfo?.setup && pluginInfo.endtime > -1" class="flex flex-col">
			<!-- 头部信息 -->
			<Header :data="infoData" @refresh="getIntrusionInfo" />
			<bt-tabs type="card" v-model="tabActive" :options="tabrender" @change="cutTabs" />
		</div>
		<bt-product-introduce v-else :data="productData" class="px-[20%] my-[8rem]" />
	</div>
</template>

<script lang="tsx" setup>
import { getIntrusionData } from '@api/firewall'
import { useDataHandle } from '@hooks/tools'
import { useGlobalStore } from '@store/global'

import { getPluginStatus } from '../../useMethod'
import Header from './header/index.vue'

const { payment } = useGlobalStore()

const tabActive = shallowRef('overview') // 当前激活的tab
const infoData = ref() //概览数据
const pluginInfo = shallowRef<any>({}) // 插件信息
const productData = shallowReactive({
	title: '入侵防御-功能介绍',
	ps: '原防提权, 防御大多数的入侵提权攻击造成的挂马和被挖矿,有效拦截webshell执行提权,并及时告警通知',
	source: 105,
	desc: ['违规词内容检测', '网页内容修改检测', '输出检测报告'],
	tabImgs: [
		{
			title: '概览',
			imgSrc: 'https://www.bt.cn/Public/new/plugin/introduce/firewall/intrusion_1.png',
		},
		{
			title: '进程白名单',
			imgSrc: 'https://www.bt.cn/Public/new/plugin/introduce/firewall/intrusion_2.png',
		},
		{
			title: '操作日志',
			imgSrc: 'https://www.bt.cn/Public/new/plugin/introduce/firewall/intrusion_3.png',
		},
	],
	isInstall: false,
	productSrc: 'https://www.bt.cn/bbs/thread-50998-1-1.html',
	pluginInfo: {},
})

const tabrender = [
	{
		label: '概览',
		name: 'overview',
		render: () => import('./over-view/index.vue'),
	},
	{
		label: '进程白名单',
		name: 'white',
		render: () => import('./process-white/index.vue'),
	},
	{
		label: '操作日志',
		name: 'operationLog',
		render: () => import('./operation-log/index.vue'),
	},
]

/**
 * @description 切换tabs切换组件
 */
const cutTabs = (tab: string) => {
	if (tab === 'overview') getIntrusionInfo()
}

/**
 * @description: 获取入侵防御配置信息
 */
const getIntrusionInfo = async () => {
	const { data: res } = await useDataHandle({
		loading: '正在获取入侵防御配置信息，请稍后...',
		request: getIntrusionData(),
	})
	infoData.value = res
}

provide('infoData', infoData)
provide('getIntrusionInfo', getIntrusionInfo)

onMounted(async () => {
	pluginInfo.value = await getPluginStatus('bt_security')
	productData.pluginInfo = pluginInfo.value
	if (pluginInfo.value.setup && pluginInfo.value.endtime > -1) getIntrusionInfo()
})
</script>
