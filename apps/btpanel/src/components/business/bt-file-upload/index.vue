<template>
	<div ref="upload" class="upload-file-view">
		<div v-show="isDraggingOver" id="upload-mask">请将需要上传的文件/文件夹拖到此处</div>
		<div class="p-[20px]">
			<template v-if="uploadStatus.indexOf('paused') > -1">
				<input ref="uploadFileInput" type="file" :webkitdirectory="enableDirectoryMode" style="display: none" multiple @change="getUploadFiles" />
				<div class="mb-[16px] flex justify-between">
					<el-dropdown split-button type="default" :show-timeout="50" :hide-timeout="50" @click="handleClick" @command="handleClick">
						上传文件
						<template #dropdown>
							<el-dropdown-menu class="w-[10rem]">
								<el-dropdown-item command="file">上传文件</el-dropdown-item>
								<el-dropdown-item command="dir">上传文件夹</el-dropdown-item>
							</el-dropdown-menu>
						</template>
					</el-dropdown>
					<el-button :disabled="disabledUpload" @click="clearUploadList">清空列表</el-button>
				</div>
			</template>
			<template v-if="uploadStatus.indexOf('uploading') > -1">
				<div class="upload-press">
					<span>总进度：{{ uploadData.totalProgress }}%</span>
					<bt-divider />
					<span>正在上传：({{ `${uploadData.uploadList}/${uploadFilesList.length}` }})</span>
					<bt-divider />
					<span>上传速度：{{ uploadData.currentSpeed }}/s</span>
					<bt-divider />
					<span>预计耗时：{{ uploadData.timeRemaining }}</span>
				</div>
			</template>
			<template v-if="uploadStatus.indexOf('success') > -1">
				<div class="upload-press">
					<span>上传大小：{{ uploadData.uploadSize }}</span>
					<bt-divider />
					<span>共耗时：{{ uploadData.timeElapsed }}</span>
					<bt-divider />
					<span>平均上传速度：{{ uploadData.averageSpeed }}/s</span>
					<bt-divider />
					<span>上传成功：{{ uploadData.successNumber }}个</span>
					<bt-divider v-show="uploadData.errorNumber > 0" />
					<span v-show="uploadData.errorNumber > 0">上传失败：{{ uploadData.errorNumber }}个</span>
				</div>
			</template>
			<div v-if="isShowDropTips" class="upload-files-tips">
				<span>请将需要上传的文件/文件夹拖到此处</span>
			</div>
			<div v-else class="uploader-list">
				<div class="th">
					<div class="td !w-[55%]">文件名</div>
					<div class="td">文件大小</div>
					<div class="td">上传状态</div>
					<div v-show="uploadStatus !== 'success'" class="td justify-end">操作</div>
				</div>
				<div>
					<RecycleScroller v-slot="{ item }" class="!mb-0 overflow-auto file-upload-list files-list" :class="'!h-[400px]'" :items="uploadFilesList" :item-size="45" :buffer="800" key-field="vid">
						<div class="uploader-file tr">
							<div
								:class="{
									'td-progress': true,
									error: item.status === 'error',
									success: item.status === 'success',
								}"
								:style="progressStyle(item)"></div>
							<div class="td-block">
								<div class="td !w-[55%] flex">
									<i class="icon-bg" :class="`${uploadFileIcon(item)}-icon`"></i>
									<span class="flex-1 w-0 ml-[4px] truncate h-[20px] leading-[20px]" :title="getFileName(item)">
										{{ getFileName(item) }}
									</span>
								</div>
								<div class="td">{{ item.size }}</div>
								<div class="td">
									<el-tooltip v-show="item.status !== 'uploading'" effect="dark" :content="`${uploadStatusInfo(item.status)}${item.message ? `，${item.message}` : ''}`" placement="right" :show-after="200">
										<span v-show="item.status !== 'uploading'" class="truncate">
											{{ uploadStatusInfo(item.status) }}
											<span v-if="item.message"> ,{{ item.message }} </span>
										</span>
									</el-tooltip>
									<span v-show="item.status === 'uploading'">
										<span>上传中({{ parseInt(item.progress) }}%)</span>
									</span>
								</div>
								<div v-show="uploadStatus !== 'success'" class="td justify-end">
									<bt-link v-show="uploadStatus.indexOf('paused') > -1" @click="cancelFile(item)">取消</bt-link>
								</div>
							</div>
						</div>
					</RecycleScroller>
				</div>
			</div>

			<div class="flex justify-end">
				<template v-if="uploadStatus.indexOf('paused') > -1">
					<el-button type="primary" @click="uploadSubmit"> 开始上传 </el-button>
				</template>
				<template v-if="['success', 'error'].includes(uploadStatus)">
					<el-button type="primary" @click="clearUploadList"> 继续上传 </el-button>
				</template>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { RecycleScroller } from 'vue-virtual-scroller'
import { useMessage, useConfirm } from '@/hooks/tools'
import { isString } from '@utils/index'
import filesStore from '@/views/files/store'

import type { FileUploadEventProps } from './type.d'
import { UploadFile, useFileUploadEventMount, useFileUploadEventRemove } from './hooks'

interface Props {
	compData: {
		path: string
	}
}
const props = withDefaults(defineProps<Props>(), {
	compData: () => ({
		path: '',
	}),
})
const message = useMessage()
const { refreshFilesList } = filesStore()
let eventMount: FileUploadEventProps | null = null // 事件挂载对象
const upload = ref()
const isDraggingOver = ref(false) // 是否拖拽中
const uploadStatus = ref('paused') // 上传状态, waiting, uploading, success, error, paused
const uploadFilesList = ref<string[]>([]) // 上传文件列表, 用于判断
const uploadFileInput = ref() // 上传文件input
const enableDirectoryMode = ref(false) // 是否启用文件夹模式
const uploadData = reactive({
	totalProgress: 0,
	uploadList: 0,
	sizeUploaded: 0,
	currentSpeed: 0,
	timeRemaining: 0,
	timeElapsed: 0,
	averageSpeed: 0,
	errorNumber: 0,
	successNumber: 0,
	uploadSize: '',
})

const uploadFile = new UploadFile({
	target: '/files?action=upload',
	uploadPath: props.compData.path || '/www/wwwroot',
	// 更新上传文件列表
	renewalData: (list: any) => {
		uploadFilesList.value = [...list]
	},

	// 更新上传进度
	renewalSpeed: (data: any) => {
		uploadData.totalProgress = data.totalProgress
		uploadData.uploadList = data.uploadList
		uploadData.sizeUploaded = data.sizeUploaded
		uploadData.currentSpeed = data.currentSpeed
		uploadData.timeRemaining = data.timeRemaining
	},
	// 更新上传状态
	renewalStatus: (config: any) => {
		uploadStatus.value = config.status
		uploadData.timeElapsed = config.timeElapsed
		uploadData.averageSpeed = config.averageSpeed
		uploadData.uploadSize = config.uploadSize
		uploadData.successNumber = config.successNumber
		uploadData.errorNumber = config.errorNumber
	},
})

const { uploadStatusInfo, initData, fileUploadLimit, cancelFile } = uploadFile

/**
 * @description 是否禁用上传按钮
 */
const disabledUpload = computed(() => {
	return !uploadFilesList.value.length
})
/**
 * @description 是否显示拖拽提示
 */
const isShowDropTips = computed(() => {
	return !uploadFilesList.value.length
})

/**
 * @description 获取文件名
 * @param {any} item
 */
const getFileName = (item: { path: string; name: string }) => {
	return `${item.path}/${item.name}`.replace(/\/\//, '/')
}

/**
 * @description 上传文件图标
 * @param {any} file 文件对象
 * @returns {string}
 */
const uploadFileIcon = (file: any) => {
	if (file.isFolder) return 'folder'
	const ext = file.name.split('.').pop()
	const compression = ['zip', 'rar', 'gz', 'tar', 'war', 'tgz', 'bz2', '7z', 'tar.gz']
	if (compression.includes(ext)) return 'compress'
	return ext
}

/**
 * @description 点击上传文件
 * @param {string} command
 */
const handleClick = (command: string) => {
	uploadFile.isGetFiles = true
	if (command === 'file' || !isString(command)) {
		enableDirectoryMode.value = false
	} else {
		enableDirectoryMode.value = true
	}
	setTimeout(() => {
		uploadFileInput.value.click()
	}, 0)
}
/**
 * @description 获取上传文件
 * @param {any} e
 */
const getUploadFiles = (e: any) => {
	const { files } = e.target
	for (let i = 0; i < files.length; i++) {
		// eslint-disable-next-line @typescript-eslint/naming-convention
		const path = `/${files[i].webkitRelativePath === '' ? files[i].name : files[i].webkitRelativePath}`
		if (!fileUploadLimit(files[i], path)) return false
	}
	if (!uploadFile.isGetFiles) return false
}

/**
 * @description 进度条位置
 * @param {number} item
 */
const progressStyle = (item: any) => {
	if (item.status === 'success') return { transform: 'translateX(-0%)' }
	return {
		transform: `translateX(-${100 - item.progress}%)`,
	}
}

/**
 * @description 开始上传
 */
const uploadSubmit = () => {
	if (uploadFilesList.value.length === 0) return message.error('请添加需要上传的文件')
	uploadStatus.value = 'uploading'
	// 检测文件是否存在
	uploadFile.useFileUploadExistsConfirm()
}
/**
 * @description 清空上传列表
 */
const clearUploadList = () => {
	initData()
	uploadFilesList.value = []
	uploadStatus.value = 'paused'
	uploadFileInput.value.value = ''
}

/**
 * @description 拖拽进入
 */
const dragenter = () => {
	isDraggingOver.value = true
	if (uploadStatus.value === 'success') clearUploadList()
}

/**
 * @description 拖拽离开
 */
const dragleave = () => {
	isDraggingOver.value = false
}

/**
 * @description 拖拽放下
 */
const drop = (event: Event) => {
	isDraggingOver.value = false
	uploadFile.fileSelectHandler(event, (fileList: any[]) => {
		uploadFilesList.value = fileList || []
	})
}

const onCancel = async () => {
	try {
		if (['uploading', 'paused'].includes(uploadStatus.value) && uploadFilesList.value.length) {
			await useConfirm({
				title: '取消上传',
				width: '35rem',
				icon: 'warning-filled',
				content: '是否取消上传，取消后将清空上传列表？',
			})
			refreshFilesList() // 刷新文件列表
			return true
		}
	} catch (error) {
		return false
	}
}

onMounted(() => {
	eventMount = {
		...useFileUploadEventMount({ dragenter, dragleave, drop, dragover: () => {} }),
	}
})

onBeforeUnmount(() => {
	useFileUploadEventRemove(eventMount as FileUploadEventProps)
})

defineExpose({
	onCancel,
})
</script>

<style lang="css" scoped>
#upload-mask {
	@apply fixed flex items-center justify-center inset-0 bg-white bg-opacity-60 border-3 border-dashed border-base z-999 text-tertiary text-titleLarge text-center overflow-hidden;
}

.upload-files-tips,
.uploader-list {
	@apply h-[440px] border-[2px] border-dashed border-base text-center mb-[16px];
}

.upload-files-tips > span,
.uploader-list > span {
	@apply text-iconLarge text-tertiary absolute w-full left-0 top-1/2 mt-[-40px];
}

.uploader-list {
	@apply border-0 text-left;
}

.uploader-list :deep(.th),
.uploader-list :deep(.tr) {
	@apply flex w-full px-[6px] items-center border-b border-base text-tertiary text-base;
}

.uploader-list :deep(.th) {
	@apply h-[40px];
}

.uploader-list :deep(.tr) {
	@apply h-[45px];
}

.uploader-list :deep(.td) {
	@apply flex items-center w-[15%] px-[10px] text-small;
}

.uploader-list :deep(.uploader-file) {
	@apply relative overflow-hidden;
}

.uploader-list :deep(.td-progress) {
	@apply absolute top-0 left-0 h-full w-full transition-all duration-500;
	-webkit-transform: translateX(-100%);
	transform: translateX(-100%);
	background-color: var(--el-color-success-light-9);
}

.uploader-list :deep(.td-progress.success) {
	background-color: var(--el-color-success-light-9);
}

.uploader-list :deep(.td-progress.error) {
	background-color: var(--el-color-warning-light-9);
}

.uploader-list :deep(.td-block) {
	@apply relative overflow-hidden z-10 flex w-full;
}

.uploader-drop {
	@apply relative p-[0] border-0 bg-white;
}

.upload-press {
	@apply h-4rem text-small  pl-2rem mb-1rem leading-[4rem] flex items-center;
	background-color: var(--el-color-success-light-9);
	border: 1px solid var(--el-color-success-light-6);
	color: var(--el-color-primary);
	border-radius: var(--el-border-radius-small);
}

.upload-press :deep(.clearIcon) {
	@apply text-subtitleLarge leading-[4rem] mr-[2rem];
	background-color: var(--el-color-success-light-3);
}

.upload-press :deep(.clearIcon:hover) {
	@apply cursor-pointer text-successDark;
}
</style>
