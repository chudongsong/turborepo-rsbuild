<template>
	<div>
		<div class="software-mask" v-if="!install"></div>
		<div class="software-install" v-if="!install">
			<div class="software-view" v-if="!install">
				<bt-icon icon="el-warning" :size="30" class="mr-[8px]" color="orange" />
				<span class="text-base font-black">未安装邮件服务器</span>
				<span class="bt-link text-base ml-8px" @click="getSoftwareInstall('mail_sys', 'i')">点击安装</span>
			</div>
		</div>
		<div>
			<div class="relative">
				<bt-tabs type="card" :options="menuList" v-model="menu" />
				<div class="absolute right-0 top-0">
					<bt-button @click="initEnvironmentEvent">环境初始化</bt-button>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="tsx" setup>
import { storeToRefs } from 'pinia'
import useMailStore from '@mail/useStore'
import { getSoftwareInstall } from '@mail/useMethod'
import Common from './common/index.vue'
import Bcc from './bcc/index.vue'
import Forward from './forward/index.vue'
import Backup from './backup/index.vue'
import Ip from './ip/index.vue'
import { initEnvironmentEvent, menu } from './useMethod'

const store = useMailStore()
const { install } = storeToRefs(store)

const menuList = [
	{ name: 'common', label: '通用设置', lazy: true, render: () => <Common /> },
	{ name: 'ip', label: 'IP池', lazy: true, render: () => <Ip /> },
	{ name: 'bcc', label: '密件抄送', lazy: true, render: () => <Bcc /> },
	{ name: 'forward', label: '邮件转发', lazy: true, render: () => <Forward /> },
	{ name: 'backup', label: '备份', lazy: true, render: () => <Backup /> },
]

// const onInstall = () => {
// 	if (!install.value || update.value) {
// 		installSoft('mail_sys')
// 		return
// 	}
// 	useDialog({
// 		title: '恢复邮件服务器环境',
// 		area: [560, 550],
// 		component: defineAsyncComponent(() => import('./env/index.vue')),
// 	})
// }

// const installSoft = async (name: string) => {}

// const onBind = () => {
// 	openNewRegister()
// }
</script>

<style lang="css" scoped>
.setting-title {
	font-size: var(--el-font-size-large);
	margin-bottom: 12px;
}

.software-mask {
	position: absolute;
	left: 0;
	top: 0;
	background-color: rgba(var(--el-color-white-rgb), 1);
	opacity: 0.7;
	height: 100%;
	width: 100%;
	z-index: 3000;
	border-radius: var(--el-border-radius-medium);
	/* // Assuming 'rounded-base' maps to 0.5rem */
}

.software-install {
	display: flex;
	justify-content: center;
}

.software-view {
	box-shadow: 0 0 10px 1px var(--el-fill-color);
	border: 1px solid var(--el-color-border-extra-light);
	display: flex;
	justify-content: center;
	align-items: center;
	padding: 16px;
	padding-left: 24px;
	padding-right: 24px;
	border-radius: var(--el-border-radius-small);
	position: absolute;
	z-index: 3008;
	background-color: rgba(var(--el-color-white-rgb), 1);
	margin: auto;
	width: fit-content;
	height: fit-content;
	right: 0;
	left: 0;
	top: 0;
	bottom: 0;
}
</style>
