<template>
	<config-rows :label="'在线客服'">
		<template #value>
			<el-switch v-model="panelConfig.onlineService" @change="onChange"></el-switch>
		</template>
		<template #desc>
			<span>显示在线客服功能按钮</span>
		</template>
	</config-rows>
</template>

<script lang="ts" setup>
import { useDataHandle } from '@hooks/tools'
import { useConfirm } from '@hooks/tools'
import { getConfigStore } from '@config/useStore'
import { setWorkorder } from '@/api/config'

import ConfigRows from '@config/public/config-rows-new'

const {
	refs: { panelConfig },
} = getConfigStore()

/**
 * @description 在线客服
 */
const onChange = async (val: boolean) => {
	panelConfig.value.onlineService = !val
	const type = val ? '开启' : '关闭'
	try {
		await useConfirm({
			icon: 'warning-filled',
			title: `${type}在线客服`,
			content: `${type}在线客服，${val ? '可以使用在线客服功能,向宝塔技术人员反馈问题,' : ''}是否继续操作？`,
		})
		await setStatus()
	} catch (err) {}
}

/**
 * @description: 设置在线客服
 */
const setStatus = async () => {
	await useDataHandle({
		loading: '正在设置在线客服配置，请稍候...',
		request: setWorkorder(),
		message: true,
		success: () => window.location.reload(), // 刷新页面
	})
}
</script>
