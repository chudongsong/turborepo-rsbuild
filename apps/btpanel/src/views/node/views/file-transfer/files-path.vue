<template>
	<div class="nav-path" :id="randomId">
		<!-- 上一层 -->
		<div class="back rounded-l-large relative" @click="goBack">
			<i class="svgtofont-el-back" :class="{ disabledBack: disabledCutTab }"></i>
		</div>
		<!-- 输入和选择框 -->
		<div class="path-input">
			<input v-model="dirPath" ref="pathInputRef" type="text" class="h-full w-full pl-8px" v-show="!pathInputMode" @blur="cutPathInputMode(true)" @keydown.stop @keyup.enter="cutDirPath(dirPath, true)" />
			<div class="path-list-group" @click="cutPathInputMode(false)" v-show="pathInputMode">
				<div v-show="more.showMore" class="svgtofont-el-arrow-left font-bold px-[.2rem] h-full leading-[2.9rem] cursor-pointer border-l border-r border-lighter relative hover:(border-darker bg-light)" @click.stop="more.showUl = true">
					<ul class="fold-dir-list" v-show="more.showUl">
						<li class="fold-dir-item" v-for="(items, indexs) in more.list" :key="indexs">
							<el-tooltip effect="dark" :content="items.path" placement="right" :show-after="500">
								<div class="w-full flex items-center" @click.stop="cutDirPath(items.path)">
									<span class="dir-icon flex-shrink-0 !h-[1.6rem]"></span>
									<span>{{ items.name }}</span>
								</div>
							</el-tooltip>
						</li>
					</ul>
				</div>
				<div v-for="(item, index) in pathListGroup" :key="index" v-show="item.show" class="path-group-item" @click.stop="cutDirPath(item.path)">
					<el-tooltip effect="dark" :content="item.name" placement="bottom" :show-after="500">
						<span class="path-name">{{ item.name }}</span>
					</el-tooltip>
					<div class="svgtofont-el-arrow-right path-name-icon" @click.stop="getCurrentFoldDirList(item.path, index)">
						<ul class="fold-dir-list" v-show="item.showFold" v-loading="item.loading">
							<li class="fold-dir-item" v-for="(items, indexs) in item.list" :key="indexs">
								<el-tooltip effect="dark" :content="items.path" placement="right" :show-after="500">
									<div class="w-full flex items-center" @click.stop="cutDirPath(items.path)">
										<span class="dir-icon flex-shrink-0 !h-[1.6rem]"></span>
										<span>{{ items.name }}</span>
									</div>
								</el-tooltip>
							</li>
							<el-empty v-show="!item.list.length" :image-size="60" description="暂无数据"></el-empty>
						</ul>
					</div>
				</div>
			</div>
		</div>
		<!-- 刷新 -->
		<span class="refresh rounded-r-large" @click="refreshList">
			<i
				:class="{
					'svgtofont-el-refresh-right': !disabledCutTab,
					'svgtofont-el-loading cursor-not-allowed animate-spin': disabledCutTab,
				}"></i>
		</span>
	</div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, nextTick, watch, onMounted, onUnmounted } from 'vue'
import { getFileList, testPath, createNewFile } from '@/api/files'
import { useMessage, useConfirm, useDataHandle } from '@/hooks/tools'
import { inputFocus, getRandomChart } from '@/utils'

// 定义接口类型
interface PathListItem {
	name: string
	path: string
	show: boolean
	showFold?: boolean
	loading?: boolean
	list?: Array<{ name: string; path: string }>
}

interface MoreData {
	showMore: boolean
	showUl: boolean
	list: Array<{ name: string; path: string }>
}

// 定义props
interface Props {
	initialPath?: string
	// onPathChange?: (path: string) => void
	// onRefresh?: () => void
}

const props = withDefaults(defineProps<Props>(), {
	initialPath: '/www/wwwroot',
	// onPathChange: () => {},
	// onRefresh: () => {}
})

// 定义emits
const emit = defineEmits<{
	pathChange: [path: string]
	refresh: []
}>()

const Message = useMessage()

const randomId = ref<string>(getRandomChart(10, 'letter'))

// 响应式数据
const dirPath = ref<string>(props.initialPath)
const pathInputRef = ref<HTMLInputElement>()
const pathInputMode = ref<boolean>(true)
const pathListGroup = ref<PathListItem[]>([])
const pathFoldActive = ref<number>(0)
const disabledCutTab = ref<boolean>(false)

const more = reactive<MoreData>({
	showMore: false,
	showUl: false,
	list: [],
})

/**
 * @description 路径输入模式
 * @param {boolean} type true: 退出输入模式 false: 进入输入模式
 */
const cutPathInputMode = async (type: boolean) => {
	pathInputMode.value = type
	if (type) {
		if (dirPath.value === props.initialPath) return // 当路径未变化时，不做任何操作
		const path = dirPath.value
		// 当路径输入不符合规则时提示，不规则情况：如直接输入路径名，不包含/
		if (path.length > 0 && !path.includes('/')) {
			Message.error('路径输入不符合规则')
			dirPath.value = props.initialPath
			return
		} else if (path.length === 0) {
			dirPath.value = props.initialPath
			return
		}

		try {
			// const res = await testPath({ path: dirPath.value })
			// if (!res.data.exists) {
			// 	Message.error('当前路径不存在')
			// try {
			// 	await useConfirm({
			// 		width: 50,
			// 		title: '路径不存在',
			// 		content: `【${path}】路径不存在,是否创建并跳转?`,
			// 	})
			// } catch (error) {
			// 	if (error === 'cancel') {
			// 		dirPath.value = props.initialPath
			// 		return
			// 	}
			// }
			// await useDataHandle({
			// 	loading: '正在新建文件，请稍后...',
			// 	request: createNewFile({
			// 		path: path,
			// 		type: 'dir',
			// 	}),
			// 	message: true,
			// 	success: (res: any) => {
			// 		// 跳转当前路径
			// 		if (res.status) pathJumpEvent(path)
			// 	},
			// })
			// } else {
			const result = await pathJumpEvent(path)
			dirPath.value = result || path
			// }
		} catch (error) {
			console.error('路径验证失败:', error)
			dirPath.value = props.initialPath
		}
	} else {
		inputFocus(pathInputRef.value!)
	}
}

/**
 * @description 切换文件列表
 * @param {string} path 路径
 * @param {boolean} isEnter 是否是回车事件
 */
const cutDirPath = (path: string, isEnter?: boolean) => {
	if (path === '') dirPath.value = '/'
	pathInputRef.value?.blur() // 失去焦点

	if (!isEnter) pathJumpEvent(path)
}

/**
 * @description 路径跳转事件
 * @param {string} path 跳转的完整路径
 */
const pathJumpEvent = async (path: string) => {
	const pathInfo = path.replace(/\/+$/, '') || '/'
	const pathData = path_check(pathInfo)

	if (path === '/.Recycle_bin' || path === '/www/.Recycle_bin') {
		Message.error('此为回收站目录，请在右上角按【回收站】按钮打开')
		return false
	}

	dirPath.value = pathData
	emit('pathChange', pathData)

	return pathData
}

/**
 * @description 路径检查和格式化
 * @param {string} path 路径
 */
const path_check = (path: string): string => {
	// 路径格式化逻辑
	let formattedPath = path
	// 当路径存在/\,\/时，转换为/
	formattedPath = formattedPath.replace(/(\\\/|\/\\)/g, '/')
	// 当路径存在多个\时，转换为一个/
	formattedPath = formattedPath.replace(/\\\\+/g, '/')
	// 当路径存在多个/时，转换为一个/
	formattedPath = formattedPath.replace(/\/+/g, '/')

	return formattedPath
}

/**
 * @description 获取目录路径列表
 * @param {string} path 路径
 */
const getPathListGroup = (path: string) => {
	if (!path) return
	const pathList = path.split('/')
	if (path === '/') {
		pathListGroup.value = [{ name: '根目录', path: '/', show: true, list: [] }]
		return
	}

	pathListGroup.value = pathList.map((item, index) => {
		return {
			name: item === '' ? '根目录' : item,
			path: item === '' ? '/' : pathList.slice(0, index + 1).join('/'),
			show: true,
			showFold: false,
			loading: false,
			list: [],
		}
	})

	closeFoldDirList() // 关闭折叠目录列表

	nextTick(() => {
		more.list = []
		more.showMore = false
		// 计算宽度是否超出
		const pathListElements = document.querySelectorAll(`#${randomId.value} .path-group-item`)
		const listGroup = document.querySelector(`#${randomId.value} .path-list-group`)
		const pathListWidth = Array.from(pathListElements).reduce((prev, cur) => {
			return prev + (cur as HTMLElement).clientWidth + 4
		}, 0)

		setTimeout(() => {
			if (pathListWidth > (listGroup?.clientWidth || 400)) {
				// 超出,从前面开始隐藏
				let hideWidth = 20
				for (let i = pathListElements.length - 1; i >= 0; i--) {
					hideWidth += (pathListElements[i] as HTMLElement).clientWidth
					if (hideWidth > (listGroup?.clientWidth || 0)) {
						pathListGroup.value[i].show = false
						more.showMore = true
						more.list = pathListGroup.value.slice(i + 1)
					}
				}
				// 再隐藏多一位
				if (more.showMore) {
					pathListGroup.value[0].show = false
					more.list = pathListGroup.value.slice(1)
				}
			}
		}, 100)
	})
}

/**
 * @description 返回上一层目录
 */
const goBack = () => {
	if (disabledCutTab.value) return
	disabledCutTab.value = true // 防止多次点击

	if (dirPath.value === '/') {
		disabledCutTab.value = false
		return Message.error('当前目录为根目录')
	}

	let pathList = dirPath.value.split('/')
	pathList.pop()
	let newPath = pathList.join('/')
	if (newPath === '') newPath = '/'

	pathJumpEvent(newPath)
	setTimeout(() => {
		disabledCutTab.value = false
	}, 500)
}

/**
 * @description 获取当前折叠目录列表
 * @param {string} path 路径
 * @param {number} index 索引，用于缓存数据
 */
const getCurrentFoldDirList = async (path: string, index: number) => {
	try {
		closeFoldDirList() // 关闭上一个折叠目录列表，如果有的话
		pathListGroup.value[index].showFold = true
		pathListGroup.value[index].loading = true

		const {
			data: { dir },
		} = await getFileList({
			path,
			p: 1,
			showRow: 2000,
		})

		pathListGroup.value[index].loading = false
		pathListGroup.value[index].list = dir.map((item: any) => {
			return {
				name: item.nm,
				path: `${path}/${item.nm}`.replace(/\/+/g, '/'),
			}
		})
		pathFoldActive.value = index
		window.addEventListener('click', closeFoldDirList) // 全局点击事件
	} catch (error) {
		console.error('获取目录列表失败:', error)
		pathListGroup.value[index].loading = false
	}
}

/**
 * @description 关闭折叠目录列表
 */
const closeFoldDirList = () => {
	more.showUl = false
	if (pathListGroup.value[pathFoldActive.value]) {
		pathListGroup.value = pathListGroup.value.map((item: any) => {
			return {
				...item,
				showFold: false,
			}
		})
	}
	window.removeEventListener('click', closeFoldDirList)
}

/**
 * @description 刷新列表
 */
const refreshList = async () => {
	if (disabledCutTab.value) return
	disabledCutTab.value = true

	try {
		emit('refresh')
		// Message.success('刷新成功')
	} catch (error) {
		console.error('刷新失败:', error)
		Message.error('刷新失败')
	} finally {
		setTimeout(() => {
			disabledCutTab.value = false
		}, 500)
	}
}

// 监听路径变化
watch(
	() => dirPath.value,
	newPath => {
		getPathListGroup(newPath)
	},
	{ immediate: true }
)

// 监听输入模式变化
watch(
	() => pathInputMode.value,
	() => {
		if (!pathInputMode.value) {
			nextTick(() => {
				pathInputRef.value?.select()
			})
		}
	}
)

// 监听外部路径变化
watch(
	() => props.initialPath,
	newPath => {
		dirPath.value = newPath
	}
)

onMounted(() => {
	getPathListGroup(dirPath.value)
})

onUnmounted(() => {
	closeFoldDirList()
})

// 暴露方法给父组件
defineExpose({
	dirPath,
	refreshList,
	goBack,
	cutDirPath,
	getPathListGroup,
})
</script>

<style lang="css" scoped>
.nav-path {
	@apply flex items-center h-[3rem] w-full;
}

.path-input {
	@apply relative inline-block h-[3rem] box-border bg-[f3f3f3] text-base w-full;
}

.path-input input {
	@apply border border-light;
}

/* 目录选择列表 */
.path-list-group {
	@apply flex flex-wrap absolute top-[3rem] left-0 h-[3rem] top-0 w-full bg-extraLight border-t border-b border-light box-border rounded-b-[.2rem] z-10 cursor-text;
}

.path-group-item {
	@apply flex items-center h-full cursor-pointer max-w-[18rem];
}

.path-name {
	@apply text-secondary text-small h-full px-[.6rem] leading-[2.9rem] truncate;
}

.path-name-icon {
	@apply font-bold px-[.2rem] h-full leading-[2.9rem] border-l border-r border-dark relative;
}

.path-name-icon:hover {
	background: var(--el-fill-color-light);
}

.path-group-item:hover {
	background: var(--el-fill-color-light);
}

.path-group-item:hover .path-name-icon {
	@apply border-darker;
}

/* 目录折叠列表 */
.fold-dir-list {
	@apply absolute left-0 top-[3rem] w-[16rem] bg-extraLight border border-light box-border rounded-b-[.2rem] z-999999 cursor-text max-h-[20rem] cursor-pointer overflow-y-auto z-999;
}

.fold-dir-item {
	@apply flex items-center h-[2.6rem] cursor-pointer px-[.8rem];
}

.dir-icon {
	@apply w-[1.6rem] h-[1.6rem] bg-no-repeat mr-[.4rem];
	background-image: url(/static/images/file_icon/file_menu_icon.png);
	background-position: 0 -16px;
	background-size: auto !important;
}

.fold-dir-item span {
	@apply inline-block text-secondary text-small h-[2.4rem] px-[.6rem] leading-[2.4rem] truncate font-normal;
}

.fold-dir-item:hover {
	@apply bg-light;
}

.disabledBack {
	@apply cursor-not-allowed;
}

.disabledBack:after {
	@apply content-[''] position-absolute w-full h-full bg-lighter left-0 z-50 h-full w-full cursor-not-allowed absolute;
}

.refresh,
.back {
	@apply inline-block h-[3rem] leading-[3rem] border border-light box-border text-center align-top text-secondary px-[1rem] cursor-pointer font-bold text-medium;
}

.refresh:hover,
.back:hover {
	@apply bg-extraLight border-[var(--el-color-success-light-7)] text-primary;
}

.refresh:active,
.back:active {
	@apply bg-extraLight border-primaryDark border-[.2rem];
}
</style>
