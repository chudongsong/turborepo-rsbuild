<template>
	<BtLog class="h-53rem" v-bt-loading="logLoading" :content="logContent" />
</template>

<script lang="ts" setup>
import { getExecLog } from '@/api/global'
import { useDataHandle } from '@/hooks/tools'

const logLoading = ref(false) // 执行日志loading
const logContent = ref('获取中...	') // 执行日志内容

/**
 * @description 获取执行日志
 * @returns {Promise<void>}
 */
const getExecLogInfo = async (): Promise<void> => {
	try {
		const data: string = await useDataHandle({
			loading: logLoading,
			request: getExecLog(),
			data: String,
		})
		logContent.value = data.trim() || '暂无执行日志'
	} catch (error) {
		console.error(error)
	}
}

onMounted(getExecLogInfo)
</script>
