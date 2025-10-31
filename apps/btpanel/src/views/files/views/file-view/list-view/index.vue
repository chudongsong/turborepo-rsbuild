<template>
	<!-- :style="(item.type != 'operation' ? `width:${item.width}rem;` : '') + item.style" " -->
	<!-- `width:${item.width}rem;`:item.type != 'operation', -->
	<div class="h-full files-list relative" @contextmenu.prevent="handleRightClick($event, null)">
		<!-- 表头 -->
		<div class="table-head flex h-[3.6rem] overflow-hidden">
			<div class="flex flex-shrink-0 w-[30px] px-[10px]">
				<div class="custom-td">
					<el-checkbox :indeterminate="isIndeterminate" v-model="checkedAll" @change="handleCheckAll"></el-checkbox>
				</div>
			</div>

			<div
				:class="`files-head-item  ${item.class || ''} !w-[${item.width}rem]  ${mainWidth <= 1140 && item.type === 'operation' ? 'shaow' : ''}`"
				:style="{ ...item.style, minWidth: item.type === 'operation' ? mWidth + 'rem' : 'auto' }"
				v-for="(item, index) in headData"
				:key="index"
				@click="sortTable(item)">
				<span>{{ item.label }}</span>
				<div class="flex flex-col ml-8px justify-center" v-if="item.sortable">
					<i :class="`svgtofont-el-caret-top text-medium leading-[.6rem] hover:text-[var(--el-color-primary-light-3)] text-disabled ${item.sort === 'asc' ? '!text-primary' : ''}`"></i>
					<i :class="`svgtofont-el-caret-bottom text-medium leading-[.8rem] hover:text-[var(--el-color-primary-light-3)] text-disabled ${item.sort === 'desc' ? '!text-primary' : ''}`"></i>
				</div>
			</div>
		</div>
		<!-- :style="`height:${mainHeight - (navBtnHeight || 64) - 230}px`" -->

		<RecycleScroller
			:key="randomKey"
			v-bt-loading="fileTabActiveData.loading"
			v-bt-loading:title="`正在加载文件列表，请稍后...`"
			class="custom-tbody scrollTable relative"
			:style="`height:${mainHeight - (navBtnHeight || 64) - 230}px`"
			:items="data"
			:item-size="36"
			:buffer="500"
			:emit-update="true"
			key-field="vid"
			ref="scrollRef"
			:class="{
				'shadow-top': scrollHeight === scrollHeightBottom && isShowShadow,
				'shadow-bottom': scrollHeight === 0 && isShowShadow,
				'shadow-bottom-top': scrollHeight > 0 && scrollHeight < scrollHeightBottom && isShowShadow,
			}">
			<template v-slot="{ item }">
				<div :class="`custom-tr flex ${checkedList.has(item.path) ? 'row-checked' : ''}`" @click="handleEvent($event, item)" @touchend="handleEvent($event, item)" @contextmenu.prevent="handleRightClick($event, item)">
					<div class="custom-td w-[30px]">
						<div class="custom-checkbox" @click="handleCheckFile(item)">
							<i :id="'vid-' + item.vid" class="checkbox--icon"></i>
						</div>
					</div>
					<!-- 文件名称 -->
					<div class="custom-td w-[420px] flex justify-between items-center">
						<div class="flex items-center w-[50%] flex-1">
							<template v-if="item.isSmallImage">
								<img :src="item.isSmallImage" class="w-[2.4rem] h-[2.4rem]" />
							</template>
							<template v-else>
								<i :class="`icon-bg ${['zip', 'rar', '7z', 'gz', 'tar.gz', 'tgz', 'war'].includes(item.ext) ? 'compress' : item.ext}-icon`"></i>
							</template>
							<span :class="`cursor-pointer hover:text-primary truncate max-w-[84%] ml-[4px] fileName ${item.isReName ? 'hidden' : ''}`" @click="clickName(item)" :title="item.fileName + item.isLink">{{ item.fileName + item.isLink }}</span>
							<template v-if="item.isReName">
								<el-input v-model="item.fileName" class="ml-8px" v-input-select v-blur-check="handleBlurCheck" @keydown.stop.native @keyup.enter.native="onReNameKeyup(item)" />
							</template>
						</div>
						<div class="flex items-center cursor-pointer item-option" v-show="!item.isReName">
							<span class="btlink" v-if="item.isSync" @click="openPluginView({ name: 'rsync' })">{{ item.isSync === 'modules' ? '文件同步接收端' : '文件同步发送端' }}</span>
							<span class="btlink ml-8px" v-if="item.ext === 'bt_split_json'" @click="openFileMerge(item)">[文件合并]</span>
							<img v-if="item.isShare" src="/static/images/file/share-list-active.svg" class="foot-btn field-share-icon" @click="opearationIconClick(item, 'share')" />
							<img v-if="item.isFav" src="/static/images/file/favorite-list-star.svg" class="foot-btn field-favorite-icon" @click="opearationIconClick(item, 'favorite')" />
							<img v-if="item.isTop" src="/static/icons/icon-top.svg" class="foot-btn field-top-icon" @click="opearationIconClick(item, 'top')" />
						</div>
					</div>
					<!-- 企业级防篡改 -->
					<div class="custom-td w-[120px]">
						<div class="tamper-icon-item cursor-pointer" @click="handleFileLock(item)">
							<template v-if="item.isLock">
								<span class="btlink">受保护</span>
								<img src="/static/images/file_icon/icon-new-file-lock.svg" class="tamper-file-lock" />
							</template>
							<template v-else>
								<span>未保护</span>
								<img src="/static/images/file_icon/icon-new-file-unlock.svg" class="tamper-file-unlock" />
							</template>
						</div>
					</div>
					<!-- 权限 -->
					<div class="custom-td w-[150px]">
						<span class="truncate inline-block w-full" :title="item.rootLevel + '/' + item.user">
							{{ item.rootLevel + '/' + item.user }}
						</span>
					</div>
					<!-- 大小 -->
					<div class="custom-td w-[100px]">
						<template v-if="item.type === 'dir'">
							<DirCalc :row="item" :status="item.isDirComputed" class="size-link"></DirCalc>
						</template>
						<template v-else> {{ getByteUnit(item.size) }} </template>
					</div>
					<!-- 修改时间 -->
					<div class="custom-td w-[160px]">
						<span>{{ item.time }}</span>
					</div>
					<!-- 备注 -->
					<div class="custom-td min-w-[20rem]" @mouseenter="handleEnPsView(item)" @mouseleave="handleLvPsView($event, item)">
						<span
							:class="{
								hidden: item.isPsEdit,
								'ml-[.1rem] w-[18rem] truncate inline-block': true,
							}"
							:title="item.ps"
							>{{ item.ps }}</span
						>
						<el-input v-model="item.ps" v-if="item.isPsEdit" @blur="handleSetPs(item)" @keyup.enter="$event.target.blur()" />
					</div>
					<!-- 操作 -->
					<!-- style="box-shadow: rgba(var(--el-color-black-rgb), 0.1) -2px 4px 4px" -->
					<div :class="`custom-operate custom-td flex-1 justify-end min-w-[30.4rem] file-action sticky -right-2px bg-inherit  ${mainWidth <= 1140 ? 'shaow' : ''}`">
						<div :class="` ${mainWidth <= 1140 ? '' : 'hidden'} `">
							<a class="btlink" v-if="item.icon === 'text' && item.isFile" @click="openFile(item)">编辑</a>
							<a class="btlink" v-if="item.icon === 'images' && item.isFile" @click="openImgView(item)">预览</a>
							<a class="btlink" v-if="item.icon === 'video' && item.isFile" @click="videoPlayDialog(item)">播放</a>
							<a class="btlink" @click="copyFiles(item, 'copy')">复制</a>
							<a class="btlink" @click="copyFiles(item, 'cut')">剪切</a>
							<a class="btlink" @click="handleReName(item)">重命名</a>
							<a class="btlink" @click="openDetail(item, 'auth')">权限</a>
							<a class="btlink" @click="createCompress(item)">压缩</a>
							<a class="btlink" v-if="item.icon === 'compress'" @click="deCompressFile(item)">解压</a>
							<a
								class="btlink"
								@click="
									delFileEvent(item, () => {
										selectList = []
									})
								"
								>删除</a
							>
							<a class="btlink" @click="handleRightClick($event, item)">
								更多
								<span class="svgtofont-el-arrow-down !text-small align-bottom"></span>
							</a>
						</div>
					</div>
				</div>
			</template>
		</RecycleScroller>
		<div v-if="data.length === 0" class="flex justify-center items-center absolute left-[45%] top-0" :style="`height:${mainHeight - (navBtnHeight || 64) - 220 - 36}px`">
			<el-empty description="暂无数据"></el-empty>
		</div>

		<FileContextMenu ref="context" />
		<el-image-viewer v-if="showViewer" :z-index="10000" @close="closeImgPreView" :initialIndex="imgIndex" :url-list="imgList" />
	</div>
</template>

<script lang="ts" setup>
import { ElImageViewer } from 'element-plus'
import { RecycleScroller } from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
import '@styles/font/file-icon.css'
import '../index.scss'

import FileContextMenu from '@files/views/file-view/right-menu/index.vue'

import { storeToRefs } from 'pinia'
import FILES_LIST_VIEW_STORE from '../store'
import { openFile, openFileMerge, copyFiles, openDetail, createCompress, deCompressFile, delFileEvent, videoPlayDialog } from '@files/useMethods'
import { openPluginView } from '@/public/index'
import FILES_STORE from '@files/store'

import { getByteUnit } from '@utils/index'
import DirCalc from '../dir-calc/index.vue'
import { useGlobalStore } from '@/store/global'

const { mainWidth } = useGlobalStore()
const { isHaveScoller } = storeToRefs(FILES_STORE())

const store = FILES_LIST_VIEW_STORE()
const { mainHeight, headData, dataList: data, selectList, checkedAll, dataList, imgIndex, showViewer, imgList, scrollHeight, scrollHeightBottom, isShowShadow, context, scrollRef, navBtnHeight, fileTabActiveData } = storeToRefs(store)

const { bindMouseDown, clickName, handleBlurCheck, handleEvent, handleRightClick, handleCheckFile, handleCheckAll, handleFileLock, handleEnPsView, handleLvPsView, handleSetPs, handleReName, openImgView, opearationIconClick, onReNameKeyup, sortTable, closeImgPreView, init, $reset } = store

const isIndeterminate = computed(() => {
	return selectList.value.length > 0 && selectList.value.length != data.value.length
})

// 选中集合
const checkedList = computed(() => {
	return new Set(selectList.value)
})

const randomKey = ref(Math.random())

watch(
	() => data.value,
	() => {
		randomKey.value = Math.random()
		bindMouseDown() // 重新绑定鼠标按下事件
	}
)

// 监听元素vue-recycle-scroller__item-wrapper 滚动
watchEffect(() => {
	if (scrollRef.value?.$el && mainWidth.value < 1140) {
		scrollRef.value?.$el?.addEventListener('scroll', () => {
			if (document.querySelector('.table-head')) {
				document.querySelector('.table-head').scrollLeft = scrollRef.value?.$el.scrollLeft
				const scrollWidth = scrollRef.value?.$el.scrollWidth // 滚动条宽度
				const clientWidth = scrollRef.value?.$el.clientWidth // 可视区域宽度
				const scrollLeft = scrollRef.value?.$el.scrollLeft // 滚动条左侧距离
				// 若滚动到最右边，则隐藏阴影
				if (scrollLeft === scrollWidth - clientWidth) {
					// 移除custom-operate类上的 shaow类
					document.querySelectorAll('.custom-operate').forEach(item => {
						item.classList.remove('shaow')
					})
				} else {
					// 添加custom-operate类上的 shaow类
					document.querySelectorAll('.custom-operate').forEach(item => {
						item.classList.add('shaow')
					})
				}
			}
		})
	}
})

watch(
	() => mainWidth.value,
	val => {
		const list = document.querySelector('.custom-tbody')
		if (list) {
			const height = dataList.value.length * 36 > list.clientHeight
			if (height) isHaveScoller.value = true
			else isHaveScoller.value = false
		}
	},
	{
		immediate: true,
	}
)

const mWidth = computed(() => {
	if (isHaveScoller.value) return 10.8
	return 10
})

onMounted(init)
onUnmounted($reset)

defineExpose({
	handleCheckAll,
	selectList,
})
</script>

<style scoped lang="css">
.table-head {
	@apply flex items-center w-full;
	@apply bg-light;
}

.operation {
	@apply float-right flex-1;
}

.shadow-bottom {
	box-shadow: inset 0 -10px 10px -10px rgba(var(--el-color-black-rgb), 0.2);
}

.shadow-top {
	box-shadow: inset 0 10px 10px -10px rgba(var(--el-color-black-rgb), 0.2);
}

.shadow-bottom-top {
	box-shadow:
		inset 0 -10px 10px -10px rgba(var(--el-color-black-rgb), 0.2),
		inset 0 10px 10px -10px rgba(var(--el-color-black-rgb), 0.2);
}

.file-action .btlink {
	@apply cursor-pointer;
}

.file-action .btlink:hover {
	@apply underline;
}
</style>
