<template>
	<div class="h-500px">
		<bt-log :loading="loading" :content="content"></bt-log>
	</div>
</template>

<script lang="ts" setup>
import { isObject, refreshBrowser } from '@/utils'
import { useLoop, useMessage } from '@/hooks/tools'
import { getInstallLogs } from '@/api/vhost'

const loading = ref(false)
const content = ref('')
const { success: $success } = useMessage()

const getContent = async () => {
	const { data } = await getInstallLogs()
	if (isObject<{ result: string }>(data)) {
		content.value = data.result
		console.log(content.value)
		if (content.value.includes('|-Successify --- Command executed! ---')) {
			clearTimer()
			$success('安装成功')
			refreshBrowser() // 刷新浏览器
		}
	}
}

const { loop, clearTimer } = useLoop(getContent, 1)

onMounted(() => {
	loop()
})
</script>
