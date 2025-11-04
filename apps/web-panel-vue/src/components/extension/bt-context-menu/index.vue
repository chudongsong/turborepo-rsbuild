<template>
	<div>
		<div class="menu">
			<v-contextmenu ref="contextmenu">
				<v-contextmenu-item v-for="(item, index) of options" :key="index" @click.native="itemClickEvent(item, $event)">
					<div class="menu-item">
						<span>{{ item.label }}</span>
					</div>
				</v-contextmenu-item>
			</v-contextmenu>
		</div>
		<div v-contextmenu:contextmenu @contextmenu="openMenuEvent"><slot></slot></div>
	</div>
</template>

<script lang="ts">
import type { ContextMenuOptionsProps } from './types'
import { directive, Contextmenu, ContextmenuItem } from 'v-contextmenu'
import 'v-contextmenu/dist/themes/default.css'

interface ContextmenuInstance {
	show: (e: MouseEvent) => void
}

/**
 * @description 组件用于上下文菜单
 * @component  插件名称 - bt-context-menu
 * @prop {Array<ContextMenuOptionsProps>} options - The options for the context menu.
 * @method itemClickEvent - Event handler for clicking on an item in the context menu.
 * @param {ContextMenuOptionsProps} item - The clicked item.
 * @param {MouseEvent} e - The mouse event object.
 */
export default defineComponent({
	directives: {
		contextmenu: directive,
	},
	components: {
		[Contextmenu.name]: Contextmenu,
		[ContextmenuItem.name]: ContextmenuItem,
	},
	props: {
		options: {
			type: Array as () => ContextMenuOptionsProps[],
			default: () => [],
		},
	},
	methods: {
		// 点击事件
		itemClickEvent(item: ContextMenuOptionsProps, e: MouseEvent) {
			item.onClick(e)
		},
		// 打开菜单
		openMenuEvent(e: MouseEvent) {
			e.preventDefault()
			;(this.$refs.contextmenu as ContextmenuInstance).show(e)
		},
	},
})
</script>

<style scoped>
.menu {
	position: fixed;
	box-shadow:
		0 2px 4px rgba(var(--el-color-black-rgb), 0.12),
		0 0 6px rgba(var(--el-color-black-rgb), 0.04);
	background: var(--el-color-white);
	border-radius: var(--el-border-radius-base);
	padding: 8px 0;
}

.menu_body {
	display: block;
}

.menu-item {
	list-style: none;
	line-height: 20px;
	padding: 0 16px;
	margin: 0;
	font-size: var(--el-font-size-base);
	outline: 0;
	display: flex;
	align-items: center;
	transition: 0.2s;
	border-bottom: 1px solid transparent;
}

.v-contextmenu-item--hover {
	background-color: var(--el-color-primary);
	color: var(--el-color-white);
}
</style>

<style>
.contextmenu-submenu-fade-enter-active,
.contextmenu-submenu-fade-leave-active {
	transition: opacity 0.1s;
}

.contextmenu-submenu-fade-enter,
.contextmenu-submenu-fade-leave-to {
	opacity: 0;
}
</style>
