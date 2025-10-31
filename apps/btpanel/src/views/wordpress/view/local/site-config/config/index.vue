<template>
	<div>
		<BtTabs />
	</div>
</template>

<script lang="ts" setup>
import { useTabs } from '@/hooks/tools'

const menu = ref('directory')

const menuList: any = [
	{
		name: 'directory',
		label: '站点目录',
		lazy: true,
		render: () => import('@site/views/php-model/site-cataluge/cataluge-setting.vue'),
	},
	{
		name: 'file',
		label: '配置文件',
		lazy: true,
		render: () => import('@/views/wordpress/view/local/site-config/config/file.vue'),
	},
	{
		name: 'rewrite',
		label: '伪静态',
		lazy: true,
		render: () => import('@/views/wordpress/view/local/site-config/config/rewrite.vue'),
	},
	{
		name: 'redirect',
		label: '重定向',
		lazy: true,
		render: () => import('@/views/wordpress/view/local/site-config/config/redirect.vue'),
	},
	{
		name: 'proxy',
		label: '反向代理',
		lazy: true,
		render: () => import('@site/public/reverse-proxy/index.vue'),
	},
	{
		name: 'traffic',
		label: '流量控制',
		lazy: true,
		render: () => import('@/views/wordpress/view/local/site-config/config/traffic.vue'),
	},
]

const { BtTabs } = useTabs({
	type: 'card',
	options: menuList,
	value: menu,
})
</script>
