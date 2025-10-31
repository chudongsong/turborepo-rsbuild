<template>
	<config-rows :label="'面板云端通讯节点配置'">
		<template #value>
			<div class="w-[26rem]">
				<el-input :value="getNodeIsRequest ? '正在测试节点连接速度...' : panelConfig.panelNode" :disabled="true"></el-input>
			</div>
			<el-button type="primary" class="!ml-12px" @click="onSet">设置</el-button>
			<bt-dialog :title="'面板云端通讯节点配置'" class="overflow-hidden" v-model="showPopup" :area="42" :show-footer="true" @confirm="onConfirm">
				<div class="p-20px">
					<div v-show="getNodeIsRequest" class="text-center text-danger" style="margin-bottom: 1rem">
						<span>温馨提示：正在对每个节点进行测速，请耐心等待</span>
					</div>
					<el-form :style="getNodeIsRequest ? '' : 'margin-top: 1rem'">
						<el-form-item :label="'云端通讯节点'" label-width="12rem">
							<el-select v-model="nodeId" placeholder="请选择" class="!w-[18rem]" :disabled="getNodeIsRequest">
								<el-option v-for="item in nodeConfig" :key="item.node_id" :label="item.node_name" :value="item.node_id"> </el-option>
							</el-select>
						</el-form-item>
					</el-form>
				</div>
			</bt-dialog>
		</template>
		<template #desc>
			<span>请勿随意调整节点配置，仅获取云端数据出现未响应或错误时，可尝试切换该节点</span>
		</template>
	</config-rows>
</template>

<script lang="ts" setup>
import { getNodeConfig, setNodeConfig } from '@/api/config'
import { useDataHandle } from '@hooks/tools'
import { getConfigStore } from '@/views/config/useStore'

import ConfigRows from '@config/public/config-rows-new'
import { isArray } from '@/utils'

const {
	refs: { panelConfig },
} = getConfigStore()

// 弹窗开关
const showPopup = ref(false)
// 选中的请求方式的node_id
const nodeId = ref<any>('正在测试节点连接速度...')
const getNodeIsRequest = ref(false)
const nodeConfig = ref<any>([])

const getNodeEvent = async () => {
	if (getNodeIsRequest.value) {
		return // 如果请求正在进行，直接返回，避免重复请求
	}
	getNodeIsRequest.value = true // 请求开始，设置标志位
	try {
		const { data } = await getNodeConfig()
		if (isArray(data)) {
			nodeConfig.value = data
			const result: any = data.filter((item: any) => item.status === 1)[0]
			panelConfig.value.panelNode = result?.node_name || '--'
			panelConfig.value.panelNodeId = result?.node_id || 0
		}
	} catch (error) {
		console.error('请求出错:', error)
	} finally {
		getNodeIsRequest.value = false // 请求结束，重置标志位
	}
}

// 设置
const onSet = async () => {
	showPopup.value = true
	const lastTimeString = localStorage.getItem('panelNodeLastTime')
	const currentTime: number = Date.now()
	if (lastTimeString !== null) {
		const lastTime: number = parseInt(lastTimeString, 10) // 将字符串转换为数字

		const elapsedTime = currentTime - lastTime

		if (elapsedTime > 60000) {
			await getNodeEvent()
			localStorage.setItem('panelNodeLastTime', currentTime.toString())
		}
	} else {
		await getNodeEvent()
		localStorage.setItem('panelNodeLastTime', currentTime.toString()) // 第一次打开时设置时间
	}
}

/**
 * @description: 设置云端请求节点
 */
const onConfirm = async () => {
	await useDataHandle({
		loading: '正在设置启用节点，请稍候...',
		request: setNodeConfig({ node_id: nodeId.value }),
		message: true,
		success: rdata => {
			if (rdata.status) {
				getNodeEvent()
			}
		},
	})
}

watch(
	() => getNodeIsRequest.value,
	newVal => {
		if (newVal) {
			nodeId.value = '正在测试节点连接速度...'
		} else {
			nodeId.value = panelConfig.value.panelNodeId
		}
	}
)

onMounted(async () => getNodeEvent())
</script>
