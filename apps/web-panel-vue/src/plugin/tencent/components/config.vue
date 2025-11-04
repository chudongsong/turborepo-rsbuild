<template>
	<div class="tx_key_bind px-[2rem] py-[4rem]">
		<el-alert v-if="compData.tips || compData.alert" type="error" :description="compData.tips || compData.alert" class="!mb-1.6rem" :closable="false"></el-alert>
		<div class="tx_key_title">
			<span class="flex items-center justify-center"
				><img
					class="w-[3.5rem] h-[2.5rem] mr-4x"
					src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACEAAAAZCAYAAAC/zUevAAADk0lEQVRIS62WXWxTZRjHf88pqxIjIjXxA4k4nCLGTEagg0SF6IWYYEBCL8hgDjPR8O1HxCu3GyBe6NhClJigWPBmQYyIMXwkM4R1JUHDyJiDTpBGjVlWErMLieM85j3nrJx2bU/38d40fd//8+/vPM9znrfCWNcWnY+wBJgP1Hif3cBFIIXFflrkr7HYStni7Todm3dR3kG4s0Tcn8DnY4EpD2KzrsRiF/Bk2dDQh8XrtMjZoJhgiO36DDangRk+s6MIpxjmF/ZJgh1aic08lDeAFT7dDZR62uRYKZDSEG4JfgSijolwHGUXrdJZ1HSbrkbZD0Q8TQaLBbTItWIxpSG2aiuwxQv+HXiOVrkelF7c5v0eeMiD/5K90jBeiDTwsBOsrKZNvgkEGBFs1Z3AbuAm0I1FrFg2imdisy7H4gcPoIM2WVY2wIhwk9YQ5hqfSGZ8PbHD/o57/htkKPQAFfbX7A7HxwxhAg7rvdhUE6KXtfJ3IY/cTHRdmQYcAFkEzMoN0CNIaC/RyjOBMHF9EJuNWLwKPJ3VK2mEcwgbqJN/RvZvQyR6ZyMVXwHPlvwR1WYWVzUV1RzUJkI0ol5TFhaeYZj1NLhvjAuR7I2gU06DVOfFdACPZ7t85LAYiAGw+DAwU67gAjYvUC+DHkTqU5Q3fcEbCetRaqoGnL1EqhFxJuZ9WY1IE9E5zdnv+QBKPxYfc4tT2FyngkrgFdR5Y9wlfEadvCUkU+tRDmYPah8r/MYkf6tG7RZgqae9jNyKEX3iAvkAQjthNhET9yHyV1zVt1UvdKW+AF7z0D6gds6eounsTE9F/m0FWQf6EourOgoC1EmsZEniasa7maomG3EhkTLdutDZCFlzWVjZF1jTc1efZ9GjP40LwJgfUnPP9Di/o3QLyf4hVO9yNoqVohBVoRIEZcDv4yuJKcdVYLZLpcucFAetiQL4MyH0GIjjwMseROkZYEQTBTAecTWX2QGvJ9oNxEfAe7cfvuIpah+5VDAZkwHgQgwBbgvYNAud6RlYN89nS+KUxW5Ap55kyaw/sjATBTik07B5EcH8PZjp+X7LOlnlzoTE5ShidY1+eukGzZCJDDA4fY3vPLhvcs3uBhaM8r+DCDHJ+O6O/vcRHT0jMpH2PICgti3nvI9hVtIgvxpx7nRMXlmDytvmZXWcJh/gBDYJ6iXnAiw8ont6wqTvb2Qg4g6UyVjCz/7r22/5P8qBPGWz9M1HAAAAAElFTkSuQmCC" />关联腾讯云API密钥</span
			><span></span>
		</div>
		<el-form ref="configFormRef" :rules="rules" :label-position="labelPosition" label-width="100px" :hide-required-asterisk="hideRequiredAsterisk" :show-message="showMessage" :model="formData" class="demo-form-inline mb-2rem">
			<el-form-item label="APPID" prop="appid">
				<BtInput v-model="formData.appid" width="24.8rem" placeholder="请输入APPID"></BtInput>
			</el-form-item>
			<el-form-item label="SecretId" prop="secretId">
				<BtInput v-model="formData.secretId" width="24.8rem" placeholder="请输入SecretId"></BtInput>
			</el-form-item>
			<el-form-item label="SecretKey" prop="secretKey">
				<BtInput v-model="formData.secretKey" width="24.8rem" class="password" placeholder="请输入SecretKey"></BtInput>
			</el-form-item>
			<el-form-item label=" ">
				<div class="flex items-center gap-1rem">
					<el-button type="primary" @click="submitForm">关联API密钥</el-button>
					<el-button v-if="props.compData.isEdit || compData.tips" type="define" @click="unbind()">取消关联密钥</el-button>
				</div>
			</el-form-item>
		</el-form>
		<div class="leading-2rem text-base mb-[0.5rem] px-[2rem]" style="color: red">温馨提示：请确保当前关联的密钥是本服务器的，如果不一致，将会导致数据获取异常和不正确，请须知</div>
		<div class="leading-2rem text-base px-[2rem]">您正在使用宝塔面板腾讯云联合定制版，请关联您的腾讯云API密钥，如何获取腾讯云API密钥，<bt-link href="https://console.cloud.tencent.com/cam/capi" target="_blank" class="btlink">点击查看</bt-link></div>
	</div>
</template>

<script setup lang="ts">
import { setInstance, cancelConfig, tencentSetConfig } from '../api'

interface Props {
	compData: AnyObject
}
const props: any = withDefaults(defineProps<Props>(), {
	compData: () => ({}),
})

// eslint-disable-next-line @typescript-eslint/naming-convention
const { BtInput, BtInputIcon, ElFormItem, ElForm, ElAlert, ElButton } = unref(props.compData.dependencies.components)

// eslint-disable-next-line vue/no-setup-props-destructure
const { useAxios: instance, useMessage, useConfirm } = unref(props.compData.dependencies.hooks)

const { getRandomPwd } = unref(props.compData.dependencies.utils)

const Message = useMessage()

const configFormRef = ref<any>() // 表单ref
const formData = reactive({
	appid: props.compData.appId || '',
	secretId: props.compData.secretId || '',
	secretKey: props.compData.secretKey || '',
})

const rules = reactive({
	appid: [{ required: true, message: '请输入APPID', trigger: 'blur' }],
	secretId: [{ required: true, message: '请输入SecretId', trigger: 'blur' }],
	secretKey: [{ required: true, message: '请输入SecretKey', trigger: 'blur' }],
})

const labelPosition = 'right'
const hideRequiredAsterisk = true
const showMessage = true

const refreshPwd = () => {
	formData.secretKey = getRandomPwd(10)
}

/**
 * @description 提交表单
 */
const submitForm = async () => {
	await configFormRef.value.validate()
	try {
		const loadT = Message.load('正在关联密钥，请稍后...')
		const res = await tencentSetConfig({
			appid: formData.appid,
			secretId: formData.secretId,
			secretKey: formData.secretKey,
		})
		loadT.close()
		Message.request(res)
		if (res.status) window.location.reload()
	} catch (error) {
		console.log('error submit!!', error)
	}
}

/**
 * @description 取消关联
 */
const unbind = async () => {
	try {
		await useConfirm({
			title: '解绑腾讯云API密钥',
			content: '是否取消关联腾讯云API密钥,是否继续？',
		})
		const loadT = Message.load('正在取消关联密钥，请稍后...')
		const res = await cancelConfig()
		loadT.close()
		Message.request(res)
		if (res.status) window.location.reload()
	} catch (error) {
		console.log('error submit!!', error)
	}
}

onMounted(() => {
	setInstance(instance)
})
</script>

<style lang="css">
.tx_key_title {
	text-align: center;
	font-size: var(--el-font-size-subtitle-large);
	color: var(--el-color-text-secondary);
	margin-bottom: 15px;
}
.password :deep(.el-input--small input.el-input__inner) {
	padding-right: 3rem;
}
</style>
