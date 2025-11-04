<template>
	<config-rows label="左侧菜单标题">
		<template #value>
			<bt-input v-model="panelConfig.leftTitle" class="!w-[26rem]"></bt-input>
			<el-button type="primary" class="!ml-12px" @click="onSaveEvent">保存</el-button>
		</template>
		<template #desc>
			<span>给左侧菜单标题取个别的名称</span>
		</template>
	</config-rows>
</template>

<script lang="ts" setup>
import { setLeftTitle } from '@/api/config'
import { useDataHandle } from '@hooks/tools'
import { getConfigStore } from '@/views/config/useStore'

import ConfigRows from '@config/public/config-rows-new'

const {
	refs: { panelConfig },
	getConfigData,
} = getConfigStore()

// const title = ref(panelConfig.value.leftTitle)

// watch(
// 	() => panelConfig.value.leftTitle,
// 	val => {
// 		title.value = val
// 	}
// )

/**
 * @description 保存左侧菜单标题
 */
const onSaveEvent = async () => {
	await useDataHandle({
		loading: '正在设置左侧菜单标题，请稍候...',
		request: setLeftTitle({ title: panelConfig.value.leftTitle }),
		success: getConfigData,
		message: true,
	})
}
</script>
