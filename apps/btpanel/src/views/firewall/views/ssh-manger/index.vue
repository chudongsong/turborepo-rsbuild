<template>
	<div class="ssh-manger">
		<!-- 头部 -->
		<Header></Header>
		<!-- 三个菜单项 -->
		<bt-tabs type="card" v-model="sshTabActive" :options="tabComponent" />
	</div>
</template>

<script setup lang="ts">
import { getSSHInfoEvent } from '@firewall/useMethod'
import { getFirewallStore } from '@firewall/useStore'

import Header from './header/index.vue'

const {
	refs: { sshTabActive },
} = getFirewallStore()

const tabComponent = [
	{
		label: '基础设置',
		name: 'basic',
		lazy: true,
		render: () => import('./basic-setting/index.vue'),
	},
	{
		label: 'SSH系统账号管理',
		name: 'account',
		lazy: true,
		render: () => import('./system-account/index.vue'),
	},
	{
		label: 'SSH登录日志',
		name: 'login',
		lazy: true,
		render: () => import('@logs/views/ssh-log/index.vue'),
		// render: () => import('./login-log/index.vue'),
	},
]

onMounted(getSSHInfoEvent)
</script>

<style lang="scss" scoped>
.ssh-manger {
	:deep(.el-tabs .el-tabs__header) {
		width: 1370px!important;
		@media (max-width: 1630px) {
			width: 100%!important;
		}
	}
}
</style>
