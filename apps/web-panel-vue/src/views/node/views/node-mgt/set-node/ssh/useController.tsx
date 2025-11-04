import { useDataHandle, useConfirm } from '@/hooks/tools'
import { nodeSSHDelApi } from '@/api/node'
import { Message } from '@/hooks/tools'
import { useNodeStore } from '@node/useStore'
const { setNodeSSHisSet, setNodeInfo, isRefreshNodeList, sshTerminalVisible } = useNodeStore()

export const nodeSSHDelHandle = async (id: any) => {
	await useConfirm({
		icon: 'warning-filled',
		title: `提示`,
		content: `即将删除节点SSH，是否继续操作？`,
	})
	await useDataHandle({
		loading: '正在删除节点，请稍后...',
		request: nodeSSHDelApi({ node_id: id }),
		message: true,
		success: (res: any) => {
			if (res.status) {
				Message.success('删除成功')
				setNodeInfo.value.ssh_conf = {}
				isRefreshNodeList.value = true
				setNodeSSHisSet.value = false
				sshTerminalVisible.value = false
			} else {
				Message.error(res.msg || '删除失败')
			}
		},
	})
}
