<template>
	<config-rows :label="'关闭面板'">
		<template #value>
			<el-switch :model-value="panelConfig.panelClose" @change="onChangeEvent"></el-switch>
		</template>
		<template #desc>
			<span>仅关闭当前的面板服务，不影响web服务器，数据库等程序运行</span>
		</template>
	</config-rows>
</template>

<script lang="ts" setup>
import { getConfigStore } from '@views/config/useStore'
import { useConfirm } from '@hooks/tools'
import { useDataHandle } from '@hooks/tools'
import { closePanel } from '@/api/config'

import ConfigRows from '@config/public/config-rows-new'

const {
	refs: { panelConfig },
} = getConfigStore()

/**
 * @description 关闭面板
 * @param val
 */
const onChangeEvent = async (val: boolean) => {
	await useConfirm({
		title: '关闭面板',
		content: '关闭面板会导致您无法访问面板 ,您真的要关闭宝塔Linux面板吗？',
		icon: 'warning-filled',
	})
	await useDataHandle({
		request: closePanel(),
		loading: '正在关闭面板，请稍候...',
		success: () => {
			panelConfig.value.panelClose = false
			location.reload()
		},
	})
}
</script>
