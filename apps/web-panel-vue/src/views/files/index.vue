<template>
	<div class="file-manager">
		<div class="module-ui file-operation-area relative">
			<div class="h-full w-full flex flex-col relative" @dragenter.prevent @dragover.prevent="handleDragOff($event)">
				<!-- Tab标签页栏 -->
				<FileTabs ref="filesTabs" />

				<!-- 路径栏 -->
				<div class="nav">
					<!-- 路径栏 -->
					<div class="nav-path">
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

						<!-- 需求反馈 -->
						<div v-show="mainWidth > 1280" class="flex items-center ml-8px w-[10rem]" @click="npsSurveyV2Dialog({ name: '文件管理', type: 21, isCard: true })">
							<i class="svgtofont-desired text-medium"></i>
							<span class="bt-link">需求反馈</span>
						</div>
					</div>

					<!-- 搜索栏 -->
					<div class="navSearch">
						<bt-input-search :disabledPopover="false" class="!w-[30rem]" ref="searchRef" v-model="searchVal" @search="searchEvent" placeholder="搜索文件/目录" :clearable="false">
							<BtSearchHistory
								:list="{
									historyList: searchHistory,
									recommendList: recomList,
								}"
								name="files"
								keys="get_list"
								@update="refreshFilesList"
								@search="searchEvent"></BtSearchHistory>
						</bt-input-search>
						<div class="absolute right-[5.4rem] top-0 flex items-center">
							<el-checkbox v-model="isChildren" class=""><span class="text-tertiary">包含子目录</span></el-checkbox>
						</div>
					</div>
				</div>

				<!-- 文件操作栏 -->
				<FileNavBtn />
				<!-- 文件主操作视图 -->
				<FileMainView />
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import FILES_STORE from './store'

import { npsSurveyV2Dialog } from '@/public/index'
import { setFileListActive, recomList } from '@files/useMethods'

import FileTabs from '@files/views/tabs/index.vue'
import FileNavBtn from '@files/views/file-nav-btn/index.vue'
import FileMainView from '@files/views/main/index.vue'
import { getCookie } from '@/utils'

const store = FILES_STORE()
const { mainHeight, mainWidth, navBtnHeight, disabledCutTab, dirPath, pathInputRef, pathInputMode, pathListGroup, more, searchVal, searchHistory, searchRef, isChildren } = storeToRefs(store)
const { $reset, refreshFilesList, searchEvent, handleDragOff, refreshList, cutPathInputMode, cutDirPath, getCurrentFoldDirList, goBack, init } = store

const filesTabs = ref<any>()
// 获取cookie路径
const cookiePath = ref(getCookie('Path'))

/**
 * @description: 监听cookie路径变化
 */
watch(
	() => cookiePath.value,
	val => {
		nextTick(() => {
			if (val) {
				setFileListActive(val)
			} else {
				refreshFilesList()
			}
		})
		// 删除当前活跃的path
		// clearCookie('Path') 取消标签创建完成后删除cookie
	},
	{ immediate: true }
)

watch(
	() => mainWidth.value,
	val => {
		nextTick(() => {
			// 获取带有类名 '.nav-btn' 的第一个元素
			const navBtn: any = document.querySelector('.nav-btn')
			// 获取元素的高度
			const height = navBtn?.offsetHeight || 0

			navBtnHeight.value = height

			// tabs箭头
			filesTabs.value?.watchWindowResize()
		})
	}
)

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

onMounted(() => {
	init()
	// 提前加载常用文件
	nextTick(() => {
		import('@components/business/bt-file-upload/index.vue')
	})
})

onUnmounted($reset)
</script>

<style lang="css" scoped>
/* 主界面视图 */
.file-manager {
	@apply h-full flex px-[1.2rem] pt-[1.2rem];
	font-size: var(--el-font-size-small);
	font-family: 'PingFang SC', 'Microsoft YaHei', 'Arial', 'sans-serif';
	font-weight: 400;
}

/* 路径栏 */
.nav {
	@apply flex items-center justify-between w-full pt-12px pb-12px border-b border-light w-full;
}

.nav-path {
	@apply flex items-center h-[3rem] w-[50%];
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
	@apply font-bold px-[.2rem] h-full leading-[2.9rem] border-l border-r border-lighter relative;
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

/* 搜索 */
.navSearch {
	@apply flex items-center relative;
}

:deep(.el-input--small input.el-input__inner) {
	padding-right: 10rem;
}

:deep(.el-checkbox__label) {
	@apply text-small;
	padding-left: 0.4rem;
}

/* 左侧文件快捷工具列表 */
.shortcut-list {
	@apply flex h-full py-[1.6rem] flex-col w-[20rem] overflow-hidden transition-width duration-300 ease-in-out whitespace-nowrap;
}

.shortcut-list:hover {
	@apply overflow-y-auto;
}

.column-text {
	@apply pl-[2rem] pr-[2rem] mb-[4.4rem] text-base text-center;
}

/* 右侧文件操作区域 */
.file-operation-area {
	@apply h-full w-full;
}

.terminal-contract-tool {
	@apply bg-lighter w-[2rem] h-[6.4rem] rounded-br-full rounded-tr-full flex items-center justify-center cursor-pointer absolute right-0 top-[46%] z-998;
}

.terminal-contract-tool:after {
	@apply content-[''] block absolute w-[1rem] h-[1rem] border-white transform -rotate-135 border-[2px] border-solid border-l-[0] border-b-[0];
}

.terminal-contract-tool:hover {
	@apply bg-darkTertiary transition-all duration-300;
}

.terminal-contract-tool.is-avtive {
	@apply bg-darker transition-all duration-300;
}

.terminal-contract-tool.is-avtive:after {
	@apply transform rotate-45 left-[0rem];
}

.terminal-contract-tool.is-avtive:hover {
	@apply bg-darkTertiary transition-all duration-300;
}
</style>

<style>
.menu-fade-enter-active {
	animation: axisX 0.5s;
}

.menu-fade-enter-to {
	opacity: 1;
}

.menu-fade-leave-active {
	animation: axisX 0.5s reverse;
}

@keyframes axisX {
	from {
		width: 0;
		opacity: 0;
	}

	to {
		width: 20rem;
	}
}
</style>
