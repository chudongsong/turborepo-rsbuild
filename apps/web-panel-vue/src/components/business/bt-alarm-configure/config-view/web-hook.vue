<template>
	<div class="w-[90%] px-16px py-24px">
		<BtForm />
	</div>
</template>

<script lang="tsx" setup>
import type { AlarmConfigProps, AlarmConfigParams } from '../types'
import type { RequestProps } from '@/hooks/tools/message/types'
import type { FormItemProps } from '@/hooks/tools/form/types'

import { deepClone, isString } from '@/utils'
import { useDataHandle, useForm, useMessage } from '@/hooks/tools'
import { setCommonAccount } from '@/api/global'
import { FormGroup, FormHelp, FormInput, FormSelect, FormTextarea } from '@/hooks/tools/form/form-item'

import BtLink from '@/components/base/bt-link'

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
	title: '自定义webhook',
	href: 'https://www.bt.cn/bbs/thread-143326-1-1.html',
}

// 表单数据
const formVal = ref({
	title: '',
	url: '',
	atall: 'True',
	method: 'POST',
	body_type: 'json',
	custom_parameter: '',
	headers: '',
})

const methodOptions = [
	{ label: 'POST', value: 'POST' },
	{ label: 'PUT', value: 'PUT' },
	{ label: 'PATCH', value: 'PATCH' },
]

const bodyTypeOptions = [
	{ label: 'application/json', value: 'json' },
	{ label: 'x-www-form-urlencoded', value: 'form_data' },
]

const width = { class: '!w-[140px]' }

// 表单数据-textarea属性
const attrs = (rows: number) => ({ placeholder: '非必填，可输入标准JSON格式的字符串，例如：{aa:bb}', autosize: { minRows: rows, maxRows: rows }, resize: 'none' })

// 表单配置
const formOptions = computed(() => [
	FormInput('名称', 'title', {
		attrs: { placeholder: '机器人名称或备注', class: 'w-[320px]' },
		rules: [{ required: true, message: '请输入机器人名称或备注', trigger: ['blur', 'change'] }],
	}),
	FormTextarea('URL', 'url', {
		attrs: { placeholder: `请输入${info.title}机器人URL`, autosize: { minRows: 5, maxRows: 5 }, resize: 'none', class: 'w-[320px]' },
		rules: [{ required: true, message: `请输入${info.title}机器人URL`, trigger: ['blur', 'change'] }],
	}),

	FormGroup([FormSelect('请求方式', 'method', methodOptions, { attrs: width }), FormSelect('参数格式', 'body_type', bodyTypeOptions, { attrs: width, labelAttrs: { labelWidth: 'w-[120px]' } })]),
	FormSelect('证书校验', 'ssl_verify', [{ label: '开启', value: 1 }, { label: '关闭', value: 0 }], { attrs: width, labelAttrs: { labelWidth: 'w-[120px]' } }),
	FormTextarea('自定义参数', 'custom_parameter', { attrs: { ...attrs(4), class: 'w-[320px]' } }),
	FormTextarea('请求头', 'headers', { attrs: { ...attrs(2), class: 'w-[320px]' } }),
	FormHelp(' ', [{ content: <BtLink href={info.href}>{`如何使配置并使用自定义消息通道`}</BtLink> }]),
])

// 表单生成
const { BtForm, submit } = useForm({
	data: () => formVal.value,
	options: formOptions as ComputedRef<FormItemProps[]>,
	submit: async (formData: typeof formVal, validate: any) => {
		await validate()
		return savaAlarmHookModel(formData)
	},
})

/**
 * @description 处理参数
 */
const handleParams = () => {
	// 深拷贝
	const copiedObject: any = deepClone(formVal.value)
	// 将字符串类型的自定义参数、query、headers转换为对象格式
	const arr = ['custom_parameter', 'query', 'headers']
	arr.forEach(item => {
		try {
			copiedObject[item] = copiedObject[item] === '' || copiedObject[item] === undefined ? {} : JSON.parse(copiedObject[item])
		} catch (error) {
			console.log(error)
			copiedObject[item] = {}
		}
	})
	// 添加空值检查
	const modelData = row.value?.data || {}
	const params: AlarmConfigParams = {
		sender_type: type.value,
		sender_data: JSON.stringify({
			...modelData,
			...copiedObject,
			ssl_verify: copiedObject.ssl_verify === 1,
		}),
	}
	// 编辑时赋值id
	if (row.value?.id) {
		params.sender_id = row.value.id
	}
	return params
}

/**
 * @description 保存告警模块
 */
const savaAlarmHookModel = async () => {
	try {
		const params = handleParams()
		console.log(params)
		const rdata: RequestProps = await useDataHandle({
			loading: '正在设置,请稍候...',
			request: setCommonAccount(params),
			success: (rdata: RequestProps) => {
				rdata.status && props.compData.callback(true)
				if (isString(rdata.data.data) && !rdata.status) {
					useMessage().error(rdata.msg + '【' + rdata.data.data + '】')
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
 * @description 初始化
 */
const init = () => {
	if (!row.value || !('id' in row.value)) return
	const { title, url, method, body_type, custom_parameter, headers, ssl_verify } = row.value.data
	formVal.value.title = title
	formVal.value.url = url
	formVal.value.method = method
	formVal.value.body_type = body_type
	formVal.value.custom_parameter = custom_parameter ? JSON.stringify(custom_parameter) : ''
	formVal.value.headers = headers ? JSON.stringify(headers) : ''
	formVal.value.atall = 'True'
	formVal.value.ssl_verify = ssl_verify === false ? 0 : 1
}

onMounted(init)

defineExpose({
	onConfirm: async (close: () => void) => (await submit()) && close(),
})
</script>
