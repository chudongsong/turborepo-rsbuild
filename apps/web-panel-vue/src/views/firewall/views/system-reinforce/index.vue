<template>
	<div>
		<div class="flex flex-col" v-if="pluginInfo?.setup && pluginInfo?.endtime >= 0">
			<!-- 头部开关 -->
			<div class="tab-header-operate">
				<div class="mr-4">系统加固开关</div>
				<div>
					<el-switch v-model="reinforceStatus" :width="36" @change="onChangeReinforce"></el-switch>
				</div>
			</div>

			<bt-tabs type="card" v-model="tabActive" :options="tabComponent" />
		</div>
		<bt-product-introduce v-else :data="productData" class="px-[20%] py-[2rem]"></bt-product-introduce>
	</div>
</template>

<script lang="tsx" setup>
import { getFirewallStore } from '@firewall/useStore'

import { getReinforceStatus, setOpen } from '@/api/firewall'
import { useDataHandle } from '@hooks/tools/data'
import { getPluginStatus } from '../../useMethod'

const {
	refs: { reinforceStatus },
} = getFirewallStore()

const pluginInfo = ref<AnyObject>({})
const tabActive = ref('reinforceConfig')

const productData = reactive({
	title: '系统加固-功能介绍',
	ps: '提供灵活的系统加固功能，防止系统被植入木马，支持服务器日志审计功能',
	source: 102,
	desc: ['阻止系统被植入木马', '加固系统安全配置'],
	tabImgs: [
		{
			title: '防护配置',
			imgSrc: 'https://www.bt.cn/Public/new/plugin/introduce/firewall/system_1.png',
		},
		{
			title: '封锁IP',
			imgSrc: 'https://www.bt.cn/Public/new/plugin/introduce/firewall/system_2.png',
		},
		{
			title: '操作日志',
			imgSrc: 'https://www.bt.cn/Public/new/plugin/introduce/firewall/system_3.png',
		},
	],
	isInstall: false,
	pluginInfo: {},
})

const tabComponent = [
	{
		label: '防护配置',
		name: 'reinforceConfig',
		lazy: true,
		render: () => import('./reinforce-config/index.vue'),
	},
	{
		label: '封锁IP',
		lazy: true,
		name: 'reinforceBlockIp',
		render: () => import('./blockade-ip/index.vue'),
	},
	{
		label: '操作日志',
		lazy: true,
		name: 'reinforceLog',
		render: () => import('./reinforce-log/index.vue'),
	},
]

/**
 * @description: 系统加固开关
 */
const onChangeReinforce = async (val: boolean) => {
	reinforceStatus.value = !val
	await useDataHandle({
		loading: '正在' + (val ? '开启' : '关闭') + '系统加固,请稍后...',
		request: setOpen(),
		message: true,
	})
	reinforceStatus.value = val
}

/**
 * @description: 获取系统加固配置信息
 */
const getReinforceInfo = async () => {
	const res = await useDataHandle({
		loading: '正在获取系统加固配置信息，请稍后...',
		request: getReinforceStatus(),
		data: { open: [Boolean, reinforceStatus] },
	})
	return res
}

onMounted(async () => {
	pluginInfo.value = await getPluginStatus('syssafe')
	productData.isInstall = pluginInfo.value.endtime >= 0
	productData.pluginInfo = pluginInfo.value
	// if (pluginInfo.value.setup && authType === 'ltd') getReinforceInfo()
})
</script>
