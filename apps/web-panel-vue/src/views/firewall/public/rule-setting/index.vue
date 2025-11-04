<template>
	<div class="mx-8px inline-block">
		<el-button @click="openUploadView">导入规则</el-button>
		<el-button @click="openExportView">导出规则</el-button>
		<RulesUpload ref="fileUploadRef" @upload-success="uploadSuccess" class="w-0 h-0"></RulesUpload>

		<bt-dialog title="导出规则" show-footer v-model="outputData.showPopup" :area="42" @confirm="exportConfirm">
			<div class="p-20px flex items-center">
				<div class="inline-block mr-[2rem]">导出方向</div>
				<el-select v-model="outputData.type" class="!w-[30rem]" placeholder="请选择导出方向">
					<el-option v-for="item in chainOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
				</el-select>
			</div>
		</bt-dialog>
	</div>
</template>

<script setup lang="ts">
import { inputRules, outPutRules } from '@/api/firewall'
import { Message, useDataHandle } from '@/hooks/tools'

import RulesUpload from '@firewall/public/rules-upload/index.vue'

interface Props {
	type: string
	refreshFn: () => void
}

const props = withDefaults(defineProps<Props>(), {
	type: 'ALL',
	refreshFn: () => {},
})

const fileUploadRef = ref<any>(null) // 文件上传ref
const outputData = reactive<any>({
	showPopup: false,
	type: 'ALL',
}) // 导出弹窗

const chainOptions = [
	// 导出方向
	{ label: '所有方向', value: 'ALL' },
	{ label: '入站', value: 'INPUT' },
	{ label: '出站', value: 'OUTPUT' },
]

/**
 * @description 打开上传规则弹窗
 */
const openUploadView = () => {
	fileUploadRef.value.open()
}

/**
 * @description 打开导出规则弹窗
 */
const openExportView = async () => {
	if (props.type === 'port' || props.type === 'ip') {
		outputData.showPopup = true
		return
	}
	exportRequest()
}

/**
 * @description 导出规则请求
 * @param {string} chain 方向
 */
const exportRequest = async (chain?: string) => {
	let params: any = { rule: props.type }
	if (chain) params = { ...params, chain }
	if (props.type === 'country_rule') params = { rule_name: props.type }
	const res = await useDataHandle({
		loading: '正在导出中，请稍后...',
		request: outPutRules(params),
		data: { status: Boolean, msg: String },
	})
	if (res.status) window.open('/download?filename=' + res.msg)
	else Message.request(res)
}

/**
 * @description 导出规则确认
 */
const exportConfirm = async () => {
	outputData.showPopup = false
	exportRequest(outputData.type)
}

/**
 * @description 上传成功
 */
const uploadSuccess = async () => {
	const name = fileUploadRef.value.fileData.f_name
	const path = fileUploadRef.value.fileData.f_path
	let params = {}
	if (props.type === 'country_rule') {
		params = { rule_name: props.type, file_name: name }
	} else {
		params = { rule: props.type, file: path + '/' + name }
	}
	await useDataHandle({
		loading: '正在导入中，请稍后...',
		request: inputRules(params),
		message: true,
	})
	props.refreshFn()
}
</script>

<style scoped></style>
