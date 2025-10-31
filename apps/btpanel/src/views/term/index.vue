<template>
	<div class="p-[1.6rem]">
		<section class="rounded-small !p-[1.2rem] module-ui" :class="isFull ? 'is-full-view' : ''" :style="{ height: termHeight + 'px' }">
			<div class="flex h-full">
				<div class="terminal-content">
					<div class="terminal-nav" ref="terminalNavRef">
						<div class="terminal-nav-list" :style="{ maxWidth: navListWidth }" @wheel.prevent="onMouseWheel">
							<BtContextMenu ref="contextMenuRef" :options="contextOptions" />
							<div v-for="(item, index) in terminalList" :key="item.id" :class="terminalViewStyle({ index, type: 'nav' })" @click="cutTerminalNav(index)" @contextmenu.prevent="openContextMenu(item, index, $event)">
								<div class="flex items-center" :key="index">
									<div class="flex items-center truncate">
										<div class="terminal-status" :class="`icon-${terminalStatusList[item.id]?.value}`"></div>
										<div class="terminal-title" :title="item.hostInfo.host">
											{{ item.hostInfo.ps }}
										</div>
									</div>
									<div class="close h-[1.8rem] mt-2px" :dataIndex="index" @click.stop="closeTerminal(index)" title="关闭当前终端视图">
										<BtIcon icon="el-close-bold" :size="18" color="var(--el-color-danger)" />
									</div>
								</div>
							</div>
						</div>
						<div class="terminal-nav-add" title="点击添加服务器信息" @click="editHostInfo()">
							<BtIcon icon="el-plus" :size="18" />
						</div>
						<div class="terminal-nav-full" :title="!isFull ? '点击全屏显示' : '点击退出全屏显示'" @click="cutFullScreen">
							<BtIcon :icon="`el-fullscreen-${isFull ? 'shrink' : 'expand'}`" :size="18" />
						</div>
					</div>
					<div class="terminal-view" :style="{ width: termViewWidth }">
						<BtTerminal v-for="(item, index) in terminalList" v-show="hostActive === index" :ref="(el: TermRef) => setRefTerminal(el, item.id)" :key="item.id" :id="item.id" :active="index === hostActive" :host-info="item.hostInfo" :auto-complete="autoCompleteStatus" :class="terminalViewStyle({ index, type: 'view' })" />
					</div>
					<div
						:class="{ 'terminal-contract-tool': true, 'is-avtive': !isSidebar }"
						title="点击隐藏右侧视图"
						@click="
							() => {
								cutSidebar() && setRefTerminalFit()
							}
						"></div>
				</div>
				<div class="w-[30rem] ml-[16px]" v-show="isSidebar">
					<TermSidebar @full-screen="cutFullScreen" @host-change="createTerminal" />
				</div>
			</div>
		</section>
	</div>
</template>

<script lang="ts" setup>
import type { TermRef } from './types.d'
import { closeTerminal, createTerminal, cutFullScreen, cutTerminalNav, onMouseWheel, openContextMenu, setRefTerminal, terminalViewStyle, initLocalConnect, setRefTerminalFit } from './useController'
import { useTermStore } from './useStore'
import { editHostInfo } from './views/host-list/useController'
import TermSidebar from './views/index.vue'

const { isFull, isSidebar, hostActive, termHeight, termViewWidth, contextOptions, terminalList, terminalStatusList, cutSidebar, $reset, contextMenuRef, autoCompleteStatus } = useTermStore()

// 终端导航栏引用
const terminalNavRef = useTemplateRef('terminalNavRef')
const { width } = useElementSize(terminalNavRef)

// 计算导航列表的宽度
const navListWidth = computed(() => {
  if (!terminalNavRef.value) return 'calc(100% - 8rem)'
  return `${width.value - 80}px`
})

onMounted(initLocalConnect)
onUnmounted($reset)
</script>

<style lang="css" scoped>
.is-full-view {
	@apply fixed left-0 top-0 right-0 bottom-0 w-full z-99999999;
	height: 100% !important;
}
.is-full-view > .flex.p-16px {
	@apply p-[4px];
}

.terminal-nav {
	@apply bg-base w-full flex relative rounded-tl-large rounded-tr-large overflow-hidden;
}
.terminal-nav-list {
	@apply flex overflow-x-auto overflow-y-hidden;
}

.terminal-nav-list::-webkit-scrollbar {
	height: 8px;
}

.terminal-nav-list::-webkit-scrollbar-track {
	box-shadow: inset 0 0 6px var(--el-fill-color-dark);
}

.terminal-nav-list::-webkit-scrollbar-track-piece {
	background-color: var(--el-color-text-tertiary);
	box-shadow: inset 0 0 6px rgba(var(--el-color-black-rgb), 1);
}

.terminal-nav-list::-webkit-scrollbar-thumb {
	background: var(--el-fill-color-dark);
	box-shadow: inset 0 0 6px rgba(var(--el-color-black-rgb), 1);
}

.terminal-nav-list::-webkit-scrollbar-thumb:hover {
	background-color: var(--el-fill-color-light);
}

.terminal-nav-item {
	@apply h-[4rem] leading-[4rem] text-left flex items-center justify-between text-secondary cursor-pointer transition-all duration-300;
	border-right: 1px solid var(--el-color-border-dark-tertiaryer);
}

.terminal-nav-item:hover {
	@apply bg-darker;
}

.terminal-nav-item:hover .close .svgtofont-el-close {
	@apply opacity-100;
}

.terminal-nav-item.active {
	@apply bg-[#000];
}

.terminal-nav-item.active .terminal-title {
	@apply text-white;
}

.terminal-nav-item.active .close .svgtofont-el-close {
	@apply opacity-90;
}

.terminal-nav-item.active .close .svgtofont-el-close:hover {
	@apply bg-white;
}

.terminal-status {
	@apply h-[1rem] w-[1rem] rounded-large inline-block ml-[8px] mr-[4px] transition-all duration-400;
}

.terminal-status.icon-success {
	@apply bg-primary;
}

.terminal-status.icon-warning {
	@apply bg-warning;
}

.terminal-status.icon-danger {
	@apply bg-danger;
}

.terminal-title {
	@apply text-base text-secondary w-40 truncate;
}

.close {
	@apply flex items-center transition-all duration-300 rounded-small mr-[8px];
}

.close i.svgtofont-el-close {
	@apply text-large text-danger font-bold opacity-0 transition-all duration-300;
}

.close:hover {
	@apply bg-darkTertiary;
}

.terminal-nav-add {
	@apply w-[4rem] h-[4rem] leading-[4rem] flex items-center cursor-pointer justify-center transition-all duration-300;
}

.terminal-nav-add i {
	@apply text-large text-primary font-bold;
}

.terminal-nav-add:hover {
	@apply bg-darker;
}

.terminal-nav-full {
	@apply w-[4rem] h-[4rem] leading-[4rem] flex items-center cursor-pointer justify-center transition-all duration-300 absolute right-0;
}

.terminal-nav-full i {
	@apply text-large text-default font-bold;
}

.terminal-nav-full:hover {
	@apply bg-[var(--el-fill-color-darker)];
}

.terminal-content {
	@apply flex-1 flex flex-col bg-[#000] rounded-large relative;
}

.terminal-view {
	@apply bg-[#000] w-full h-full p-[8px] rounded-large overflow-hidden;
}

.terminal-view-item {
	@apply bg-[#000] w-full h-full hidden;
}

.terminal-view-item.active {
	@apply block;
}

/* .terminal-view-item:deep(.terminal-view-*) {
	@apply hidden;
} */

.terminal-contract-tool {
	@apply bg-dark w-[2rem] h-[4rem] rounded-bl-full rounded-tl-full flex items-center justify-center cursor-pointer absolute right-0 top-[50%] z-999;
}

.terminal-contract-tool:after {
	@apply content-[''] block absolute w-[1rem] h-[1rem] border-white transform rotate-45 border-[2px];
	border-left: 0;
	border-bottom: 0;
}

.terminal-contract-tool:hover {
	@apply bg-darkTertiary transition-all duration-300;
}

.terminal-contract-tool.is-avtive {
	@apply bg-darkTertiary transition-all duration-300;
}

.terminal-contract-tool.is-avtive:after {
	@apply transform -rotate-135 left-4;
}

.drawer {
	display: none;
}

.xterm .xterm-viewport {
	overflow: auto !important;
}
</style>
