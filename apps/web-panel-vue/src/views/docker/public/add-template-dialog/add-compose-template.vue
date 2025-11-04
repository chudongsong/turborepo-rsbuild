<template>
	<div v-bt-loading="loading" v-bt-loading:title="'正在获取模板消息，请稍候...'" class="flex flex-col lib-box p-2rem">
		<BtForm />
	</div>
</template>
<script setup lang="tsx">
import { useForm } from '@/hooks/tools'
import { FormInput, FormItemCustom, FormGroup, FormInputPath, FormButton } from '@form/form-item'
import { addTemplate, editTemplate, getTemplateDetail } from '@/api/docker'
import { getDockerStore } from '@docker/useStore'
import { getFileBody } from '@/api/global'
import { useMessage } from '@hooks/tools/message'
import { useDataHandle } from '@hooks/tools/data'
import { fileSelectionDialog } from '@/public/index'
import BtEditor from '@/components/extension/bt-editor'
import { isDark } from '@/utils/theme-config'

interface Props {
	compData?: any
}
interface FormData {
	name: string
	remark: string
	data: string
	env: string
}

const Message = useMessage()
const {
	refs: { isRefreshTemplateList },
} = getDockerStore()

const props = withDefaults(defineProps<Props>(), {
	compData: () => ({}),
})
const emits = defineEmits(['close', 'complate'])
const loading = ref(false) // 加载状态

// 获取编辑数据
const getEditData = async () => {
	const cmdForm = {
		name: '',
		remark: '',
		data: '',
		env: '',
	}
	cmdForm.name = props.compData.row.name
	cmdForm.remark = props.compData.row.remark
	const res: any = await useDataHandle({
		request: getTemplateDetail({
			data: JSON.stringify({ template_id: props.compData.row.id }),
		}),
		loading: loading,
	})
	if (res.status) {
		cmdForm.data = res.data.compose_data
		cmdForm.env = res.data.env_data
	} else {
		Message.error(res.msg)
	}
	return cmdForm
}

const config = {
	mode: 'ace/mode/nginx',
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
// 表单实体
const { BtForm, submit } = useForm({
	data: async () => {
		if (props.compData.row?.id) {
			return getEditData()
		}
		return {
			name: '',
			remark: '',
			data: '',
			env: '',
			path: '',
			envpath: '',
		}
	},
	options: (formDataRef: Ref<FormData>) => {
		return computed(() => [
			FormInput('创建模板', 'name', {
				attrs: { class: '!w-[35rem]', placeholder: '请输入模板名' },
				rules: [{ required: true, message: '请输入模板名', trigger: 'blur' }],
			}),
			FormInput('备注', 'remark', {
				attrs: { class: '!w-[35rem]', placeholder: '备注' },
			}),
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
			FormItemCustom(
				'compose内容',
				() => {
					return h(BtEditor, {
						id: 'templateEditor',
						class: 'max-h-[30rem] h-[30rem] !w-[43rem]',
						modelValue: formDataRef.value.data,
						'onUpdate:modelValue': (newValue: string) => (formDataRef.value.data = newValue),
						editorOption: config,
					})
				},
				'data',
				{
					rules: [{ required: true, message: '请输入内容', trigger: 'blur' }],
				}
			),
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
			FormItemCustom(
				'.env内容',
				() => {
					return <BtEditor key="editer2" class="w-full h-[10rem]" v-model={formDataRef.value.env} editorOption={config} />
				},
				'data'
			),
		])
	},
	submit: async (param: Ref<FormData>, validate: any, ref: Ref<any>) => {
		await validate()
		useDataHandle({
			request: props.compData.row?.id
				? editTemplate({
						data: JSON.stringify({
							id: props.compData.row.id,
							name: param.value.name,
							remark: param.value.remark,
							data: param.value.data,
							env: param.value.env,
						}),
				  })
				: addTemplate({
						data: JSON.stringify({
							name: param.value.name,
							remark: param.value.remark,
							data: param.value.data,
							env: param.value.env,
						}),
				  }),
			loading: '提交中...',
			message: true,
			success: (res: any) => {
				if (res.status) {
					emits('complate', res)
					isRefreshTemplateList.value = true
					emits('close')
				}
			},
		})
	},
})

/**
 * @description: 触发目录选择
 */
const openFile = (formDataRef: Ref<any>, type: string) => {
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

const getLog = async (path: string, dataRef: Ref<any>, type: string) => {
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

const getLocalFile = (dataRef: Ref<any>, type: 'compose' | 'env') => {
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
onMounted(async () => {})

defineExpose({
	onConfirm: submit,
})
</script>
<style lang="css" scoped>
.portTable :deep(.el-form-item__label) {
	@apply w-[5rem] h-[4rem] text-default mr-[0rem] bg-[#f2f4f7] border-medium border-[1px] border-[#e4e7ed] rounded-l-[0.4rem] px-[1rem] box-border;
}
</style>
