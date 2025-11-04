<template>
	<div class="tab-header-operate !pl-0 !border-b-0">
		<div class="tab-header-item max-[1200px]:min-h-[13rem] px-24px mr-16px">
			<div class="setting flex items-center justify-between w-full">
				<div class="text-medium font-600">SSH服务</div>
				<el-switch :model-value="sshInfo.status" :width="36" @change="(val: boolean | string | number) => onChangeSsh(Boolean(val))" class=""></el-switch>
			</div>
			<span class="status mt-12px" :class="sshInfo.status ? 'status-on' : 'status-off'">SSH服务{{ sshInfo.status ? '已启用' : '已禁用' }}</span>
			<span class="status-text text-secondary mt-12px">当前状态：{{ sshInfo.status_text }}</span>
		</div>
		<div class="tab-header-item max-[1200px]:min-h-[10rem] px-24px flex items-center flex-1">
			<SshLoginStats />
		</div>
	</div>
</template>
<script lang="tsx" setup>
import { getFirewallStore } from '@firewall/useStore'
import { useConfirm } from '@hooks/tools'
import { setSsh } from '@/api/firewall'
import { getSSHInfoEvent } from '@/views/firewall/useMethod'
import { useDataHandle } from '@hooks/tools/data'
import SshLoginStats from '@/views/firewall/public/ssh-login-stats/index.vue'

const {
	refs: { sshInfo },
} = getFirewallStore()


/**
 * @description: SSH开关状态改变
 * @param {boolean} val
 */
const onChangeSsh = async (val: boolean) => {
	try {
		await useConfirm({
			title: 'SSH服务开关',
			content: val ? '确定启用SSH服务吗？' : '停用SSH服务后您将无法使用终端工具连接服务器，继续吗？',
		})
		
		await useDataHandle({
			loading: '正在' + (val ? '启用SSH服务' : '禁用SSH服务') + '，请稍后...',
			request: setSsh({ status: val ? '0' : '1' }),
			message: true,
		})
		
		sshInfo.status = val
		getSSHInfoEvent()
	} catch (error) {
		sshInfo.status = !val
	}
}

</script>

<style scoped lang="scss">
.tab-header-operate {
	height: auto;
	width: 1370px;
	@media (max-width: 1630px) {
		width: 100%;
	}
	@media (max-width: 1200px) {
		display: flex;
		align-items: flex-start;
		flex-direction: column;
		gap: 16px;
	}
}
.tab-header-item {
	display: flex;
	flex-direction: column;
	align-items: start;
	justify-content: center;
	border-width: 1px;
    border-color: var(--el-color-border-dark);
	border-radius: var(--el-border-radius-base);
	min-width: 28em;
	height: 13rem;
	
	@media (max-width: 1200px) {
		min-width: 100%;
		height: auto;
	}
	.status {
		border: 1px solid;
		padding: 4px 8px;
		border-radius: var(--el-border-radius-base);
	}
	.status-on {
		color: var(--el-color-primary);
		border-color: var(--el-color-primary);
	}
	.status-off {
		color: var(--el-color-danger);
		border-color: var(--el-color-danger);
	}
	&:hover {
		border-width: 1px;
		border-color: var(--el-color-primary);
		border-style: solid;
	}
	.total-progress {
		.info {
			display: flex;
			align-items: center;
			margin-bottom: 8px;
			
			.text {
				flex-shrink: 0;
			}
			
			.progress {
				flex: 1;
				min-width: 0;
			}
		}
	}
}

</style>