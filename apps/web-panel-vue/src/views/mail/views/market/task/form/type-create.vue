<template>
	<div class="p-20px">
		<el-form ref="formRef" :model="form" :rules="rules">
			<el-form-item label="分组名称" prop="mail_type">
				<div class="w-250px">
					<el-input v-model="form.mail_type" placeholder="请输入分组名称" />
				</div>
			</el-form-item>
			<el-form-item label="邮箱" prop="file">
				<task-import v-model:value="form.file" path="/www/server/panel/data/mail/in_bulk/recipient"
					:accept="['txt', 'json']">
				</task-import>
			</el-form-item>
		</el-form>
		<bt-help class="mt-4px">
			<li>
				文件类型: txt/json 每行一个邮箱 不超过5 MB
				<!-- <bt-link target="_blank" @click="onDownload">下载模板</bt-link> -->
			</li>
		</bt-help>
	</div>
</template>

<script lang="ts" setup>
import { downloadFile } from '@mail/useMethod'
import { importContacts } from '@/api/mail'

import TaskImport from './import.vue'
import { useDataHandle } from '@/hooks/tools'

interface PropsData {
	refresh?: () => void
}

interface Props {
	compData: PropsData
}

const props = withDefaults(defineProps<Props>(), {})

const { compData } = props

const formRef = ref<any>(null)

const form = reactive({
	mail_type: '',
	file: '',
})

const rules = {
	mail_type: { required: true, message: '请输入分组名称', trigger: ['blur', 'input'] },
	file: { required: true, message: '请上传文件', trigger: ['blur', 'change'] },
}

const onDownload = () => {
	downloadFile('/www/server/panel/plugin/mail_sys/data/example_recipients.txt')
}

const onConfirm = async (close: () => void) => {
	await formRef.value?.validate()
	useDataHandle({
		loading: '正在导入...',
		message: true,
		request: importContacts({ ...form }),
		success: (res: any) => {
			if (res.status) {
				compData.refresh?.()
				close()
			}
		},
	})
}

defineExpose({
	onConfirm,
})
</script>
