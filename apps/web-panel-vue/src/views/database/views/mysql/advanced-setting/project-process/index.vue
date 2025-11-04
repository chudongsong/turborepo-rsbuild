<template>
	<div>
		<div class="flex items-center">
			<div class="mr-4">守护进程开关</div>
			<el-switch v-model="isDaemon" :width="36" @change="onChangeDaemon"></el-switch>
		</div>
		<bt-help :options="helpList" list-style="disc" class="mt-2rem ml-2rem"></bt-help>
	</div>
</template>

<script setup lang="ts">
import { useDataHandle } from '@hooks/tools'
import { setRestartTask, getRestartTask } from '@/api/database'

const isDaemon = ref(false) // 守护进程开关
const helpList = [{ content: '守护进程可以在MySQL数据库服务停止后自动启动，保证MySQL服务一直运行。' }]

/**
 * @description 设置守护进程
 * @param val boolean
 */
const onChangeDaemon = async (val: boolean) => {
	await useDataHandle({
		loading: '正在设置守护进程, 请稍后...',
		request: setRestartTask({ status: val ? 1 : 0 }),
		message: true,
		success: () => getDaemon(),
	})
}

/**
 * @description 获取守护进程
 */
const getDaemon = async () => {
	await useDataHandle({
		loading: '正在获取守护进程状态, 请稍后...',
		request: getRestartTask(),
		success: ({ data: res }: any) => {
			isDaemon.value = res.msg.status === 1 ? true : false
		},
	})
}

onMounted(getDaemon)
defineExpose({ init: getDaemon })
</script>
