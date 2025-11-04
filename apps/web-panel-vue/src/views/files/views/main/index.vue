<template>
	<div class="file-main-view overflow-auto overflow-y-hidden" ref="boxScroll">
		<transition name="fade" mode="out-in">
			<div class="relative w-full" :style="{ height: `${mainHeight - (navBtnHeight || 64) - 193}px` }" v-bt-loading="fileTabActiveData.loading" v-bt-loading:title="'正在加载中，请稍后...'">
				<FileListView v-if="fileTabActiveData.type == 'list'" ref="listView" class="w-full" />
				<FileIconView v-if="fileTabActiveData.type == 'icon'" ref="iconView" class="w-full"></FileIconView>
			</div>
		</transition>
		<div class="flex px-12px pt-12px justify-between">
			<div class="flex items-center">
				<span class="mr-[1rem]">共{{ dirLength }}个目录，{{ fileLength }}个文件，文件大小</span>
				<el-popover
					trigger="hover"
					placement="top-start"
					width="260"
					:popper-class="btnPopover ? 'popper-danger whitespace-pre-wrap !transition-none' : 'whitespace-pre-wrap'"
					:content="btnPopover ? '当前目录为系统根目录（/）,执行获取文件大小将占用大量磁盘IO,将导致服务器运行缓慢。' : '安装《堡塔硬盘分析工具》可以一键扫描所有目录大小 '">
					<template #reference>
						<div @click="sizeComputed" @mouseover="checkRoot">
							<bt-link v-if="!sizeShow && !sizeLoad">计算</bt-link>
							<span v-if="sizeLoad" class="svgtofont-el-loading animate-spin"></span>
							<span class="cursor-pointer" v-if="sizeShow && !sizeLoad" style="color: green">{{ size }}</span>
						</div>
					</template>
				</el-popover>
			</div>
			<div class="">
				<bt-table-page v-model:page="fileTabActiveData.param.p" v-model:row="fileTabActiveData.param.showRow" :rowList="[100, 500, 1000, 1500, 2000]" :total="fileTabActiveData.total" @change="refreshFilesList()" />
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import FILES_STORE from '@files/store'
import { storeToRefs } from 'pinia'
import FileListView from '@files/views/file-view/list-view/index.vue'
import FileIconView from '@files/views/file-view/icon-view/index.vue'
import { setCookie, getCookie, clearCookie } from '@utils/index'
import { CheckTaskStatus } from '@api/files'
import { useMessage } from '@hooks/tools'

const store = FILES_STORE()
const { mainHeight, fileTabActiveData, dirLength, fileLength, navBtnHeight, listView, btnPopover, size, sizeShow, sizeLoad, dataList } = storeToRefs(store)
const { refreshFilesList, unbindKeydown, sizeComputed, checkRoot, initMain } = store
const Message = useMessage()

const boxScroll = ref()

// 监听元素boxScroll滚动事件
watchEffect(() => {
	if (boxScroll.value) {
		boxScroll.value.addEventListener('scroll', () => {
			console.log('scroll', boxScroll.value.scrollLeft)
		})
	}
})

onMounted(async () => {
	initMain()
	// 检查目录大小计算任务
	const calcPath = getCookie('dirCalcPath')
	if (calcPath) {
		clearCookie('dirCalcPath') // 先清除，防止并发
		try {
			const res = await CheckTaskStatus({ path: calcPath })
			if (res.status === false || res.data?.status !== 'done') {
				setTimeout(() => {
					Message.error('有未完成的目录大小计算任务，请稍后再试！')
				}, 200)
			}
		} catch (e) {}
	}
})

onUnmounted(() => {
	unbindKeydown()
})
</script>

<style lang="css" scoped>
.file-main-view {
	@apply w-full select-none;
}
.fade-enter-active,
.fade-leave-active {
	transition: opacity 0.1s;
}

.fade-enter,
.fade-leave-to {
	opacity: 0;
}
</style>
