<template>
	<config-rows :label="'超时时间'">
		<template #value>
			<bt-input v-model="panelConfig.session_timeout" disabled class="!w-[26rem]"></bt-input>
			<el-button type="primary" class="!ml-12px" @click="onSetEvent">设置</el-button>
		</template>
		<template #desc>
			<span>如果用户超过以上时间</span>
			<span class="text-danger">{{ panelConfig.session_timeout }}</span>
			<span>，未操作面板，面板将自动退出登录</span>
		</template>
	</config-rows>
</template>

<script lang="ts" setup>
import { useDialog } from '@hooks/tools'
import { getConfigStore } from '@config/useStore'

import ConfigRows from '@config/public/config-rows-new'

const {
	refs: { panelConfig },
} = getConfigStore()

/**
 * @description:保存按钮
 */
const onSetEvent = () => {
	useDialog({
		area: 45,
		showFooter: true,
		title: '超时时间设置',
		component: () => import('./time-config.vue'),
	})
}
</script>
