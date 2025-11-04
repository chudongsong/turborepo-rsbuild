<template>
	<div height="500px">
		<div class="flex justify-between items-center">
			<span class="pr-[1rem]">
				root 密码：
				<span v-if="setNodeSSHisSet">已设置</span>
				<span v-else class="cursor-pointer underline" @click="sshEditHandle(setNodeInfo)">未设置</span>
			</span>
			<div>
				<span v-if="setNodeSSHisSet">
					<span class="cursor-pointer bt-link" @click="showTerminal">终端</span>
					<el-divider direction="vertical"></el-divider>
				</span>
				<span @click="sshEditHandle(setNodeInfo)" class="cursor-pointer bt-link">编辑</span>
				<span v-if="setNodeSSHisSet">
					<el-divider direction="vertical"></el-divider>
					<span class="cursor-pointer bt-link" @click="nodeSSHDelHandle(setNodeInfo?.id)">删除</span>
				</span>
			</div>
		</div>
		<div class="my-[16px] text-tertiary">* 保存root密码用于终端或者节点功能调用</div>
		<div class="h-[44rem] overflow-hidden bg-white dark:bg-[#1D1E1F] mt-[10px]">
			<div v-if="sshTerminalVisible" class="terminal-view">
				<BtTerminal :ref="terminal" :active="true" id="nodeTerminal" :host-info="setNodeInfo?.ssh_conf || {}" class="h-[43rem] p-[8px]" />
			</div>
			<div v-else style="height: 44rem"></div>
		</div>
	</div>
</template>

<script lang="tsx" setup>
import { useDialog, useDataHandle, Message } from '@/hooks/tools'
import { useNodeStore } from '@node/useStore'
import { nodeSSHDelHandle } from './useController'
import { nodeSSHPort } from '@api/node'
import { isNil } from 'ramda'

const { setNodeInfo, setNodeSSHisSet, sshTerminalVisible } = useNodeStore()

const terminal = ref<any>()
function showTerminal() {
	sshTerminalVisible.value = !sshTerminalVisible.value
}
const sshEditHandle = async (row?: any) => {
	if (!row) return
	const { id, ssh_conf = {}, server_ip } = row
	console.log(setNodeInfo.value, 'setNodeInfo.value')
	if (isNil(ssh_conf.host)) {
		const loading = Message.load('正在获取SSH端口信息...')
		const { data: res } = await nodeSSHPort({ node_id: id })
		if (!res.status) Message.error(res.msg || '获取SSH端口信息失败')
		ssh_conf.port = res.data.port
		loading?.close()
	}
	useDialog({
		title: '编辑root账号信息',
		area: 50,
		compData: {
			node_id: id,
			server_ip,
			ssh_conf: ssh_conf || {},
		},
		btn: ['保存'],
		component: () => import('@/views/node/views/node-mgt/set-node/ssh/ssh-edit.vue'),
	})
}
onMounted(() => {
	const info = setNodeInfo.value || {}
	const sshConf = info.ssh_conf || {}
	if (sshConf.host) {
		setNodeSSHisSet.value = true
	} else {
		sshEditHandle(info)
	}
})
onUnmounted(() => {
	setNodeSSHisSet.value = false
	sshTerminalVisible.value = false
})
</script>

<style lang="scss" scoped>
.terminal-view {
	@apply bg-black dark:bg-[#000] w-full h-[44rem] p-[8px];
}
</style>
