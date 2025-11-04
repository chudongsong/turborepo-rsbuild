<template>
	<config-rows :label="'面板账号'">
		<template #value>
			<bt-input v-model="panelConfig.username" disabled class="!w-[26rem]"></bt-input>
			<el-button type="primary" class="!ml-12px" @click="onSet">设置</el-button>
			<bt-dialog :title="'修改面板用户名'" v-model="showPopup" :show-footer="true" :area="40" @confirm="onConfirm" :confirmText="'提交'" @cancel="onCancel">
				<div class="p-[2.5rem]">
					<el-form ref="formRef" :model="form" :rules="rules">
						<el-form-item :label="'用户名'" prop="username1">
							<bt-input v-model="form.username1" width="21rem"></bt-input>
						</el-form-item>
						<el-form-item :label="'重复'" prop="username2">
							<bt-input v-model="form.username2" width="21rem"></bt-input>
						</el-form-item>
					</el-form>
				</div>
			</bt-dialog>
		</template>
		<template #desc>
			<span>设置面板账号</span>
		</template>
	</config-rows>
</template>

<script lang="ts" setup>
import { getConfigStore } from '@config/useStore'
import { refreshBrowser, rsaEncrypt } from '@utils/index'
import { useDataHandle } from '@hooks/tools'
import { setUsername } from '@/api/config'

import ConfigRows from '@config/public/config-rows-new'

const {
	refs: { panelConfig, openNamePopup },
} = getConfigStore()

const showPopup = ref(false)
const formRef = ref()
const form = reactive({
	username1: '',
	username2: '',
})

// 校验规则
const rules = {
	username1: [{ required: true, message: '请输入用户名', trigger: ['blur', 'input'] }],
	username2: [
		{ required: true, message: '请再次输入用户名', trigger: ['blur', 'input'] },
		{
			trigger: ['blur', 'input'],
			validator: (rule: unknown, value: string, callback: any) => {
				if (value !== form.username1) {
					callback(new Error('两次用户名不一致'))
				} else {
					callback()
				}
			},
		},
	],
}

/**
 * @description 设置
 */
const onSet = () => {
	form.username1 = panelConfig.value.username
	showPopup.value = true
}

/**
 * 确认设置
 */
const onConfirm = async () => {
	await formRef.value.validate()
	await useDataHandle({
		loading: '正在设置面板账号，请稍候...',
		request: setUsername({
			username1: await rsaEncrypt(form.username1),
			username2: await rsaEncrypt(form.username2),
		}),
		message: true,
	})
	refreshBrowser('/login?dologin=True', 1500)
}

const onCancel = () => {
	formRef.value?.resetFields()
	form.username1 = panelConfig.value.username
	form.username2 = ''
}

onMounted(() => {})
</script>
