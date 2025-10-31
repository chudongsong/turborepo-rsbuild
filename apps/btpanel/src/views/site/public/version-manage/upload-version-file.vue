<template>
	<div>
		<el-upload :show-file-list="false" class="upload-demo" ref="upload" :name="'blob'" :accept="accept" :action="uploadUrl" :auto-upload="true" :multiple="false" :file-list="uploadFilesList" :on-progress="uploadProgress" :on-change="uploadChange" :http-request="customUpload">
			<el-button ref="openRef" v-show="false" size="small" type="primary"></el-button>
			<el-button v-show="false" style="margin-left: 10px" size="small" type="success" @click="onConfirm"></el-button>
		</el-upload>
		<bt-dialog :title="false" v-model="processPopup" :area="40">
			<div class="p-2rem">
				<UploadSpeed
					:compData="{
						title: '正在上传文件，请稍后...',
						percentum: percentum,
					}"></UploadSpeed>
			</div>
		</bt-dialog>
	</div>
</template>

<script setup lang="ts">
import { useMessage } from '@/hooks/tools'
import UploadSpeed from '@site/public/version-manage/upload-speed.vue'
import axios from 'axios'

interface Props {
	compData: any
}

const props = withDefaults(defineProps<Props>(), {
	compData: {},
})
const upload = ref() // 上传文件ref
const openRef = ref() // 打开文件ref
const Message = useMessage() // 消息提示

const uploadUrl = window.location.protocol + '//' + window.location.host + '/mod/php/php_async/upload_version'

const processPopup = ref(false)
const accept = ['.tar.gz', '.gz', '.zip', '.tar', '.bz2', 'xz'].join(',')
const fileData = reactive({
	f_size: 0,
	f_path: '/tmp/',
	f_name: '',
	f_start: 0,
	ps: props.compData.ps,
	version: props.compData.version,
	sitename: props.compData.sitename,
	blob: '',
})
const uploadFilesList = ref<any>([])
const percentum = ref(0)

const customUpload = ({ file, onProgress, onSuccess, onError }: any) => {
	const formData = new FormData()
	const end = Math.min(file.size, fileData.f_start + 1024 * 1024 * 2)
	formData.append('f_name', file.name)
	formData.append('f_size', file.size)
	formData.append('f_start', fileData.f_start.toString())
	formData.append('ps', props.compData.ps)
	formData.append('version', props.compData.version)
	formData.append('sitename', props.compData.sitename)
	formData.append('blob', file.slice(fileData.f_start, end))
	formData.append('f_path', fileData.f_path)
	const cancelTokenSource = axios.CancelToken.source()
	if (!percentum.value) processPopup.value = true
	percentum.value = Math.round((fileData.f_start / file.size) * 100)
	axios
		.post(props.compData.uploadUrl ? props.compData.uploadUrl : '/mod/php/php_async/upload_version', formData, {
			headers: {
				'Content-Range': `bytes ${fileData.f_start}-${file.size}/`,
				'x-http-token': window.vite_public_request_token,
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			onUploadProgress: (event: any) => {
				if (event.event.lengthComputable) {
					// fileData.f_start += event.loaded
					onProgress({ percent: Math.round((event.loaded * 100) / event.total) })
				}
			},
			cancelToken: cancelTokenSource.token,
		})
		.then((response: any) => {
			if (typeof response.data === 'number') {
				// 如果响应是一个数字，表示已经上传了多少字节，需要继续上传
				fileData.f_start = response.data
				customUpload({ file, onProgress, onSuccess, onError })
			} else {
				percentum.value = 0
				processPopup.value = false
				Message.request(response.data)
				props.compData.getVersion()
				props.compData.close()
				onSuccess(response.data)
			}
		})
		.catch(error => {
			percentum.value = 0
			processPopup.value = false
			Message.error('导入失败')
			onError(error)
		})

	return {
		abort() {
			cancelTokenSource.cancel('Upload cancelled')
		},
	}
}

const uploadChange = (file: any, fileList: any) => {
	uploadFilesList.value = fileList
}

const uploadProgress = (event: any, file: any, fileList: any) => {
	fileData.f_start = event.percent
	uploadFilesList.value = fileList.map((item: any) => {
		if (item.uid === file.uid) {
			item.percentage = event.percent
		}
		return item
	})
}

const onConfirm = () => {
	upload.value.submit()
}

const open = () => {
	openRef.value.$el.click()
}

defineExpose({
	onConfirm,
	open,
	fileData,
})
</script>
