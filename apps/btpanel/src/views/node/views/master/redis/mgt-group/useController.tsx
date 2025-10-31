import { useDialog, Message } from '@/hooks/tools'
import { removeRedisGroupSlave, getAvailableNodes, reconnectRedisSlave, getGroupDetail } from '@/api/node'
import { useMasterRedisStore } from '../useStore'
import { useConfirm } from '@/hooks/tools'
import { useDataHandle } from '@/hooks/tools'

const { redisGroupDetail, isRedisRefreshList } = useMasterRedisStore()

type SlaveNodeActionOptions = {
	row: any
	slaveListLoad: any
	api: (params: { group_id: any; slave_node_id: any }) => Promise<any>
	loadingText: string
	needConfirm?: boolean
	confirmOptions?: {
		icon: string
		title: string
		content: string
	}
}

const operateSlaveNode = async (options: SlaveNodeActionOptions) => {
	const { row, slaveListLoad, api, loadingText, needConfirm, confirmOptions } = options
	const slave_node_id = row.data.node_id
	const group_id = redisGroupDetail.value.group_info.group_id
	try {
		if (needConfirm && confirmOptions) {
			await useConfirm(confirmOptions)
		}
		await useDataHandle({
			loading: loadingText,
			request: api({ group_id, slave_node_id }),
			message: true,
			success: async (res: any) => {
				slaveListLoad.value = true
				const { data } = await getGroupDetail({ group_id })
				redisGroupDetail.value.slave_details = data.data.slave_details
				slaveListLoad.value = false
				isRedisRefreshList.value = true
			},
		})
	} catch (err) {
		console.warn(err)
	}
}

export const addSlaveNode = async (group_detail?: any) => {
	const group_id = group_detail.group_info?.group_id
	const loading = Message.load('正在获取可用从节点，请稍后...')
	try {
		const { data: res } = await getAvailableNodes()
		if (!res.status) Message.error(res.msg || '获取可用节点数据失败！')
		console.log('res.data', res.data.group_info)
		const filterNodes = res.data.filter((item: any) => item.group_info === null)
		useDialog({
			title: '添加从节点',
			area: 50,
			btn: ['添加从节点', '取消'],
			component: () => import('./add-slave-node.vue'),
			compData: {
				group_id,
				nodes: filterNodes || [],
			},
		})
	} catch (err) {
		console.warn(err)
	} finally {
		loading?.close()
	}
}

export const removeSlaveNode = (row: any, slaveListLoad: any) =>
	operateSlaveNode({
		row,
		slaveListLoad,
		api: removeRedisGroupSlave,
		loadingText: '正在移除从节点，请稍后...',
		needConfirm: true,
		confirmOptions: {
			icon: 'warning-filled',
			title: '移除从节点',
			content: '即将移除该从节点，是否继续操作？',
		},
	})

export const handleNodeRestart = (row: any, slaveListLoad: any) =>
	operateSlaveNode({
		row,
		slaveListLoad,
		api: reconnectRedisSlave,
		loadingText: '正在重连，请稍后...',
	})
