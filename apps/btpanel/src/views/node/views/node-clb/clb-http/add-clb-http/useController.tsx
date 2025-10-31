import { useClbHttpStore } from '../useStore'
const { addNodeData, isHttpClbEdit } = useClbHttpStore()

export const updateHttpClbNodeList = (params: any) => {
	console.log('params.nodes', params.nodes)
	if (params.nodes?.length > 0) {
		addNodeData.value.push(...params.nodes)
		params.nodes = []
		return addNodeData.value
	} else {
		return addNodeData.value
	}
}
