<template>
	<config-rows :label="'面板密码'">
		<template #value>
			<div class="w-[26rem]">
				<bt-input v-model="password" type="password" disabled></bt-input>
			</div>
			<el-button type="primary" class="!ml-12px" @click="onSet">设置</el-button>
			<bt-dialog :title="'修改面板密码'" v-model="showPopup" :show-footer="true" :area="40" @confirm="onConfirm" :confirmText="'提交'" @cancel="onCancel">
				<div class="p-[2.5rem] pb-0">
					<el-form ref="formRef" :model="form" :rules="rules">
						<el-form-item :label="'密码'" class="flex items-center" prop="password1">
							<bt-input-icon v-model="form.password1" icon="el-refresh" @icon-click="refreshPwd" width="20rem"></bt-input-icon>
						</el-form-item>
						<el-form-item :label="'重复'" prop="password2">
							<bt-input v-model="form.password2" width="20rem"></bt-input>
						</el-form-item>
					</el-form>
				</div>
			</bt-dialog>
		</template>
		<template #desc>
			<span>设置面板密码</span>
		</template>
	</config-rows>
</template>

<script lang="ts" setup>
import { setPassword } from '@/api/config'
import { useDataHandle } from '@hooks/tools'
import { refreshBrowser, rsaEncrypt } from '@utils/index'
import { getRandomPwd } from '@utils/index'

import ConfigRows from '@config/public/config-rows-new'

const password = ref('********')
const formRef = ref()
const showPopup = ref(false)

/**
 * @description: 设置密码
 */
const onSet = () => {
	form.password1 = getRandomPwd(10)
	showPopup.value = true
	nextTick(() => {
		// vm.$set(vm.$refs.formRef, 'rules', rules)
	})
}

const form = reactive({
	password1: '',
	password2: '',
})

// 校验规则
const rules = {
	password1: [
		{ required: true, message: '请输入密码', trigger: ['blur', 'input'] },
		{
			trigger: ['blur', 'input'],
			validator: (rule: unknown, value: string, callback: any) => {
				if (value.length < 6) {
					callback(new Error('密码长度必须大于5位'))
				} else {
					callback()
				}
			},
		},
	],
	password2: [
		{ required: true, message: '请再次输入密码', trigger: ['blur', 'input'] },
		{
			trigger: ['blur', 'input'],
			validator: (rule: unknown, value: string, callback: any) => {
				if (value !== form.password1) {
					callback(new Error('两次密码不一致'))
				} else {
					callback()
				}
			},
		},
	],
}

const refreshPwd = () => {
	form.password1 = getRandomPwd(10)
}

/**
 * @description 确认设置
 */
const onConfirm = async () => {
	await formRef.value?.validate()
	await useDataHandle({
		loading: '正在设置面板密码，请稍候...',
		request: setPassword({
			password1: await rsaEncrypt(form.password1),
			password2: await rsaEncrypt(form.password2),
		}),
		message: true,
		success: rdata => {
			if (rdata.status) {
				refreshBrowser('/login?dologin=True', 1500)
			}
		},
	})
}

/**
 * @description 取消设置
 */
const onCancel = () => {
	formRef.value?.resetFields()
	form.password1 = ''
	form.password2 = ''
}

onMounted(() => {
	form.password1 = getRandomPwd(10)
})
</script>
