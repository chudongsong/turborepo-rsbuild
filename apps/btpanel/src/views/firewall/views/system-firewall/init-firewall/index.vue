<template>
	<div class="flex flex-col w-[55rem]">
		<div class="mb-5">
			<div class="flex items-center mb-3">
				<i class="svgtofont-el-question-filled !text-iconLarge text-warning mr-2"></i>
				<span class="text-warning text-subtitleLarge font-bold">检测到需要迁移旧的防火墙到新的服务中</span>
			</div>
			<ul class="list-disc pl-5">
				<li class="text-base mb-2">仅对面板的防火墙功能进行迁移，不会影响系统防火墙（firewall/ufw）已有的规则将会被保留</li>
				<li class="text-base mb-2">如果使用过iptables命令行添加过的非持久化的规则将会丢失！请注意持久化或保存iptables规则</li>
			</ul>
		</div>
		<div class="flex justify-center py-4">
			<el-button type="primary" :loading="loading" @click="handleInitFirewall">立即迁移</el-button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { setFirewallInitStatus } from '@api/firewall'
import { checkFirewallLog } from '@/views/firewall/useMethod'
import { useMessage, useConfirm } from '@/hooks/tools'

const Message = useMessage()
const loading = ref(false)

/**
 * @description 初始化防火墙
 */
const handleInitFirewall = async () => {
	try {
		// 弹出确认框
		await useConfirm({
			title: '迁移防火墙数据',
			content: '即将迁移防火墙数据，firewalld/ufw会重载，iptables规则可能会清理，请确认持久化了iptables规则后再操作），是否继续操作？',
			confirmText: '确认',
			cancelText: '取消',
		})
		loading.value = true
		const { data: res } = await setFirewallInitStatus()
		if (res && res.status) {
			setTimeout(() => {
				checkFirewallLog(res.task_id)
			}, 500)
		}
		Message.request(res)
	} finally {
		loading.value = false
	}
}
</script>
