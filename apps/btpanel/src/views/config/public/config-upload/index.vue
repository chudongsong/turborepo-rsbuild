<template>
	<div>
		<el-upload
			class="upload-demo"
			ref="uploadRef"
			:name="'blob'"
			:data="fileData"
			:action="uploadUrl"
			:headers="header"
			:accept="accept"
			:on-error="uploadError"
			:multiple="false"
			:show-file-list="false"
			:auto-upload="true"
			:on-success="uploadSuccess"
			:on-progress="uploadProgress"
			:file-list="uploadFilesList"
			:on-change="uploadChange"
			:before-upload="uploadBefore">
			<el-button ref="openRef" v-show="false" size="small" type="primary"></el-button>
		</el-upload>
	</div>
</template>
<script setup lang="ts">
import { useMessage } from '@/hooks/tools'

const Message = useMessage()

const emit = defineEmits(['upload-success'])

const uploadRef = ref<any>() // 上传组件ref
const openRef = ref<any>() // 上传组件打开按钮ref

const uploadUrl = window.location.protocol + '//' + window.location.host + '/panel/whole_machine_backup/input'
const fileData = reactive({
	f_size: 0,
	f_path: '/www/backup/whole_machine_backup/',
	f_name: '',
	f_start: 0,
})
const uploadFilesList = ref<any>([])

const accept = ['.tar.gz'].join(',')
const uploadSuccess = (response: any, file: any, fileList: any) => {
	Message.request(response)
	if (response.status) emit('upload-success')
}
const uploadError = (err: any, file: any, fileList: any) => {
	Message.error('导入失败')
}
const header = { 'x-http-token': window.vite_public_request_token }
const uploadBefore = (file: any) => {
	file.value = file
	fileData.f_size = file.size
	fileData.f_name = file.name
	fileData.f_start = 0
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
const removeFile = (row: any) => {
	uploadFilesList.value = uploadFilesList.value.filter((item: any) => item.name !== row.name)
}

const onConfirm = () => {
	uploadRef.value.submit()
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

<style scoped lang="sass"></style>
