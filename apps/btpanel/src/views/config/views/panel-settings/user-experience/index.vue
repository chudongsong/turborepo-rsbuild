<template>
	<config-rows :label="'用户体验改善计划'">
		<template #value>
			<el-switch v-model="panelConfig.improvement" @change="onChange"></el-switch>
		</template>
		<template #desc>
			<span>参加用户体验改善计划来帮助我们改进产品,</span>
			<bt-link href="https://www.bt.cn/new/agreement_privacy.html"> 了解详情 </bt-link>
		</template>
	</config-rows>
</template>

<script lang="ts" setup>
import { setImprovement } from '@/api/config'
import { useDataHandle } from '@hooks/tools'
import { getConfigStore } from '@config/useStore'
import { useConfirm } from '@hooks/tools'

import ConfigRows from '@config/public/config-rows-new'

const {
	refs: { panelConfig },
} = getConfigStore()

/**
 * @description 用户体验改善计划
 */
const onChange = async (val: boolean) => {
	panelConfig.value.improvement = !val
	try {
		await useConfirm({
			icon: 'warning-filled',
			title: val ? '开启用户体验改善计划' : '关闭用户体验改善计划',
			content: val ? '感谢您参与用户改善计划，帮助宝塔提升产品质量，使得我们有机会为您提供更优质的产品和服务，是否继续？' : '非常感谢您对我们的支持，即将退出用户体验改善计划，是否继续？',
		})
		await setStatus(val)
	} catch (err) {}
}

/**
 * @description 设置用户体验改善计划
 * @param val
 */
const setStatus = async (val: boolean) => {
	await useDataHandle({
		loading: '正在设置用户体验改善计划配置，请稍候...',
		request: setImprovement({ status: val ? 1 : '0' }),
		message: true,
		success: () => {
			panelConfig.value.improvement = !panelConfig.value.improvement
		},
	})
}
</script>
