<template>
	<config-rows :label="'登录归属地提示'">
		<template #value>
			<el-switch v-model="panelConfig.loginOrigin" @change="onChange"></el-switch>
		</template>
		<template #desc>
			<span>登录成功后会在面板右下角显示，当前的归属地以及登录IP信息</span>
		</template>
	</config-rows>
</template>

<script lang="ts" setup>
import { setLoginOrigin } from '@/api/config'
import { useDataHandle } from '@hooks/tools'
import { getConfigStore } from '@config/useStore'
import { useConfirm } from '@hooks/tools'

import ConfigRows from '@config/public/config-rows-new'

const {
	refs: { panelConfig },
} = getConfigStore()

/**
 * @description 登录归属地提示
 */
const onChange = async (val: boolean) => {
	panelConfig.value.loginOrigin = !val
	try {
		await useConfirm({
			icon: 'warning-filled',
			title: val ? '启用登录IP归属地信息显示' : '关闭登录IP归属地信息显示',
			content: val ? '启用后，登录成功后会显示当前的归属地以及登录IP信息' : '关闭后，将不在提示登录IP归属地信息消息窗，为了面板安全，请谨慎关闭',
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
		loading: '正在设置登录归属地提示配置，请稍候...',
		request: setLoginOrigin({ status: Number(!!val)  }),
		message: true,
		success: () => {
			panelConfig.value.loginOrigin = !panelConfig.value.loginOrigin
		},
	})
}
</script>
