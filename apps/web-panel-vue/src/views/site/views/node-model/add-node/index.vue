<template>
	<BtTabs v-show="!showAddProgress" class="p-2rem" />
	<pre ref="installShow" v-if="showAddProgress" class="whitespace-pre-wrap h-[40rem] overflow-auto bg-[#444] p-12px" v-html="addProgressData"></pre>
</template>

<script setup lang="tsx">
import { useMessage, useTabs } from '@/hooks/tools'
import { useSocketRequest } from '@/hooks/tools/socket/use-socket-request'
import { useSiteStore } from '@site/useStore'
import { getNodeConfig, nodeData } from '../useController'
import NodeProject from './node-project.vue'
import PmProject from './pm-project.vue'
import TraditionalProject from './traditional-project.vue'

const Message = useMessage() // 消息提示
const emit = defineEmits(['showFooterFun'])

const { isRefreshList } = useSiteStore()

const tabActive = ref('nodeProject') // 菜单默认展开项
// const nodeData = ref({}) // 配置数据，node版本，运行用户，包管理
const socketInstance = ref<any>(null) // socket方法实例
const installShow = ref() // 安装显示

const showAddProgress = ref(false) // 是否显示添加进度
const addProgressData = ref('正在执行添加脚本...') // 添加进度数据
provide('nodeData', nodeData) // 提供配置数据

const { BtTabs, tabsRefs } = useTabs({
	type: 'card',
	value: tabActive,
	options: [
		{
			label: '默认项目',
			name: 'nodeProject',
			lazy: true,
			render: NodeProject,
		},
		{
			label: 'PM2项目',
			name: 'pmProject',
			lazy: true,
			render: PmProject,
		},
		{
			label: '传统项目',
			name: 'traditionalProject',
			lazy: true,
			render: TraditionalProject,
		},
	],
})

/**
 * @description 获取具体容器编排数据
 * @param {object} params 参数
 */
const createNewSocket = async () => {
	socketInstance.value?.socketDestroy()
	// 创建ws连接
	const { socketRequest, socketDestroy } = useSocketRequest('/ws_modsoc', false)
	socketInstance.value = { socketRequest, socketDestroy }
	return new Promise((resolve, reject) => {
		resolve(socketInstance.value)
	})
}

const onWSReceive = async (data: any, close: any) => {
	// 有内容的时候才添加
	if (data.msg) {
		addProgressData.value = addProgressData.value + '\n' + data.msg
		if (installShow.value?.scrollHeight) installShow.value.scrollTop = installShow.value.scrollHeight // 滚动条置底
	}
	if (data.code === -1 && data.status) {
		Message.success('添加成功') // 提示添加完毕
		close() // 关闭所有弹窗
		isRefreshList.value = true
	} else if ([2, 3, 4, 5].includes(data.code) && !data.status) {
		Message.msg({
			message: data.msg,
			type: 'error',
			duration: 0,
			dangerouslyUseHTMLString: true,
			showClose: true,
		}) // 提示错误信息
		if (data.code === 5) {
			// 添加成功但又其他的问题，打开设置
			showAddProgress.value = false
			close()
			isRefreshList.value = true
			// 打开设置
			// openNodeSettingView(modulesTableParams.value.list[0])
		} else {
			showAddProgress.value = false
			emit('showFooterFun', true)
		}
	}
}

/**
 * @description 提交表单数据处理
 */
const onConfirm = async (close: any) => {
	const form = await tabsRefs()[tabActive.value].submit()
	if (form) {
		let params = {
			...form,
			mod_name: 'nodejs',
			sub_mod_name: 'com',
			def_name: 'create',
			ws_callback: 'create',
		}
		// 发送webSocket请求
		createNewSocket()
		socketInstance.value.socketRequest({
			params,
			onMessage: (data: any) => onWSReceive(data, close),
		})
		showAddProgress.value = true
		emit('showFooterFun', false)
	} else {
		console.log('no form,error submit!')
	}
	return
}

const getNodeData = async (isRefresh: boolean = false) => {
	nodeData.value = await getNodeConfig()
	if (isRefresh) Message.success('Node版本，刷新成功')
	return nodeData.value
}

provide('getNodeData', getNodeData)

onMounted(() => getNodeData)

defineExpose({ onConfirm })
</script>
