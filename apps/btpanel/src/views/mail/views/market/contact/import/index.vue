<template>
	<div class="p-20px">
		<el-form ref="formRef" :model="form" :rules="rules">
			<el-form-item label="分组" prop="etypes">
				<div class="w-260px">
					<type-select ref="typeSelect" class="bt-multiple-select" v-model:value="form.etypes" multiple
						filterable></type-select>
				</div>
			</el-form-item>
			<el-form-item label="文件" prop="file">
				<import-file v-model:value="form.file" path="/www/server/panel/data/mail/in_bulk/recipient"
					:accept="['txt', 'json']"> </import-file>
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
import { importContacts, importContactsEtypes } from '@/api/mail'

import TypeSelect from '@/views/mail/public/type-select.vue'
import ImportFile from './import.vue'
import { getAccessAddress } from '@/views/mail/useMethod'
import { useDataHandle } from '@/hooks/tools'

interface PropsData {
	active: number
	group: number
	refresh: () => void
}

interface Props {
	compData: PropsData
}

const popupClose = inject<() => void>('popupClose')

const props = withDefaults(defineProps<Props>(), {})

const { compData } = props

const formRef = ref<any>(null)

const form = reactive({
	etypes: compData.group !== -1 && compData.group !== undefined ? [compData.group] : [],
	file: '',
})

const rules = {
	etypes: {
		trigger: 'change',
		validator: () => {
			if (!form.etypes.length) {
				return new Error('请选择邮件类型')
			}
			return true
		},
	},
	file: { required: true, message: '请上传文件', trigger: ['blur', 'change'] },
}

const getParams = () => {
	return {
		etypes: form.etypes.join(','),
		file: form.file,
		active: compData.active,
	}
}

const onDownload = () => {
	const url = getAccessAddress()
	window.open(`${url}/www/server/panel/plugin/mail_sys/data/example_recipients.txt`, '_blank', 'noopener,noreferrer')
}

const onConfirm = async () => {
	await formRef.value?.validate()
	useDataHandle({
		request: importContactsEtypes(getParams()),
		loading: '导入中...',
		message: true,
		success: () => {
			compData.refresh()
			popupClose?.()
		},
	})
}

defineExpose({
	onConfirm,
})
</script>
