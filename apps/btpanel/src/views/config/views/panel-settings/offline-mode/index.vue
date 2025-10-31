<template>
	<config-rows :label="'离线模式'">
		<template #value>
			<el-switch v-model="panelConfig.offlineMode" @change="onChangeEvent"></el-switch>
		</template>
		<template #desc>
			<span>离线模式下，面板更新，插件购买等联网服务将无法使用</span>
		</template>
	</config-rows>
</template>

<script lang="ts" setup>
import { useConfirm } from '@hooks/tools'
import { getConfigStore } from '@config/useStore'
import { useDataHandle } from '@hooks/tools'
import { setLocal } from '@/api/config'

import ConfigRows from '@config/public/config-rows-new'

const {
	refs: { panelConfig },
} = getConfigStore()

/**
 * @description: 离线模式
 */
const onChangeEvent = async (val: boolean) => {
	panelConfig.value.offlineMode = !val
	await useConfirm({
		icon: 'warning-filled',
		title: val ? '开启 离线模式' : '关闭 离线模式',
		content: val ? '开启离线模式后面板将停止连接云端，介时软件安装、卸载、面板更新等功能将无法使用，是否继续！' : '是否关闭离线模式?',
	})
	await setLocalMode()
}

/**
 * @description: 设置离线模式
 */
const setLocalMode = async () => {
	await useDataHandle({
		loading: '正在设置离线模式，请稍候...',
		request: setLocal(),
		message: true,
		success: () => {
			panelConfig.value.offlineMode = !panelConfig.value.offlineMode
		},
	})
}
</script>
