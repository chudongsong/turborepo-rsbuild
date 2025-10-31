<template>
	<div>
		<Header ref="HeaderRef"></Header>
		<div>
			<bt-tabs type="card" v-model="systemTabActive" :options="tabComponent" @tab-click="handleTabClick" />
			<bt-install-mask v-if="!firewallInfo.status" width="38rem">
				<template #content>
					<div class="content-mask">
						<i class="svgtofont-el-warning text-warning mr-[4px] !text-extraLarge"></i>
						<div class="flex items-center">
							未开启防火墙，请
							<span @click="openFirewall" class="bt-link">点击开启</span>
						</div>
					</div>
				</template>
			</bt-install-mask>

			<bt-dialog v-model="showLogDialog" width="50rem" title="正在初始化防火墙，请稍后..." :area="54" :showClose="false">
				<div class="flex flex-col bg-darkPrimary text-white leading-[2.2rem] h-[30rem] overflow-y-auto p-[1rem]" v-html="logContent"></div>
			</bt-dialog>
		</div>
	</div>
</template>

<script setup lang="ts">
import { getFirewallInfoEvent, statusFilterKey, showLogDialog, logContent } from '@firewall/useMethod'
import { getFirewallStore } from '@firewall/useStore'

import Header from './header/index.vue'

const {
	refs: { firewallInfo, systemTabActive },
} = getFirewallStore()

const HeaderRef = ref() // 头部组件

const tabComponent = reactive([
	{
		label: '端口规则：' + (firewallInfo.value.port ?? '获取中...'),
		name: 'port',
		render: () => import('./port-rules/index.vue'),
	},
	{
		label: 'IP规则：' + (firewallInfo.value?.ip || '获取中...'),
		name: 'ip',
		lazy: true,
		render: () => import('./ip-rules/index.vue'),
	},
	{
		label: '端口转发：' + (firewallInfo.value?.trans || '获取中...'),
		name: 'forward',
		lazy: true,
		render: () => import('./port-transmit/index.vue'),
	},
	{
		label: '地区规则：' + (firewallInfo.value?.country || '获取中...'),
		name: 'area',
		lazy: true,
		render: () => import('./area-rules/index.vue'),
	},
	{
		label: '恶意IP自动封禁：' + (firewallInfo.value?.banned || '获取中...'),
		name: 'banned',
		lazy: true,
		render: () => import('./ip-banned/index.vue'),
	},
])

/**
 * @description 防火墙开启
 */
const openFirewall = async () => {
	HeaderRef.value.onChangeFirewall(true)
}

const handleTabClick = (tab: any) => {
	statusFilterKey.value = 'ALL'
}

watch(
	() => firewallInfo.value,
	val => {
		if (val) {
			const { port, ip, trans, country, banned } = val
			tabComponent[0].label = '端口规则：' + port
			tabComponent[1].label = 'IP规则：' + ip
			tabComponent[2].label = '端口转发：' + trans
			tabComponent[3].label = '地区规则：' + country
			tabComponent[4].label = '恶意IP自动封禁：' + banned
		}
	}
)

onMounted(() => {
	getFirewallInfoEvent()
})

onUnmounted(() => {
	systemTabActive.value = 'port'
})
</script>

<style scoped></style>
