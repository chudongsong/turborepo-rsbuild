<template>
	<bt-tabs class="w-full h-full" type="left-bg-card" v-model="defaultActive" :options="tabComponent" />
</template>
<script lang="ts" setup>
interface Props {
	compData?: any
}
const props = withDefaults(defineProps<Props>(), {
	compData: () => {},
})

const defaultActive = ref(typeof props.compData === 'string' ? props.compData : 'setDefaultPage') // 菜单默认展开项

const tabComponent = ref([
	{
		label: '修改默认页面',
		name: 'setDefaultPage',
		lazy: true,
		render: () => import('@site/views/php-model/advanced-setting/default-page.vue'),
	},
	{
		label: '默认站点',
		name: 'defaultSite',
		lazy: true,
		render: () => import('@site/views/php-model/advanced-setting/defalut-site.vue'),
	},
	{
		label: 'PHP命令行版本',
		name: 'phpCommandLine',
		lazy: true,
		render: () => import('@site/views/php-model/advanced-setting/php-command.vue'),
	},
	{
		label: 'HTTPS管理',
		name: 'httpsOfficersSite',
		lazy: true,
		render: () => import('@site/views/php-model/advanced-setting/anti-channel-site.vue'),
	},
	{
		label: 'TLS设置',
		name: 'tlsSetting',
		lazy: true,
		render: () => import('@site/views/php-model/advanced-setting/tls-setting.vue'),
	},
	{
		label: '全局设置',
		name: 'globalSetting',
		lazy: true,
		render: () => import('@site/views/php-model/advanced-setting/global-setting.vue'),
	},
	{
		label: '关联数据库',
		name: 'associatedDatabase',
		lazy: true,
		render: () => import('@site/views/php-model/advanced-setting/associated-database.vue'),
	},
	// {
	// 	title: '网站配置',
	// 	type: 'siteConfig',
	// 	component: () => import('@site/views/php-model/advanced-setting/website-config.vue'),
	// },
	// {
	// 	title: 'DNS管理',
	// 	type: 'dnsManagement',
	// 	component: () => import('@site/views/php-model/advanced-setting/dns-settings.vue'),
	// },
	// {
	// 	title: 'Nginx配置模板',
	// 	type: 'nginxConfigTemplate',
	// 	component: () => import('@site/views/php-model/advanced-setting/nginx-setting.vue'),
	// },
])

const releaseTab = ref(['associatedDatabase', 'siteConfig', 'dnsManagement', 'nginxConfigTemplate'])

onMounted(() => {
	// 若为正式版，则去除对应的tab
	// if (isRelease) {
	// 	tabComponent.value = tabComponent.value.filter(item => !releaseTab.value.includes(item.type))
	// }
})
</script>
