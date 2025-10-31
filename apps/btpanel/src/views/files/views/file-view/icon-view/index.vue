<template>
	<!-- <div>
		顶部菜单换行问题 1  
		卡顿
		视图切换数据清空问题 1
		滚动条偶尔出现双重 ? 
		快捷键 1
		视图刷新未加载滚动条数据 1
	</div> -->
	<!-- :class="{
			'shadow-top': scrollHeight === scrollHeightBottom && isShowShadow,
			'shadow-bottom': scrollHeight === 0 && isShowShadow,
			'shadow-bottom-top': scrollHeight > 0 && scrollHeight < scrollHeightBottom && isShowShadow,
		}" -->
	<div ref="containerRef" class="files-icon-wrapper h-full" @mousedown="startDrag" @contextmenu.prevent="handleRightClick($event, null)">
		<!-- 滚动容器 -->
		<div class="files-icon-scroll" ref="scrollContainerRef" @scroll.passive="handleScroll" @mousedown="startDrag">
			<!-- 文件列表容器 -->
			<div class="flex items-start files-icon flex-wrap content-start" :style="`column-gap:${gap}px;row-gap:10px`">
				<!-- 悬浮展示详细信息，重命名时不展示 -->
				<el-tooltip effect="dark" :show-after="1000" placement="right" v-for="(item, index) in fileList" :key="index" :disabled="item.isReName">
					<template #content>
						<!-- 移入显示详细信息 -->
						<div class="flex flex-col">
							<p class="flex items-center">
								名称：<span class="max-w-[40rem] inline-block truncate">{{ item.fileName }}</span>
							</p>
							<p>权限：{{ item.rootLevel + `/` + item.user }}</p>
							<p v-if="item.type !== 'dir'">大小：{{ getByteUnit(item.size) }}</p>
							<p>修改时间：{{ item.time }}</p>
							<p v-if="item.ps">
								备注：<span
									:class="{
										hidden: item.isPsEdit,
										'ml-[.1rem] w-[18rem] truncate inline-block': true,
									}"
									>{{ item.ps }}</span
								>
							</p>
							<p>
								企业级防篡改：<span> {{ item.isLock ? '受保护' : '未保护' }}</span>
							</p>
							<p v-if="item.isSync">{{ item.isSync === 'modules' ? '文件同步：接收端' : '文件同步：发送端' }}</p>
							<!-- <p v-if="item.ext === 'bt_split_json'">[文件合并]</p> -->
						</div>
					</template>

					<!-- 常规显示区 -->
					<div
						class="icon-file-item cursor-pointer"
						:data-filename="item.fileName"
						:class="{
							'icon-file-active': selectList.includes(item.path),
							dragging: isDraggingFile && draggedFile?.path === item.path,
						}"
						@touchend="handleEvent($event, item)"
						@click="handleActiveCheck($event, item)"
						@contextmenu.prevent="handleRightClick($event, item)">
						<!-- 图片缩略图 -->
						<template v-if="item.isSmallImage">
							<img :src="item.isSmallImage" class="w-[4.4rem] h-[4.4rem] cursor-pointer" />
						</template>
						<!-- 常规图标 -->
						<template v-else>
							<i :class="`icon-file icon-bg ${['zip', 'rar', '7z', 'gz', 'tar.gz', 'tgz', 'war'].includes(item.ext) ? 'compress' : item.ext}-icon `"></i>
						</template>
						<!-- 名称-->
						<span @click="clickName(item)" :class="`fileName  ${item.isReName ? '!hidden' : ''}`" :title="item.fileName + item.isLink">{{ item.fileName + item.isLink }}</span>
						<!-- 重命名时输入框 -->
						<template v-if="item.isReName">
							<el-input v-model="item.fileName" class="mt-[4px]" v-input-select v-blur-check="handleBlurCheck" @keydown.stop.native @keyup.enter.native="onReNameKeyup(item)" />
						</template>

						<!-- 置顶 收藏 外链 -->
						<div class="flex flex-col items-center cursor-pointer icon-option" v-show="!item.isReName">
							<!-- <span class="btlink" v-if="item.isSync" @click="openPluginView({ name: 'rsync' })">{{ item.isSync === 'modules' ? '文件同步接收端' : '文件同步发送端' }}</span> -->
							<!-- <span class="btlink" v-if="item.ext === 'bt_split_json'" @click="openFileMerge(item)">[文件合并]</span> -->
							<img v-if="item.isShare" src="/static/images/file/share-list-active.svg" title="外链分享" class="field-icon w-[16px] h-[16px]" @click="opearationIconClick(item, 'share')" />
							<img v-if="item.isFav" src="/static/images/file/favorite-list-star.svg" title="收藏文件" class="field-icon field-favorite-icon" @click="opearationIconClick(item, 'favorite')" />
							<img v-if="item.isTop" src="/static/icons/icon-top.svg" title="置顶" class="field-icon !w-[18px] !h-[18px]" @click="opearationIconClick(item, 'top')" />
						</div>

						<!-- 防篡改 : 当受保护时显示 -->
						<div v-if="!item.isReName" class="absolute bottom-3px right-[2px] cursor-pointer p-2px rounded-base hover:bg-[rgba(var(--el-color-primary-rgb),0.2)]" @click="handleFileLock(item)">
							<img v-if="item.isLock" src="/static/images/file_icon/icon-new-file-lock.svg" class="tamper-file-lock" />
							<!-- <img v-else src="/static/images/file_icon/icon-new-file-unlock.svg" class="tamper-file-unlock" /> -->
						</div>
					</div>
				</el-tooltip>

				<!-- 无数据时显示 -->
				<div v-if="data.length === 0" class="flex justify-center items-center absolute left-[45%] top-0" :style="`height:${mainHeight - (navBtnHeight || 64) - 220 - 36}px`">
					<el-empty description="暂无数据"></el-empty>
				</div>
			</div>
		</div>

		<!-- 选择框 -->
		<div v-show="isDragging" ref="selectionBoxRef" class="selection-box"></div>

		<!-- 右键 -->
		<FileContextMenu ref="context" />
		<!-- 图片预览 -->
		<el-image-viewer v-if="showViewer" @close="closeImgPreView" :initialIndex="imgIndex" :url-list="imgList" />
	</div>
</template>

<script setup lang="ts">
import { ElImageViewer } from 'element-plus'
import { storeToRefs } from 'pinia'
import { getByteUnit } from '@utils/index'
import { useInfiniteScroll } from '@vueuse/core'
import { gap, containerRef, selectionBoxRef, fileList, draggedFile, isDraggingFile, init, $reset, isDragging, scrollContainerRef, scrollLoad, watchFileList, startDrag, handleScroll, handleActiveCheck } from './useController'

import '@styles/font/file-icon.css'
import '../index.scss'

import FILES_LIST_VIEW_STORE from '../store'

import FileContextMenu from '@files/views/file-view/right-menu/index.vue'

const store = FILES_LIST_VIEW_STORE()

const { mainHeight, dataList: data, selectList, imgIndex, showViewer, imgList, context, navBtnHeight } = storeToRefs(store)
const { clickName, handleBlurCheck, handleEvent, handleRightClick, handleFileLock, onReNameKeyup, closeImgPreView, opearationIconClick } = store

watch(
	() => data.value,
	() => watchFileList(),
	{ immediate: true }
)
useInfiniteScroll(scrollContainerRef, async () => scrollLoad(), { distance: 15 })
onMounted(init)
onUnmounted($reset)
</script>

<style lang="css" scoped></style>
