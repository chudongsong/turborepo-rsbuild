<template>
	<config-rows :label="'面板别名'">
		<template #value>
			<bt-input v-model="panelConfig.webname" class="!w-[26rem]"></bt-input>
			<el-button type="primary" class="!ml-12px" @click="onSaveEvent">保存</el-button>
		</template>
		<template #desc>
			<span>给面板取个别的名称，用于网页标题</span>
		</template>
	</config-rows>
</template>

<script lang="ts" setup>
import { Message } from '@hooks/tools'
import { getConfigStore } from '@/views/config/useStore'
import ConfigRows from '@config/public/config-rows-new'

const {
	refs: { panelConfig },
	saveConfig,
} = getConfigStore()

/**
 * @description 保存
 */
const onSaveEvent = () => {
	// 判断别名是否存在正反斜杠
	if (panelConfig.value.webname.includes('/') || panelConfig.value.webname.includes('\\')) {
		Message.error('别名不能包含正反斜杠')
		return
	}
	saveConfig('正在设置面板别名，请稍候...')
}
</script>
