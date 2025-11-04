<template>
	<div class="w-[460px] px-[16px] py-[24px] input_autofill">
		<BtForm size="small" />
	</div>
</template>

<script lang="tsx" setup>
import type { RequestProps } from '@/hooks/tools/message/types'
import { isString } from '@/utils'
import { useDataHandle, useForm, useMessage } from '@/hooks/tools'
import { setCommonAccount } from '@/api/global'
import { FormHelp, FormInput, FormTextarea } from '@/hooks/tools/form/form-item'
import BtLink from '@/components/base/bt-link'

import { has } from 'ramda'
import type { AlarmConfigProps, AlarmConfigParams } from '../types'

interface Props {
	compData: AlarmConfigProps
}

const props = withDefaults(defineProps<Props>(), {
	compData: () => ({
		title: '', // 告警配置名称
		type: '', // 告警类型
		row: {}, // 告警配置数据
		callback: () => {}, // 回调函数
	}),
})

const { type, row } = toRefs(props.compData)

// 配置信息
const info = {
	setup: false,
	title: '邮箱',
	href: 'https://www.bt.cn/bbs/thread-108097-1-1.html',
}

// 表单数据
const formVal = ref({
	title: '',
	qq_mail: '',
	qq_stmp_pwd: '',
	hosts: '',
	port: '465',
	receiveMail: '',
})
const inputWidth = 'w-[320px]'

// 表单配置
// const FormOptions =

// 表单生成
const { BtForm, submit } = useForm({
	data: () => formVal.value,
	options: () => {
		return computed(() => [
			FormInput('名称', 'title', {
				attrs: { placeholder: '请输入邮箱名称', class: inputWidth },
				rules: [
					{ required: true, message: '请输入名称', trigger: ['blur', 'change'] },
					{ max: 15, message: '名称不能超过15个字符', trigger: ['blur', 'change'] },
				],
			}),
			FormInput('发送人邮箱', 'qq_mail', {
				attrs: { placeholder: '请输入发送人邮箱', class: inputWidth, autocomplete: 'new-password' },
				rules: [{ required: true, message: '请输入发送人邮箱', trigger: ['blur', 'change'] }],
			}),
			FormInput('SMTP密码', 'qq_stmp_pwd', {
				attrs: { placeholder: '请输入SMTP密码', showPassword: true, class: inputWidth },
				rules: [{ required: true, message: '请输入SMTP密码', trigger: ['blur', 'change'] }],
			}),
			FormInput('SMTP服务器', 'hosts', {
				attrs: { placeholder: '请输入SMTP服务器', class: inputWidth },
				rules: [{ required: true, message: '请输入SMTP服务器', trigger: ['blur', 'change'] }],
			}),
			FormInput('端口', 'port', {
				attrs: { placeholder: '请输入端口', class: inputWidth },
				rules: [{ required: true, message: '请输入端口', trigger: ['blur', 'change'] }],
			}),
			FormTextarea('邮箱', 'receiveMail', {
				attrs: { placeholder: '接收者邮箱，每行1个', rows: 6, class: inputWidth },
				rules: [{ required: true, message: '请输入接收者邮箱', trigger: ['blur', 'change'] }],
			}),
			FormHelp(' ', [
				{ content: '推荐使用465端口，协议为SSL/TLS' },
				{ content: '25端口为SMTP协议，587端口为STARTTLS协议' },
				{
					content: (
						<BtLink href={info.href} target="_blank">
							配置教程
						</BtLink>
					),
				},
			]),
		])
	},
	submit: async (formData: typeof formVal, validate: any) => {
		await validate()
		return saveAlarmMailModel(formData)
	},
})

/**
 * @description 处理参数
 */
const handleParams = () => {
	const send: any = {
		qq_mail: formVal.value.qq_mail,
		qq_stmp_pwd: formVal.value.qq_stmp_pwd,
		hosts: formVal.value.hosts,
		port: formVal.value.port,
	}
	const receive = formVal.value.receiveMail.split('\n').filter(item => item !== '' && item !== ' ')
	const obj: AlarmConfigParams = {
		sender_type: type.value,
		sender_data: JSON.stringify({
			send,
			receive,
			title: formVal.value.title,
		}),
	}
	if (has('id', row.value)) obj.sender_id = row.value.id
	return obj
}

/**
 * @description 保存告警邮件
 * @param {typeof formVal} formData 表单数据
 */
const saveAlarmMailModel = async (formData: typeof formVal) => {
	try {
		// 处理参数
		const params = handleParams()
		// 设置邮箱
		const rdata: RequestProps = await useDataHandle({
			loading: '正在设置,请稍候...',
			request: setCommonAccount(params),
			success: (rdata: RequestProps) => {
				rdata.status && props.compData.callback(true)
				if (isString(rdata.data.data) && !rdata.status) {
					useMessage().error(`${rdata.msg  }【${  rdata.data.data  }】`)
				} else {
					useMessage().request(rdata)
				}
			},
		})
		return rdata.status
	} catch (err) {
		console.error(err)
	}
}

/**
 * @description 初始化数据
 */
const init = () => {
	if (!row.value || !('id' in row.value)) return
	const { send, receive = [], title = '' } = row.value.data || {}
	const { hosts, port, qq_mail, qq_stmp_pwd } = send || {}
	formVal.value.hosts = hosts
	formVal.value.port = port
	formVal.value.qq_mail = qq_mail
	formVal.value.qq_stmp_pwd = qq_stmp_pwd
	formVal.value.receiveMail = Array.isArray(receive) ? receive.join('\n') : ''
	formVal.value.title = title
}

onMounted(init)

defineExpose({
	onConfirm: async (close: () => void) => (await submit()) && close(),
})
</script>

<style lang="scss" scoped>
.input_autofill :deep(.el-input__wrapper:has(.el-input__inner:-webkit-autofill)){
	box-shadow: none!important;
}
.input_autofill :deep(.el-input__inner:-webkit-autofill ~ .el-input__suffix){
	position: absolute;
	right: 0;
	top: 0;
}
.input_autofill :deep(.el-input__inner:-webkit-autofill){
	border: 1px solid var(--el-border-color);
	border-radius: var(--el-border-radius-base);
	-webkit-border-radius: var(--el-border-radius-base);
	padding-right: 40px;
	-webkit-text-fill-color: var(--el-text-color-regular);
}
.input_autofill :deep(.el-input__inner:-webkit-autofill:hover){
	border-color: var(--el-border-color-darker);
	transition: border-color 0.25s;
}
.input_autofill :deep(.el-input__wrapper.is-focus .el-input__inner:-webkit-autofill:focus),
.input_autofill :deep(.el-input__inner:-webkit-autofill:focus) {
	border-color: var(--el-color-primary);
	transition: border-color 0.25s;
}
.input_autofill :deep(.el-input--suffix .el-input__icon){
	margin-right: 12px;
}
</style>