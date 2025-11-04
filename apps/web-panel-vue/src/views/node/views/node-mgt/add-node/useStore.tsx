import { defineStore, storeToRefs } from 'pinia'

import { NodeRowProps, NodeTableRowProps } from '@/types/node'
import { useGlobalStore } from '@/store/global'

// 新建文件当前组件新建store文件夹，按组件模块来设计数据
// 命名标准：(子路由/路由 + 组件名) FTP_ADD_USER
const NODE_ADD_STORE = defineStore('NODE-ADD-STORE', () => {
	const globalStore = useGlobalStore()
	const { panel } = storeToRefs(globalStore)

	const addNodeRef = ref() // 表单ref
	const nodeForm = ref<NodeTableRowProps | NodeRowProps>({
		address: '',
		api_key: '',
		category_id: '0',
		remarks: '',
	}) // 表单数据
	const isEdit = ref(false) // 是否编辑
	const isVerify = ref(false) // 是否验证

	return {
		isEdit,
		addNodeRef, // 表单ref
		nodeForm, // 表单数据
		isVerify, // 是否验证
	}
})

/**
 * @description 节点新增全局数据
 * @returns {Ref<Record<string, any>>}
 */

const useNodeAddStore = () => {
	return storeToRefs(NODE_ADD_STORE())
}

export { useNodeAddStore, NODE_ADD_STORE }
