<template>
	<div class="h-full">
		<!-- 主题切换 -->
		<bt-container id="app-container" class="h-full">
			<bt-aside width="auto" class="h-full layout-left-menu" :class="layoutSidebarStyle" @mouseenter="menuCollapseMouseenter" @mouseleave="menuCollapseMouseleave">
				<!-- 左侧栏：消息，菜单，工具栏 -->
				<Sidebar />
			</bt-aside>
			<bt-container id="layout-body" ref="layoutBody" :class="layoutBodyStyle">
				<!-- 主体内容 -->
				<Main />
				<!-- 版权内容 -->
				<Footer />
			</bt-container>
			<!-- 右下角客服 -->
			<bt-customerService v-show="panel.isShowCustomer" />
		</bt-container>
		<!-- 打开插件弹窗-未完成 -->
		<bt-plugin-popup v-if="!route.path.includes('bind')" />
		<!-- <BtFps /> -->
	</div>
</template>

<script lang="ts" setup>
import { useRoute } from 'vue-router'
import { mountGlobalEvent, unmountGlobalEvent } from '@layout/controller'
import { useGlobalStore } from '@store/global'

import Footer from '@layout/views/footer.vue'
import Main from '@layout/views/main.vue'
import Sidebar from '@layout/views/sidebar/index.vue'
import { isDark, updateAllCSSVariables } from '@/utils/theme-config'

const { layoutSidebarStyle, layoutBodyStyle, panel, layoutBody, menuCollapseMouseenter, menuCollapseMouseleave } = useGlobalStore() // 全局状态
const route = useRoute() // 路由实例

// 初始化全局方法
onMounted(() => {
	mountGlobalEvent()
})

// 监听主题切换
watch(() => isDark.value, updateAllCSSVariables, { immediate: true })

// 组件销毁时，移除全局事件
onUnmounted(unmountGlobalEvent)
</script>

<style lang="css" scoped>
.layout-left-menu {
	@apply absolute z-9999 transition-width duration-300 ease-in-out h-full;
	background-color: var(--bt-menu-sidebar-color);
	box-shadow: 0 0 4px 0 rgba(var(--bt-main-shadow-color), var(--bt-main-shadow-opacity));
}

#layout-body {
	@apply block overflow-auto transition-padding duration-300 ease-in-out;
}
</style>
