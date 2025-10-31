<template>
	<div>
		<el-upload
			class="upload-demo"
			ref="upload"
			:name="'file'"
			:data="() => fileData"
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
import { useConfirm, useDialog, useMessage } from '@/hooks/tools'

const Message = useMessage()

const emit = defineEmits(['upload-success'])

const openRef = ref<any>()
const uploadUrl = window.location.protocol + '//' + window.location.host + '/crontab?action=import_crontab_from_json'
const fileData = reactive({
	overwrite: 1,
})
const uploadFilesList = ref<any>([])

const accept = ['.json'].join(',')
const uploadSuccess = async (response: any, file: any, fileList: any) => {
	if (response.status === false) {
		Message.error(response.msg)
		return
	} else {
		let resultData: any = []
		response.successful_tasks?.forEach((item: any) => {
			resultData.push({
				name: item,
				status: 1,
				msg: '导入成功',
			})
		})
		response.failed_tasks?.forEach((item: any) => {
			resultData.push({
				name: item,
				status: 0,
				msg: '导入失败',
			})
		})
		response.skipped_tasks?.forEach((item: any) => {
			resultData.push({
				name: item,
				status: 2,
				msg: '重复任务已跳过',
			})
		})
		await useDialog({
			title: '导入计划任务结果',
			area: 42,
			component: () => import('@/components/extension/bt-result/index.vue'),
			compData: {
				resultData: resultData,
				autoTitle: response.msg,
				resultColumn: [
					{
						label: '计划任务名称',
						prop: 'name',
					},
					{
						label: '操作结果',
						align: 'right',
						render: (row: any) => {
							return h(
								'span',
								{
									class: row.status === 1 ? 'text-primary' : row.status === 0 ? 'text-danger' : '',
								},
								row.msg
							)
						},
					},
				],
			},
		})
	}
	emit('upload-success')
}
const uploadError = () => {
	Message.error('导入失败')
}
const header = { 'x-http-token': window.vite_public_request_token }

const uploadBefore = async (file: any) => {
	file.value = file
	const res: any = await useConfirm({
		type: 'check',
		title: '提示',
		content: `是否继续将文件中的数据导入到现有计划任务中？`,
		check: {
			content: '跳过重复计划任务',
			value: true,
			onConfirm: (status: boolean) => {
				fileData.overwrite = status ? 1 : 0
			},
		},
	})
	if (res && !fileData.overwrite) {
		await useConfirm({
			icon: 'warning',
			title: '提示',
			content: `导入重复的任务可能会导致系统服务异常，请谨慎操作！`,
		})
	}
	return res
}

const uploadChange = async (file: any, fileList: any) => {
	uploadFilesList.value = fileList
}

const uploadProgress = (event: any, file: any, fileList: any) => {
	uploadFilesList.value = fileList.map((item: any) => {
		if (item.uid === file.uid) {
			item.percentage = event.percent
		}
		return item
	})
}

const open = () => {
	openRef.value.$el.click()
}
defineExpose({
	open,
	fileData,
})
</script>

<style scoped lang="sass"></style>
