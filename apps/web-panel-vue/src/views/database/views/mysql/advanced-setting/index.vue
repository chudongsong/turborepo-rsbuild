<template>
	<bt-tabs class="w-full h-full" type="left-bg-card" v-model="defaultActive" :options="tabrender" :beforeLeave="checkLtd" />
</template>

<script setup lang="tsx">
import { useGlobalStore } from '@store/global'
import { productPaymentDialog } from '@/public/index'
interface Props {
	compData: string
}
const props = withDefaults(defineProps<Props>(), {
	compData: 'route',
})
const { payment } = useGlobalStore()
const authType = computed(() => payment.value.authType) // 授权类型

const checkLtd = (tab?: string) => {
	// 企业版才能使用日志审计
	if (authType.value !== 'ltd' && tab === 'audit') {
		productPaymentDialog({ sourceId: 340 }) // 弹出支付界面
		return false
	}
	return true
}

const defaultActive = ref((checkLtd(props.compData) ? props.compData : 'route') || 'route') // 菜单默认展开项

const tabrender = [
	{
		label: '数据库备份',
		name: 'route',
		lazy: true,
		render: () => defineAsyncComponent(() => import('@database/views/mysql/advanced-setting/database-back/index.vue')),
	},
	// {
	// 	label: '企业增量备份',
	// 	name: 'increment',
	// 	render: () => defineAsyncComponent(() => import('@database/public/backup/increment-back/index.vue')),
	// },
	{
		label: '用户管理',
		lazy: true,
		name: 'user',
		render: () => defineAsyncComponent(() => import('@database/views/mysql/advanced-setting/user-manger/index.vue')),
	},
	// {
	// 	label: '敏感词检测',
	// 	lazy: true,
	// 	name: 'sensitive',
	// 	render: () => defineAsyncComponent(() => import('@database/views/mysql/advanced-setting/sensitive-word/index.vue')),
	// },
	{
		label: '关联服务',
		lazy: true,
		name: 'service',
		render: () => defineAsyncComponent(() => import('@database/views/mysql/advanced-setting/associated-service/index.vue')),
	},
	{
		label: '守护进程',
		lazy: true,
		name: 'process',
		render: () => defineAsyncComponent(() => import('@database/views/mysql/advanced-setting/project-process/index.vue')),
	},
	{
		label: '等保加固',
		lazy: true,
		name: 'reinforce',
		render: () => defineAsyncComponent(() => import('@database/views/mysql/advanced-setting/reinforce/index.vue')),
	},
	// {
	// 	label: () => <span class="flex items-center">{'日志审计'}<i class="!mr-0 svgtofont-icon-ltd !text-extraLarge text-ltd"></i></span>,
	// 	lazy: true,
	// 	name: 'audit',
	// 	render: () => defineAsyncComponent(() => import('@database/views/mysql/advanced-setting/log-audit/index.vue')),
	// },
]
</script>

<style scoped></style>
