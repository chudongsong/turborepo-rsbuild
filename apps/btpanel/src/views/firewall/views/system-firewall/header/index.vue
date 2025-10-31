<template>
	<div class="tab-header-operate">
		<div class="mr-4">防火墙开关</div>
		<div>
			<el-switch v-model="firewallInfo.status" :width="36" @change="onChangeFirewall"></el-switch>
		</div>
		<div class="bg-darker w-[1px] h-2rem mx-8"></div>
		<div class="mr-4">禁ping</div>
		<div>
			<el-switch v-model="firewallInfo.ping" :width="36" @change="onChangePing"></el-switch>
		</div>
		<div class="bg-darker w-[1px] h-2rem mx-8"></div>
		<!-- <div class="flex items-center">
			<span>Web日志：</span>
			<span @click="openPathEvent({ path: logPath })" class="bt-link">
				{{ logPath || '--' }}
				<slot></slot>
			</span>
			<span class="mx-[0.4rem]">{{ logSize }}</span>
		</div>
		<el-button @click="getClearWebLogs(true)">清空</el-button> -->
		<el-button class="ml-[1rem]" @click="clearCache">清理缓存</el-button>
	</div>
</template>
<script lang="tsx" setup>
import { setFirewallStatus, setPing, clearCacheRequest } from '@/api/firewall'
import { getFirewallStatus } from '@firewall/useMethod'
import { getFirewallStore } from '@firewall/useStore'
import { useDataHandle, useDialog } from '@hooks/tools'
import { useConfirm } from '@hooks/tools'

const {
	refs: { firewallInfo },
} = getFirewallStore()


/**
 * @description: 防火墙开关
 */
const onChangeFirewall = async (val: boolean) => {
	firewallInfo.value.status = !val
	if (val) {
		useDialog({
			title: '启用系统防火墙',
			area: 46,
			component: () => import('@firewall/views/system-firewall/header/set-firewall.vue'),
			confirmText: '启用',
			showFooter: true,
			compData: {
				callback: () => {
					firewallInfo.value.status = val
				},
			},
		})
	} else {
		await useConfirm({
			icon: 'question-filled',
			title: val ? '启用系统防火墙' : '停用系统防火墙',
			content: val ? '推荐启用，启用系统防火墙后，可以更好的防护当前的服务器安全，是否继续操作？' : '停用系统防火墙，服务器将失去安全防护，是否继续操作？',
		})
		await useDataHandle({
			loading: '正在' + (val ? '启用系统防火墙' : '停用系统防火墙') + '，请稍后...',
			request: setFirewallStatus({ status: Number(val) }),
			message: true,
		})
		firewallInfo.value.status = val
	}

}

/**
 * @description: 禁ping
 */
const onChangePing = async (val: boolean) => {
	firewallInfo.value.ping = !val
	await useConfirm({
		icon: 'question-filled',
		title: val ? '禁Ping' : '解Ping',
		content: val ? '禁PING后不影响服务器正常使用，但无法ping通服务器，您真的要禁PING吗？' : '解除禁PING状态可能会被黑客发现您的服务器，您真的要解禁吗？',
	})

	await useDataHandle({
		loading: '正在' + (val ? '禁Ping' : '解Ping') + '，请稍后...',
		request: setPing({ status: val ? '0' : '1' }),
		message: true,
	})
	firewallInfo.value.ping = val
}


/**
 * @description: 清理缓存
 */
const clearCache = async () => {
	await useConfirm({
		icon: 'question-filled',
		title: '清理缓存',
		content: '清理缓存后，系统将重新加载，是否继续操作？',
	})
	await useDataHandle({
		loading: '正在清理缓存，请稍后...',
		request: clearCacheRequest(),
		message: true,
	})
	setTimeout(() => {
		window.location.reload()
	}, 1000)
}


/**
 * @description: 初始化
 */
const init = async () => {
	await getFirewallStatus()
}

onMounted(init)

defineExpose({ onChangeFirewall })
</script>
