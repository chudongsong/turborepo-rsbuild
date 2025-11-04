<template>
	<v-contextmenu ref="contextmenu">
		<template v-if="fileTabList.length > 1">
			<v-contextmenu-item @click="closeOther">关闭其它</v-contextmenu-item>
			<template v-if="closeTabs.index < fileTabList.length - 1">
				<v-contextmenu-item @click="closeRight">关闭右侧</v-contextmenu-item>
			</template>
		</template>
	</v-contextmenu>
</template>

<script lang="ts" setup>
import { Contextmenu as VContextmenu, ContextmenuItem as VContextmenuItem, ContextmenuSubmenu as VContextmenuSubmenu } from 'v-contextmenu'

import 'v-contextmenu/dist/themes/default.css'

import { storeToRefs } from 'pinia'
import FILES_STORE from '@files/store'
import { calculateContextMenuPosition } from '@files/useMethods'

const store = FILES_STORE()
const { fileTabList, closeTabs } = storeToRefs(store)
const { closeOther, closeRight } = store

const contextmenu = ref<any>() // 用于存储tabs右键菜单实例

/**
 * @description 显示菜单
 * @param e 传入鼠标事件
 */
const show = (e: any) => {
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
	@apply w-[8rem] text-small;
	padding: 1rem 1rem;
}
:deep(.v-contextmenu-item--hover) {
	background-color: rgba(var(--el-color-primary-rgb), 0.1) !important;
	color: var(--el-color-primary) !important;
}
</style>
