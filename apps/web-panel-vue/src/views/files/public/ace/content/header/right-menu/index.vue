<template>
	<!-- 右键菜单选项 -->
	<v-contextmenu ref="contextmenu" style="z-index: 3100 !important">
		<!-- 单文件右键菜单 -->
		<div>
			<v-contextmenu-item @click="closeTab(row, $event)">关闭</v-contextmenu-item>
			<v-contextmenu-item @click="closeOther(row, $event)">关闭其他</v-contextmenu-item>
			<v-contextmenu-item @click="closeAll($event)">全部关闭</v-contextmenu-item>
		</div>
	</v-contextmenu>
</template>

<script setup lang="ts">
import { Contextmenu as VContextmenu, ContextmenuItem as VContextmenuItem } from 'v-contextmenu'

import 'v-contextmenu/dist/themes/default.css'

import { useRemoveEditorTabs, useCloseAllTabs, useCloseOtherTabs } from '@files/public/ace/useMethods'
import { calculateContextMenuPosition } from '@files/useMethods'

const props = defineProps<{
	row: any
}>()

const contextmenu = ref<any>() // 右键菜单

const closeTab = async (item: any, e: any) => {
	e.preventDefault()
	useRemoveEditorTabs(item)
}

const closeOther = async (item: any, e: any) => {
	e.preventDefault()
	useCloseOtherTabs(item)
}

const closeAll = async (e: any) => {
	e.preventDefault()
	useCloseAllTabs()
}

/**
 * @description 显示菜单
 * @param e 传入鼠标事件
 */
const show = (e: any) => {
	e.preventDefault()
	contextmenu.value.visible = true
	nextTick(() => {
		calculateContextMenuPosition(e, contextmenu.value.contextmenuRef)
	})
}

/**
 * @description 隐藏菜单
 */
const hide = () => {
	contextmenu.value.visible = false
}

/**
 * @description 全局点击事件处理程序
 * @param e 传入鼠标事件
 */
const handleClickOutside = (e: MouseEvent) => {
	if (contextmenu.value && contextmenu.value.visible) {
		hide()
	}
}

onMounted(() => {
	document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
	document.removeEventListener('click', handleClickOutside)
})

defineExpose({
	show,
	hide,
})
</script>

<style lang="css" scoped>
:deep(.v-contextmenu-item) {
	@apply flex items-center h-[3rem] w-[13rem];
}

:deep(.v-contextmenu-item .v-contextmenu-item) {
	@apply w-[13rem];
}
</style>
