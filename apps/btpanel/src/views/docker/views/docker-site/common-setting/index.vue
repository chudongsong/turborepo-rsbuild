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
		label: '页面模板',
		name: 'setDefaultPage',
		lazy: true,
		render: () => import('@docker/views/docker-site/common-setting/default-page.vue'),
	},
	{
		label: '默认站点',
		name: 'defaultSite',
		lazy: true,
		render: () => import('@docker/views/docker-site/common-setting/defalut-site.vue'),
	},
	{
		label: 'HTTPS管理',
		name: 'httpsOfficersSite',
		lazy: true,
		render: () => import('@docker/views/docker-site/common-setting/anti-channel-site.vue'),
	},
])

onMounted(() => {})
</script>
