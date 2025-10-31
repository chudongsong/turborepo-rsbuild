<template>
	<config-rows :label="'面板菜单栏隐藏'">
		<template #value>
			<bt-input v-model="panelConfig.menuHide" disabled class="!w-[26rem]"></bt-input>
			<el-button type="primary" class="!ml-12px" @click="menuSettingsDialog()">设置</el-button>
		</template>
		<template #desc>
			<span>隐藏左侧菜单栏目</span>
		</template>
	</config-rows>
</template>

<script lang="tsx" setup>
import { menuSettingsDialog } from '@/public/index'
import { getConfigStore } from '@/views/config/useStore'

import ConfigRows from '@config/public/config-rows-new'

const {
	refs: { panelConfig },
	getMenuListEvent,
} = getConfigStore()

onMounted(() => {
	getMenuListEvent()
})
</script>
