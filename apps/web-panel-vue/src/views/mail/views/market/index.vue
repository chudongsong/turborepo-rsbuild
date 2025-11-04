<template>
	<div>
		<bt-tabs type="card" :options="tabComponent" v-model="menu" @change="changeMenu" />
	</div>
</template>

<script lang="tsx" setup>
import Overview from './overview/index.vue'
import Task from './task/index.vue'
import Contact from './contact/index.vue'
import Mail from './mail/index.vue'
import Invalid from './invalid/index.vue'
import Template from './template/index.vue'
import { menu, taskShowVisible, tempId } from './useMethod'

const tabComponent = ref([
	{
		label: '概览',
		name: 'overview',
		lazy: true,
		render: () => <Overview />,
	},
	{
		label: '发送任务',
		name: 'task',
		lazy: true,
		render: () => <Task />,
	},
	{
		label: '模板',
		name: 'template',
		lazy: true,
		render: () => <Template />,
	},
	{
		label: '订阅者',
		name: 'contact',
		lazy: true,
		render: () => <Contact />,
	},
	{
		label: '群组',
		name: 'mail',
		lazy: true,
		render: () => <Mail />,
	},
	{
		label: '无效列表',
		name: 'invalid',
		lazy: true,
		render: () => <Invalid />,
	},
])

const changeMenu = (val: string) => {
	taskShowVisible.value = false
	tempId.value = null
}
</script>
