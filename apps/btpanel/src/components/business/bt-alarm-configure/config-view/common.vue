<template>
	<div class="w-[470px] px-16px py-24px">
		<BtForm size="small" @submit.prevent />
	</div>
</template>

<script lang="tsx" setup>
import { useDataHandle, useForm, useMessage } from '@/hooks/tools'
import { FormHelp, FormInput, FormSelect, FormTextarea, FormRadioButton, FormGroup, FormCustom, FormItemCustom } from '@/hooks/tools/form/form-item'
import { FormItemProps } from '@/hooks/tools/form/types'
import { isString, getRandomChart } from '@/utils'

import BtLink from '@/components/base/bt-link'
import { ElInput, ElButton } from 'element-plus'
import { setCommonAccount } from '@/api/global'
import { RequestProps } from '@/hooks/tools/message/types'
import type { AlarmConfigParams, AlarmConfigProps } from '../types'

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

// props组件参数
const { title, type, row } = toRefs(props.compData)
// 表单数据
const formVal = ref<{ title: string, url: string, send_type: string, remindType?: string, specifiedUser?: Array<{ id?: string, name: string, key: string }> }>({ title: '', url: '', send_type: 'markdown', remindType: 'all', specifiedUser: [{id: '', name: '', key: getRandomChart(10)}] })
// 帮助信息
const modelHelp = computed(() => {
	const helpList = [
		{
			name: 'dingding',
			ps: '如何创建钉钉机器人',
			help: 'https://www.bt.cn/bbs/thread-108081-1-1.html',
		},
		{
			name: 'feishu',
			ps: '如何创建飞书机器人',
			help: 'https://www.bt.cn/bbs/thread-108274-1-1.html',
		},
		{
			name: 'weixin',
			ps: '如何创建企业微信机器人',
			help: 'https://www.bt.cn/bbs/thread-108116-1-1.html',
		},
	]
	return helpList.find(item => item.name === type.value)
})

const remindArr = ['weixin', 'dingding', 'feishu']// 需要提醒的类型

// 表单配置
const formOptions = computed(() => [
		FormInput('名称', 'title', {
			attrs: { placeholder: '机器人名称或备注', class: 'w-[320px]' },
			rules: [{ required: true, message: '请输入机器人名称或备注', trigger: ['change', 'blur'] }],
		}),
		FormTextarea('URL', 'url', {
			attrs: { placeholder: `请输入${title.value}机器人URL`, autosize: { minRows: 5, maxRows: 5 }, resize: 'none', class: 'w-[320px]' },
			rules: [{ required: true, message: `请输入${title.value}机器人URL`, trigger: ['change', 'blur'] }],
		}),

	...(remindArr.includes(type.value) ? [
			FormRadioButton('提醒', 'remindType', [
				{ label: '所有用户(@所有人)', value: 'all' },
				{ label: '指定用户', value: 'specified' },
				{ label: '不提醒', value: 'none' },
			],{attrs: { size: 'default' }}),
			...(param.value.remindType === 'specified' ? [
				...getSpecifiedUser(),
				FormItemCustom(' ',() => {
					return (<ElButton type="default" size="default" class="!mt-[1rem]" onClick={addSpecifiedUser}>添加指定用户 </ElButton>)
				})
			]:[]),
		]:[]),
	

	...(type.value === 'weixin' ? [FormSelect('发送类型', 'send_type', [
				{ label: '文本', value: 'text' },
				{ label: 'markdown', value: 'markdown' },
			],
				{
					attrs: { placeholder: '请选择发送类型', class: '!w-[320px]' },
					rules: [{ required: true, message: '请选择发送类型', trigger: ['change', 'blur'] }],
				}) as unknown as FormItemProps]:[]),


		FormHelp(' ', [{ content: <BtLink href={modelHelp.value?.help}>{modelHelp.value?.ps}</BtLink> }]) as unknown as FormItemProps
])
/**
 * @description 获取指定用户
 */
const getSpecifiedUser = () => {
	return param.value.specifiedUser.map((item: { id?: string, name: string }) => {
					switch(type.value) {
						case 'weixin':
							return FormGroup([FormItemCustom(' ', () => {
								return <ElInput v-model={item.name} placeholder="微信用户名" class="!w-[28rem] mt-[1.6rem]"></ElInput>
							}),
								FormCustom(() => {
									return <span class="text-[1.4rem] text-danger cursor-pointer ml-[1rem] mt-[1.6rem] flex items-center" onClick={() =>  deleteSpecifiedUse(item)}>删除</span>
								})])
						case 'dingding':
							return FormGroup([FormItemCustom(' ', () => {
								return <ElInput v-model={item.name} placeholder="钉钉手机号" class="!w-[28rem] mt-[1.6rem]"></ElInput>
							}),
								FormCustom(() => {
									return <span class="text-[1.4rem] text-danger cursor-pointer ml-[1rem] mt-[1.6rem] flex items-center" onClick={() =>  deleteSpecifiedUse(item)}>删除</span>
								})])
						case 'feishu':
							return FormGroup([
							FormItemCustom(' ', () => {
									return <ElInput v-model={item.id} placeholder="用户id" class="!w-[14rem] mt-[1.6rem]"></ElInput>
								}),
								FormCustom(() => {
									return <ElInput v-model={item.name} placeholder="用户名" class="!w-[14rem] ml-[1rem] mt-[1.6rem]"></ElInput>
								}),
								FormCustom(() => {
									return <span class="text-[1.4rem] text-danger cursor-pointer ml-[1rem] mt-[1.6rem] flex items-center" onClick={() =>  deleteSpecifiedUse(item)}>删除</span>
								})
							])
					}
					return null
				})
}
/**
 * @description 添加指定用户
 */
const addSpecifiedUser = () => {
	switch(type.value) {
		case 'feishu':
			param.value.specifiedUser.push({id: '', name: '', key: getRandomChart(10) })
			break
		default:
			param.value.specifiedUser.push({name: '', key: getRandomChart(10) })
			break
	}
}
/**
 * @description 删除指定用户
 */
const deleteSpecifiedUse = (item: { id?: string, name: string, key: string }) => {
	param.value.specifiedUser = param.value.specifiedUser.filter((items: { id?: string, name: string, key: string }) => items.key !== item.key)
}
// const formOptions = computed(() => {
// 	const baseOptions: FormItemProps[] = [
// 		FormInput('名称', 'title', {
// 			attrs: { placeholder: '机器人名称或备注', class: 'w-[320px]' },
// 			rules: [{ required: true, message: '请输入机器人名称或备注', trigger: ['change', 'blur'] }],
// 		}),
// 		FormTextarea('URL', 'url', {
// 			attrs: { placeholder: `请输入${title.value}机器人URL`, autosize: { minRows: 5, maxRows: 5 }, resize: 'none', class: 'w-[320px]' },
// 			rules: [{ required: true, message: `请输入${title.value}机器人URL`, trigger: ['change', 'blur'] }],
// 		}),
// 	]

// 	if(remindArr.includes(type.value)) {
// 		baseOptions.push(
// 			FormRadioButton('提醒', 'remindType', [
// 				{ label: '所有用户(@所有人)', value: 'all' },
// 				{ label: '指定用户', value: 'specified' },
// 				{ label: '不提醒', value: 'none' },
// 			],{attrs: { size: 'default' }})
// 		)
// 		if(param.value.remindType === 'specified') {
// 			param.value.specifiedUser.forEach((item: { id?: string, name: string }) => {
// 				switch(type.value) {
// 					case 'weixin':
// 						baseOptions.push(
// 								FormCustom(() => {
// 									return <ElInput v-model={item.name} placeholder="微信用户名" class="w-[20rem]"></ElInput>
// 								})
// 						)
// 						break
// 					case 'dingding':
// 						baseOptions.push(
// 								FormCustom(() => {
// 									return <ElInput v-model={item.name} placeholder="钉钉手机号" class="w-[20rem]"></ElInput>
// 								})
// 						)
// 						break
// 					case 'feishu':
// 						baseOptions.push(
// 							FormGroup([
// 								FormCustom(() => {
// 									return <ElInput v-model={item.id} placeholder="用户id" class="w-[10rem]"></ElInput>
// 								}),
// 								FormCustom(() => {
// 									return <ElInput v-model={item.name} placeholder="用户名" class="w-[10rem]"></ElInput>
// 								})
// 							])
// 						)
// 						break
// 				}
// 			})
// 		}
// 	}

// 	if (type.value === 'weixin') {
// 		baseOptions.push(
// 			FormSelect('发送类型', 'send_type', [
// 				{ label: '文本', value: 'text' },
// 				{ label: 'markdown', value: 'markdown' },
// 			],
// 				{
// 					attrs: { placeholder: '请选择发送类型', class: '!w-[320px]' },
// 					rules: [{ required: true, message: '请选择发送类型', trigger: ['change', 'blur'] }],
// 				}) as unknown as FormItemProps
// 		)
// 	}

// 	baseOptions.push(
// 		FormHelp(' ', [{ content: <BtLink href={modelHelp.value?.help}>{modelHelp.value?.ps}</BtLink> }]) as unknown as FormItemProps
// 	)

// 	return baseOptions
// })

// 表单生成
const { BtForm, submit, param } = useForm({
	data: () => formVal.value,
	options: formOptions as ComputedRef<FormItemProps[]>,
	submit: async (formData: typeof formVal, validate: any) => {
		try {
			await validate()
			return saveAlarmModel(formData)
		} catch (error) {
			console.warn('表单验证', error)
		}
	},
})

/**
 * @description 保存告警模块
 * @param {Ref<AnyObject>} form 表单数据
 */
const saveAlarmModel = async (form: Ref<AnyObject>) => {
	try {
		// 如果type不是weixin，则删除type
		if (type.value !== 'weixin') {
			delete form.value.send_type
		}
		const formData = toRaw(form.value)
		// 企业微信,钉钉,飞书需要处理指定用户
		if(remindArr.includes(type.value)) {
			formData.isAtAll = formData.remindType === 'all'
			if(formData.remindType === 'specified') {
				switch(type.value) {
					case 'feishu':
						formData.user = formData.specifiedUser.filter((item: { id: string, name: string, key: string }) => item.id !== '' && item.name !== '' ).map((item: { id: string, name: string, key: string }) => `${item.id}|${item.name}`)
						break
					default:
						formData.user = formData.specifiedUser.filter((item: { name: string, key: string }) => item.name !== '' ).map((item: { name: string, key: string }) => item.name)
						break
				}
			} else {
				formData.user = []
			}
			delete formData.remindType
			delete formData.specifiedUser
		}
		const params: AlarmConfigParams = {
			sender_type: type.value,
			sender_data: JSON.stringify({ ...formData }),
		}
		if (row.value && 'id' in row.value) params.sender_id = row.value.id
		const rdata: RequestProps = await useDataHandle({
			loading: '正在设置,请稍候...',
			request: setCommonAccount(params),
			// message: true,
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
 * @description 初始化
 */
const init = () => {
	if (!row.value || !('id' in row.value)) return
	const {
		data: { title, url, send_type, isAtAll, user  },
	} = row.value
	formVal.value.title = title
	formVal.value.url = url
	formVal.value.send_type = send_type
	formVal.value.remindType = isAtAll !== false ? 'all' :  (user && user.length > 0 ? 'specified' : 'none')
	formVal.value.specifiedUser = user?.map((item: string) => ({ name: item, key: getRandomChart(10) })) || [{name: '', key: getRandomChart(10)}]
	if(type.value === 'feishu') {
		formVal.value.specifiedUser = user?.map((item: string) => ({ id: item.split('|')[0], name: item.split('|')[1], key: getRandomChart(10) })) || [{id: '', name: '', key: getRandomChart(10)}]
	}
}

onMounted(init)

defineExpose({
	onConfirm: async (close: () => void) => (await submit()) && close(),
})
</script>
