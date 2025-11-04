<template>
	<BtForm class="p-[1.6rem]" />
</template>
<script setup lang="tsx">
import { useForm, Message } from '@/hooks/tools'
import { FormGroup, FormInputPath, FormInput, FormItemCustom, FormRadioButton, FormButton } from '@form/form-item'
import { getFileBody } from '@/api/global'
import { fileSelectionDialog } from '@/public/index'

import BtEditor from '@/components/extension/bt-editor'
import { ElCheckbox } from 'element-plus'
import { fa } from 'element-plus/es/locale'
import { isDark } from '@/utils/theme-config'

interface formDataProp {
	name: string
	env: string
	data: string
	save: boolean
	template: string
	remark: string
	path: string
	envpath: string
	type: 'path' | 'data'
}

const emits = defineEmits(['close', 'submit'])

// 表单实体
const { BtForm, submit } = useForm({
	data: () => ({
		name: '',
		remark: '',
		data: '',
		env: '',
		save: false,
		template: '',
		path: '',
		envpath: '',
		type: 'data',
	}),
	options: (formDataRef: Ref<formDataProp>) => {
		return computed(() => [
			FormInput('编排名称', 'name', { attrs: { placeholder: '请输入编排名称', class: '!w-[43.5rem]' }, rules: [{ required: true, message: '请输入编排名称', trigger: ['blur'] }] }),
			FormGroup([
				FormRadioButton(
					'来源',
					'type',
					[
						{ label: '编辑', value: 'data' },
						{ label: '文件', value: 'path' },
					],
					{
						attrs: {
							size: 'default',
							onChange: () => {
								console.log(editorConfig)
							},
						},
					}
				),
			]),
			...(formDataRef.value.type == 'path'
				? [
						FormGroup([
							FormInputPath(' ', 'path', { attrs: { class: '!w-[30rem]', placeholder: '请选择compose文件' } }, () => openFile(formDataRef, 'compose')),
							FormButton('本地上传', {
								attrs: {
									class: '!ml-[1rem]',
									onClick: () => {
										getLocalFile(formDataRef, 'compose')
									},
								},
							}),
						]),
				  ]
				: []),
			FormItemCustom(
				'compose内容',
				() => {
					return <BtEditor key="editer1" class="w-full h-[30rem]" v-model={formDataRef.value.data} editorOption={editorConfig} />
				},
				'data'
			),
			...(formDataRef.value.type == 'path'
				? [
						FormGroup([
							FormInputPath(' ', 'envpath', { attrs: { class: '!w-[30rem]', placeholder: '请选择.env文件' } }, () => openFile(formDataRef, 'env')),
							FormButton('本地上传', {
								attrs: {
									class: '!ml-[1rem]',
									onClick: () => {
										getLocalFile(formDataRef, 'env')
									},
								},
							}),
						]),
				  ]
				: []),
			FormItemCustom(
				'.env内容',
				() => {
					return <BtEditor key="editer2" class="w-full h-[10rem]" v-model={formDataRef.value.env} editorOption={editorConfig} />
				},
				'data'
			),
			FormItemCustom(
				'同时存为模板',
				() => {
					return <ElCheckbox v-model={formDataRef.value.save} />
				},
				'save'
			),
			...(formDataRef.value.save ? [FormInput('模板名称', 'template', { attrs: { placeholder: '请输入模板名称', class: '!w-[43.5rem]' } }), FormInput('备注', 'remark', { attrs: { placeholder: '备注', class: '!w-[43.5rem]' } })] : []),
		])
	},
	submit: async (param: Ref<formDataProp>, validate: any, ref: Ref<any>) => {
		await validate()
		onConfirm(param)
	},
})

/**
 * @description: 触发目录选择
 */
const openFile = (formDataRef: Ref<formDataProp>, type: string) => {
	fileSelectionDialog({
		type: 'file',
		change: path => {
			if (!path) return
			if (type == 'compose') {
				formDataRef.value.path = path
			}
			if (type == 'env') {
				formDataRef.value.envpath = path
			}
			if (!path.endsWith('.yml') && !path.endsWith('.yaml') && type == 'compose') {
				Message.error('请选择compose文件')
				return
			}
			if (!path.endsWith('.env') && type == 'env') {
				Message.error('请选择.env文件')
				return
			}
			// 获取文件内容
			getLog(path, formDataRef, type)
		},
	})
}
const editorConfig = {
	mode: 'ace/mode/yaml',
	theme: !isDark.value ? 'ace/theme/chrome' : 'ace/theme/clouds_midnight', //主题
	wrap: true, // 是否自动换行
	showInvisibles: false, // 是否显示空格
	showFoldWidgets: false, // 是否显示代码折叠线
	useSoftTabs: true, // 是否使用空格代替tab
	tabSize: 2, // tab宽度
	showPrintMargin: false, // 是否显示打印边距
	readOnly: false, // 是否只读
	fontSize: '12px', // 字体大小
}

const getLog = async (path: string, dataRef: Ref<formDataProp>, type: string) => {
	try {
		const { data } = await getFileBody({ path })
		if (typeof data === 'object') {
			if (type == 'compose') {
				dataRef.value.data = data.data || ''
			}
			if (type == 'env') {
				dataRef.value.env = data.data || ''
			}
		}
	} catch (error) {
		console.log(error)
	}
}
// 提交
const onConfirm = async (dataRef: Ref<formDataProp>) => {
	const cmdForm = dataRef.value
	let params: any = {
		mod_name: 'docker',
		sub_mod_name: 'com',
		def_name: 'create',
		project_name: cmdForm.name,
		config: cmdForm.data,
		env: cmdForm.env,
		add_template: cmdForm.save ? 1 : 0,
		remark: cmdForm.remark,
		ws_callback: 'create',
	}
	if (cmdForm.save) {
		params.template_name = cmdForm.template
	}
	emits('submit', { params, close: () => emits('close') })
}

const getLocalFile = (dataRef: Ref<formDataProp>, type: 'compose' | 'env') => {
	// 创建input元素
	const input = document.createElement('input')
	input.type = 'file'
	input.style.display = 'none'

	// 设置接受的文件类型
	if (type === 'compose') {
		input.accept = '.yml,.yaml'
	} else if (type === 'env') {
		// input.accept = '.env'
	}

	// 监听change事件
	input.addEventListener('change', event => {
		const file = (event.target as HTMLInputElement).files?.[0]
		if (!file) return

		// 验证文件类型
		if (type === 'compose' && !file.name.endsWith('.yml') && !file.name.endsWith('.yaml')) {
			Message.error('请选择compose文件')
			return
		}

		if (type === 'env' && !file.name.endsWith('env')) {
			Message.error('请选择env文件')
			return
		}

		// 使用FileReader读取文件内容
		const reader = new FileReader()
		reader.onload = e => {
			const content = e.target?.result as string

			// 根据类型赋值
			if (type === 'compose') {
				dataRef.value.path = file.name // 注意：浏览器环境只能获取文件名，无法获取完整路径
				dataRef.value.data = content
			} else if (type === 'env') {
				dataRef.value.envpath = file.name
				dataRef.value.env = content
			}
		}

		reader.onerror = () => {
			Message.error('读取文件内容失败')
		}

		// 以文本方式读取文件
		reader.readAsText(file)
	})

	// 添加到DOM并触发点击
	document.body.appendChild(input)
	input.click()

	// 使用完后移除
	setTimeout(() => {
		document.body.removeChild(input)
	}, 0)
}

defineExpose({
	onConfirm: submit,
})
</script>
<style scoped>
.portTable :deep(.el-form-item__label) {
	@apply w-[5rem] h-[4rem] text-default mr-[0rem] bg-light border-darkSecondary border-[1px] border-light rounded-l-base px-[1rem] box-border;
}
</style>
