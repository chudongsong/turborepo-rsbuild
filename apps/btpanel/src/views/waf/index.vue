<template>
	<div class="flex flex-col ">
		<bt-tabs
			type="nav"
			v-model="tabAvtive"
			:config="tabComponent"
			@tab-click="cutTabs"
			class="bt-waf p-[1.2rem] m-[1.6rem] module-ui" />
	</div>
</template>

<script lang="ts" setup>
interface Props {
	title: string
	type: string
	active?: true
	component: any
}
const { proxy: vm }: any = getCurrentInstance()
const tabAvtive = ref('home')
const tabComponent = ref<Props[]>([
	{
		title: '概览',
		type: 'home',
		component: () => import('./components/BtwafHome/index.vue'),
	},
	{
		title: '攻击报表',
		type: 'report',
		component: () => {},
		// component: () => import('./components/SiteJavaModel.vue'),
	},
	{
		title: '全局设置',
		type: 'overall',
		component: () => {},
		// component: () => import('./components/SiteJavaModel.vue'),
	},
	{
		title: '站点设置',
		type: 'site',
		component: () => {},
		// component: () => import('./components/SiteJavaModel.vue'),
	},
	{
		title: '木马隔离箱',
		type: 'webshell',
		component: () => {},
		// component: () => import('./components/SiteJavaModel.vue'),
	},
	{
		title: '地区限制',
		type: 'regtions',
		component: () => {},
		// component: () => import('./components/SiteJavaModel.vue'),
	},
	{
		title: '封锁记录',
		type: 'history',
		component: () => {},
		// component: () => import('./components/SiteJavaModel.vue'),
	},
	{
		title: '操作日志',
		type: 'logs',
		component: () => {},
		// component: () => import('./components/SiteJavaModel.vue'),
	},
])

/**
 * @description 切换tabs切换组件
 * @param {string} tab 当前tabs的name
 */
const cutTabs = (tab: string) => {
	console.log(tab)
}
</script>
