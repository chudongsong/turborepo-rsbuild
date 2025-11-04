<template>
	<config-rows :label="'开发者模式'">
		<template #value>
			<el-switch v-model="panelConfig.debugMode" @change="onChange"></el-switch>
		</template>
		<template #desc>
			<span>仅第三方开发者开发阶段使用（普通用户请勿开启）</span>
		</template>
	</config-rows>
</template>

<script lang="ts" setup>
import { setDebug } from '@/api/config'
import { useDataHandle } from '@hooks/tools'
import { useDialog } from '@hooks/tools' // 弹窗
import { useConfirm } from '@hooks/tools'
import { getConfigStore } from '@config/useStore'

import ConfigRows from '@config/public/config-rows-new'
import { openRiskTipsView } from '@/views/config/useMethod'

const {
	refs: { panelConfig },
} = getConfigStore()

/**
 * @description: 开发者模式
 */
const onChange = async (val: boolean) => {
	panelConfig.value.debugMode = !val
	if (val) {
		openMode()
	} else {
		closeMode()
	}
}

/**
 * @description: 开启模式
 */
const openMode = () => {
	openRiskTipsView({
		title: '风险操作,此功能普通用户别开启!',
		content: ['<span class="text-danger">仅第三方开发者开发使用，普通用户请勿开启；</span>', '提交请不要在生产环境开启，这可能增加服务器安全风险；', '开启开发者模式可能会占用大量内存'],
		checkTip: '我已了经解详情，并愿意承担风险，开启开发模式',
		onConfirm: async () => {
			await useDataHandle({
				loading: '正在设置开发者模式，请稍候...',
				request: setDebug(),
				message: true,
				success: () => {
					panelConfig.value.debugMode = !panelConfig.value.debugMode
				},
			})
		},
	})
}

/**
 * @description: 关闭模式
 */
const closeMode = async () => {
	await useConfirm({
		icon: 'warning-filled',
		title: '关闭开发者模式',
		content: '是否关闭开发者模式?',
	})

	await useDataHandle({
		loading: '正在设置开发者模式，请稍候...',
		request: setDebug(),
		message: true,
		success: () => {
			panelConfig.value.debugMode = false
		},
	})
}
</script>
