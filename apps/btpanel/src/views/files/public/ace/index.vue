<template>
	<div class="w-full flex flex-col">
		<!-- 顶部菜单栏 -->
		<Toolbars />
		<!-- 编辑器区域 -->
		<div class="h-full flex">
			<div class="flex items-start flex-1">
				<!-- 左侧菜单栏 -->
				<transition name="catalogue-fade" @enter="onLeave" @leave="onLeave">
					<div class="w-[26rem] h-full" v-show="catalogueShow">
						<Sidebar />
					</div>
				</transition>

				<!-- 右侧大内容区域 -->
				<div class="flex w-full h-full">
					<div
						v-show="btnShow"
						@click="catalogueShow = !catalogueShow"
						:class="{
							'terminal-contract-tool': true,
							'is-avtive': !catalogueShow,
							'left-[26rem]': catalogueShow,
							'left-0': !catalogueShow,
						}"
						class="transition-all duration-100"></div>
					<div class="container-box">
						<Content />
						<StatusBar v-if="useCheckTabsEmpty() && editorTabsActive.type === 'editor'" />
						<DiffStatusBar v-else-if="useCheckTabsEmpty() && editorTabsActive.type === 'diff'" />
						<div v-else class="h-[3.5rem] bg-dark"></div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import Toolbars from './toolbars/index.vue'
import Sidebar from './sidebar/index.vue'
import Content from './content/index.vue'
import StatusBar from './status-bar/index.vue'
import DiffStatusBar from './diff-status-bar/index.vue'

import { editorTabsActive, useCheckTabsEmpty, useDestroyAllEditorSession } from '@files/public/ace/useMethods'
import '/public/static/editor/ace.js'
import '/public/static/editor/styles/icons.css'
import '/public/static/editor/ext-language_tools.js'
import { storeToRefs } from 'pinia'
import FILES_ACE_STORE from './store'
import { useGlobalStore } from '@/store/global'

const store = FILES_ACE_STORE()
const { routerActive, btnShow, catalogueShow } = storeToRefs(store)
const { onCancel, init, onLeave, $reset } = store

const { mainWidth } = useGlobalStore()

// 使用单个状态来防止操作冲突
const isStateChanging = ref(false)

// 监听窗口宽度变化
watch(
	() => mainWidth.value,
	() => {
		// 如果正在进行状态变更，不执行窗口大小调整
		if (isStateChanging.value) return
		// 如果正在最小化，不执行窗口大小调整
		const isMinimize = document.querySelector('.bt-dialog-header .svgtofont-icon-minmax-black')
		if (isMinimize) return

		isStateChanging.value = true
		if (mainWidth.value < 1280) {
			nextTick(() => {
				if (document.querySelector('.bt-dialog-header .svgtofont-icon-max-black')) {
					document.querySelector('.bt-dialog-header .svgtofont-icon-max-black')?.click()
				}
			})
		} else {
			nextTick(() => {
				if (document.querySelector('.bt-dialog-header .svgtofont-icon-minmax-black')) {
					document.querySelector('.bt-dialog-header .svgtofont-icon-minmax-black')?.click()
				}
			})
		}
		// 重置状态
		setTimeout(() => {
			isStateChanging.value = false
		}, 100)
	},
	{ immediate: true }
)

// 当编辑器切换时最小化
watch(
	() => routerActive.value,
	() => {
		isStateChanging.value = true
		if (document.querySelector('.bt-dialog-header')) {
			document.querySelector('.bt-dialog-header .svgtofont-el-semi-select')?.click()
		}
		setTimeout(() => {
			isStateChanging.value = false
		}, 300)
	},
	{ immediate: true }
)

// interface Props {
// 	compData?: EditorProps
// }

// interface EditorProps {
// 	fileItem: FileDataProps
// 	callback: (data: FileDataProps) => void
// }

// const emit = defineEmits(['close'])

// const props = withDefaults(defineProps<Props>(), {
// 	compData: {
// 		fileItem: { id: '', path: '' },
// 		callback: () => {},
// 	},
// })
// const btnShow = ref(true) // 按钮显示隐藏

// const catalogueShow = ref(true) // 目录栏显示隐藏

// provide('fileItem', props.compData?.fileItem)

onMounted(init)
onUnmounted(() => {
	$reset()
	useDestroyAllEditorSession()
})
</script>

<style lang="css" scoped>
.catalogue-fade-enter-active {
	animation: axisX 0.3s linear;
}

.catalogue-fade-leave-active {
	animation: axisX 0.5s reverse linear;
}

@keyframes axisX {
	from {
		width: 0;
	}

	to {
		width: 26.5rem;
	}
}

.btn-fade-enter-active {
	animation: axisY 0.5s linear;
}

.btn-fade-leave-active {
	animation: axisY 0.5s linear;
}

@keyframes axisY {
	from {
		opacity: 0;
		width: 100px !important;
	}

	to {
		opacity: 1;
	}
}
.container-box {
	@apply relative bg-[#222] overflow-auto w-full flex flex-col;
	transition: all 100ms;
}

:deep(.terminal-contract-tool) {
	@apply bg-[#222] w-[1.4rem] h-[5rem] border border-[#525252] border-l-[0px] rounded-br-full rounded-tr-full flex items-center justify-center cursor-pointer absolute right-0 top-[46%] z-998 rounded-bl-0 rounded-tl-0;
}

:deep(.terminal-contract-tool):after {
	@apply content-[''] block absolute w-[1rem] h-[1rem] border-white transform -rotate-135 border-[2px] border-solid left-[.4rem] overflow-hidden;
	border-bottom: 0;
	border-left: 0;
}

:deep(.terminal-contract-tool:hover) {
	@apply bg-[#888] transition-all duration-300;
}

:deep(.terminal-contract-tool.is-avtive) {
	@apply bg-[#d6d7d9];
}

:deep(.terminal-contract-tool.is-avtive:after) {
	@apply transform rotate-45 left-[0rem];
}

:deep(.terminal-contract-tool.is-avtive:hover) {
	@apply bg-[#888] transition-all duration-300;
}
</style>
