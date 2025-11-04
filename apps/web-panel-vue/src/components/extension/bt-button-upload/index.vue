<template>
	<el-upload ref="upload" :name="'blob'" :data="fileData" :action="newUrl" :headers="header" accept=".csv" :show-file-list="false" :on-error="error" :multiple="false" :on-success="success" :before-upload="props.before || before">
		<el-button ref="openRef" type="default">
			<slot></slot>
		</el-button>
	</el-upload>
</template>

<script setup lang="tsx">
import type { Awaitable } from 'element-plus/es/utils/typescript'
import type { UploadFile, UploadFiles, UploadRawFile } from 'element-plus/es/components/upload/src/upload'

import { useMessage } from '@hooks/tools'
import { getToken, isDev } from '@/utils'

interface Props {
	url: string
	path: string
	data?: Record<string, any>
	error?: (response: any, uploadFile: UploadFile, uploadFiles: UploadFiles) => void
	success?: () => void
	before?: (rawFile: UploadRawFile) => Awaitable<void | undefined | null | boolean | File | Blob>
}

const { error: $error, success: $success } = useMessage()

// 上传文件
const props = withDefaults(defineProps<Props>(), {
	url: '',
	path: '',
})

const header = { 'x-http-token': window.vite_public_request_token } // 请求头

const newUrl = computed(() => {
	return `${isDev ? '/api' : ''}${props.url}`
})

const fileData = ref<any>({
	f_size: 0,
	f_path: '',
	f_name: '',
	f_start: 0,
})

// 初始化
const init = () => {
	if (props.data) fileData.value = { ...props.data, ...getToken() }
}

const before = (rawFile: UploadRawFile) => {
	const path = props.path.lastIndexOf('/')
	const directory = props.path.substring(0, path) + '/'
	const filename = props.path.substring(path + 1)
	fileData.value.f_size = rawFile.size
	fileData.value.f_path = directory
	fileData.value.f_name = filename
	fileData.value.f_start = 0
	fileData.value = {
		f_size: rawFile.size,
		f_path: directory,
		f_name: filename,
		f_start: 0,
		...getToken(),
	}
}

// 上传成功
const success = (response: any) => {
	if (response.status === false) {
		$error(response.msg)
		return
	}
	$success('导入成功')
	props.success && props.success()
}

// 错误
const error = (response: any, uploadFile: UploadFile, uploadFiles: UploadFiles) => {
	$error('上传失败')
	props.error && props.error(response, uploadFile, uploadFiles)
}

onMounted(init)
</script>
