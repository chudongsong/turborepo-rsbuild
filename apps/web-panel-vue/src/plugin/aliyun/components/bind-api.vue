<template>
	<div class="tx_key_bind px-[2rem] py-[4rem]">
		<el-alert v-if="compData.tips || compData.alert" type="error" :description="compData.tips || compData.alert" class="!mb-1.6rem" :closable="false"></el-alert>
		<div class="tx_key_title">
			<span class="flex items-center justify-center">
				<aliyun-icon class="mr-[0.5rem]" />
				关联阿里云API密钥
			</span>
		</div>
		<el-form ref="configFormRef" :rules="rules" :label-position="labelPosition" label-width="100px" :hide-required-asterisk="hideRequiredAsterisk" :show-message="showMessage" :model="formData" class="demo-form-inline mb-2rem">
			<el-form-item label="SecretId" prop="secretId">
				<BtInput v-model="formData.secretId" width="24.8rem" placeholder="请输入SecretId"></BtInput>
			</el-form-item>
			<el-form-item label="SecretKey" prop="secretKey">
				<BtInput v-model="formData.secretKey" width="24.8rem" class="password" show-password placeholder="请输入SecretKey"></BtInput>
			</el-form-item>
			<el-form-item label=" ">
				<div class="flex items-center gap-1rem">
					<el-button type="primary" @click="submitForm">关联API密钥</el-button>
					<el-button v-if="props.compData.isEdit || compData.tips" type="define" @click="unbind()">取消关联密钥</el-button>
				</div>
			</el-form-item>
		</el-form>
		<div class="leading-2rem text-base mb-[0.5rem] px-[2rem]" style="color: red">温馨提示：请确保当前关联的密钥是本服务器的，如果不一致，将会导致数据获取异常和不正确，请须知</div>
		<div class="leading-2rem text-base px-[2rem]">您正在使用宝塔面板阿里云联合定制版，请关联您的阿里云API密钥，如何获取阿里云API密钥，<bt-link href="https://console.cloud.tencent.com/cam/capi" target="_blank" class="btlink">点击查看</bt-link></div>
	</div>
</template>

<script setup lang="ts">
import aliyunIcon from './aliyun-icon.vue'
import { setAxios, unbindAliyunApiConfig, setAliyunApiConfig } from '../api.ts'

interface Props {
	compData: AnyObject
}
const props: any = withDefaults(defineProps<Props>(), {
	compData: () => ({}),
})

// eslint-disable-next-line vue/no-setup-props-destructure, @typescript-eslint/naming-convention
const { unref, ref, reactive } = props.compData.dependencies.vueMethods
// eslint-disable-next-line vue/no-setup-props-destructure, @typescript-eslint/naming-convention
const { BtInput, ElForm, ElFormItem, ElAlert, ElButton } = unref(props.compData.dependencies.components)

// eslint-disable-next-line vue/no-setup-props-destructure
const { useAxios: instance, useMessage, useConfirm } = unref(props.compData.dependencies.hooks)

const Message = useMessage()

const configFormRef = ref<any>() // 表单ref
const formData = reactive({
	secretId: props.compData.secretId || '',
	secretKey: props.compData.secretKey || '',
})

const rules = reactive({
	secretId: [
		{
			validator: (rule: any, value: any, callback: any) => {
				if (!formData.secretId) {
					callback(new Error('请输入SecretId'))
				} else {
					callback()
				}
			},
			message: '请输入SecretId',
			trigger: 'blur',
		},
	],
	secretKey: [
		{
			validator: (rule: any, value: any, callback: any) => {
				if (!formData.secretKey) {
					callback(new Error('请输入secretKey'))
				} else {
					callback()
				}
			},
			message: '请输入SecretKey',
			trigger: 'blur',
		},
	],
})

const labelPosition = 'right'
const hideRequiredAsterisk = true
const showMessage = true

/**
 * @description 提交表单
 */
const submitForm = async () => {
	await configFormRef.value.validate()
	try {
		const loadT = Message.load('正在关联密钥，请稍后...')
		const res = await setAliyunApiConfig({
			secretId: formData.secretId,
			secretKey: formData.secretKey,
		})
		loadT.close()
		Message.request(res)
		window.location.reload()
	} catch (error) {
		console.log('error submit!!', error)
	}
}

/**
 * @description 取消关联
 */
const unbind = async () => {
	await useConfirm({
		title: '解绑阿里云API密钥',
		content: '是否取消关联阿里云API密钥,是否继续？',
	})
	const loadT = Message.load('正在取消关联密钥，请稍后...')
	const res = await unbindAliyunApiConfig()
	loadT.close()
	Message.request(res)
	window.location.reload()
}

setAxios(instance)
</script>

<style lang="css">
.tx_key_title {
	text-align: center;
	font-size: var(--el-font-size-subtitle-large);
	color: var(--el-color-text-secondary);
	margin-bottom: 1.5rem;
}
.password :deep(.el-input--small input.el-input__inner) {
	padding-right: 3rem;
}
</style>
