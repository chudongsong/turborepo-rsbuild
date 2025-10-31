<!--  -->
<template>
	<div class="">
		<el-alert class="!mb-[1.2rem] !text-small" show-icon title="整机迁移会自动安装宝塔面板，建议使用【全新机器】进行迁移，如有数据将会覆盖，支持不同系统之间进行迁移！" :closable="false" type="warning" />
		<BtForm />
		<div class="p-2rem">
			<div class="w-[56rem]">
				<!-- 备份中 -->
				<div class="flex-col flex" v-if="progressData.status === 1">
					<span class="text-secondary font-bold text-base mb-[2rem]">迁移进度</span>
					<!-- + ',大约剩余' + progressData.remain_time + '分钟' -->
					<span class="text-base">{{ progressData.msg }}</span>
					<div class="mb-1.2rem mt-[0.4rem] flex items-center">
						<el-progress class="w-full" :text-inside="true" :stroke-width="20" :percentage="progressData.progress" status="success" />
						<i class="svgtofont-el-circle-close text-dangerDark !text-large pl-4px cursor-pointer" @click="cancelMigrate"></i>
					</div>
				</div>
				<bt-log
					v-if="progressData.status === 1"
					class="h-22rem !rounded-none w-[56rem] mt-[2rem]"
					:content="progressData.progressLog"
					:fullScreen="{
						title: '全屏查看日志',
						onRefresh: () => {},
					}">
				</bt-log>
			</div>
		</div>
	</div>
</template>

<script setup lang="tsx">
import { useForm } from '@/hooks/tools'
import { FormButton, FormGroup, FormHelp, FormInput, FormTextarea, FormRadioButton } from '@/hooks/tools/form/form-item'
import { ipVerify, portVerify } from '@/utils'
import { startMigrate, progressData, openMigrateData, isRunMigrate, getMigrateStatus, cancelMigrate, openMigrateHistory } from './useController'
import { autoFillHostInfoEvent } from '@/views/term/views/host-list/useController'

// 验证方式
const auth_type = [
	{ label: '密码认证', value: 'password' },
	{ label: '私钥验证', value: 'key' },
]

const handleValidate = (formData: any, rule: any, value: any, callback: any) => {
	if (value) {
		callback()
	} else {
		callback(new Error(formData.value.auth_type === 'password' ? '请输入SSH密码' : '请输入SSH私钥'))
	}
}

const {
	BtForm,
	submit,
	ref: formRef,
} = useForm({
	data: () => {
		return {
			// server_ip: '101.37.236.68',
			// ssh_port: 22,
			// ssh_user: 'root',
			// password: 'BBaota123456',
			auth_type: 'password',
			server_ip: '',
			ssh_port: '22',
			ssh_user: '',
			password: '',
		}
	},
	options: (formData: any) => {
		return computed(() => {
			const password = [
				FormInput('密码', 'password', {
					attrs: { placeholder: '请输入SSH密码', class: 'mr-4 !w-[275px]' },
					rules: [{ required: true, validator: (rule, value, callback) => handleValidate(formData, rule, value, callback), trigger: ['change', 'blur'] }],
				}),
			]
			const privateKey = [
				FormTextarea('私钥', 'password', {
					attrs: {
						placeholder: '请输入SSH私钥',
						class: 'mr-4 !w-[275px]',
						autosize: { minRows: 4, maxRows: 4 },
					},
					rules: [{ required: true, validator: (rule, value, callback) => handleValidate(formData, rule, value, callback), trigger: ['change', 'blur'] }],
				}),
			]

			// const group = [FormButton('查看迁移历史', { attrs: { style: { marginLeft: isRunMigrate.value ? '38rem' : '30rem' }, onclick: openMigrateHistory } }), FormButton('开始迁移', { attrs: { class: `ml-[1.2rem] ${isRunMigrate.value ? '!hidden' : ''}`, type: 'primary', onClick: submit } })]

			return [
				FormGroup([
					FormInput('服务器IP', 'server_ip', {
						attrs: {
							class: 'mr-[8px] !w-[180px]',
							placeholder: '请输入服务器IP',
							onInput: () => {
								formData.value.ps = formData.value.server_ip
							},
							onBlur: () => autoFillHostInfoEvent(formData),
						},
						rules: [{ required: true, message: '请输入服务器IP', trigger: ['change', 'blur'] }, ipVerify()],
					}),
					FormInput('端口', 'ssh_port', {
						attrs: { placeholder: '请输入端口', class: '!w-[84px]' },
						rules: [{ required: true, message: '请输入端口', trigger: ['change', 'blur'] }, portVerify()],
					}),
				]),
				FormInput('账号', 'ssh_user', {
					attrs: { placeholder: '请输入SSH账号', class: 'mr-4 !w-[275px]' },
					rules: [{ required: true, message: '请输入SSH账号', trigger: ['change', 'blur'] }],
				}),
				FormRadioButton('验证方式', 'auth_type', auth_type, {
					attrs: {
						class: 'mr-4 !w-[275px]',
						onChange: () => {
							formData.value.password = ''
							formRef.value?.clearValidate()
						},
					},
				}),

				...(formData?.value.auth_type === 'password' ? password : privateKey),
				FormHelp(
					'',
					[
						{ content: '请在上方输入目标服务器的root账号信息进行迁移' },
						{
							content: (
								<span class="bt-link" onClick={openMigrateData}>
									点击设置迁移数据
								</span>
							),
						},
					],
					{
						attrs: { class: 'ml-[6rem]' },
					}
				),
				FormGroup([FormButton('迁移记录', { attrs: { class: `ml-[4rem]`, onClick: openMigrateHistory } }), FormButton('开始迁移', { attrs: { class: `ml-[40rem]`, type: 'primary', onClick: submit } })]),
				// isRunMigrate.value ? FormGroup(group.slice(0, 1)) : FormGroup(group),
			]
		})
	},
	submit: async (formData: any, validate: any) => {
		await validate()
		startMigrate(formData.value)
	},
})

onMounted(() => {
	getMigrateStatus()
})
</script>

<style lang="css" scoped>
:deep(.el-descriptions__body .el-descriptions__label) {
	min-width: 90px !important;
	width: 160px;
}
</style>
