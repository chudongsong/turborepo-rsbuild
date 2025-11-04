<template>
	<div class="flex items-center">
		<i :class="`text-medium mr-[4px] ${svgIcon}`"></i>
		<div class="flex flex-1  items-center">
			<div class="mr-[12px] text-small min-w-[16rem] max-w-30rem">
				<span>{{ server.ip }}状态：</span>
				<span :style="`color:#${serverStatus.status ? '20a53a' : 'ef0808'}`">{{ serverStatus.msg }}</span>
			</div>
			<div class="flex items-center">
				<i class="svgtofont-icon-refresh text-base mr-[4px] text-primary"></i>
				<bt-link @click="refreshStatus">刷新</bt-link>
				<div class="flex items-center" v-if="serverStatus.error">
					<!-- <i class="svgtofont-el-warn-triangle-filled ml-[0.8rem] mr-[4px] text-primary"></i> -->
					<bt-link @click="showError" class="ml-8px">| 查看异常信息</bt-link>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { Message } from '@hooks/tools'
import { useCheckServerConnection } from '../../useMethod'
import { isUndefined } from '@utils/index'

interface Props {
	server: {
		sid: string | number
		ip: string
	}
}

const props = withDefaults(defineProps<Props>(), {
	server: () => ({
		sid: 0,
		ip: '',
	}),
})

const serverStatus = reactive({
	status: false, //状态
	msg: '检查中...', //状态信息
	error: false as boolean | string, //错误信息
}) // 服务器状态

const svgIcon = computed(() => {
	return serverStatus.status ? 'svgtofont-el-success-filled text-primary' : 'svgtofont-el-circle-close-filled text-[#EF0808]'
}) // 检测状态图标

/**
 * @description 刷新状态数据
 */
const refreshStatus = async () => {
	getStatus()
	Message.success('刷新成功')
}

/**
 * @description 显示错误信息
 */
const showError = () => {
	Message.msg({
		dangerouslyUseHTMLString: true,
		message: String(serverStatus.error) || '暂无异常信息',
		type: 'error',
		showClose: true,
		duration: 0,
	}) // 提示错误信息
}

/**
 * @description 获取服务器状态
 */
const getStatus = async () => {
	if (isUndefined(props.server.sid)) return Message.error('查询失败')
	serverStatus.msg = '连接中...'
	const { db_status, msg, err_msg } = await useCheckServerConnection(props.server.sid)
	serverStatus.status = db_status
	serverStatus.msg = db_status ? '正常' : msg
	serverStatus.error = !db_status ? err_msg : false
}

// 侦听服务器sid变化-选择框切换对应变化
watch(
	() => props.server.sid,
	val => {
		!isUndefined(val) && getStatus()
	},
	{
		immediate: true,
	}
)

onMounted(() => {
	// getStatus()
})
</script>
