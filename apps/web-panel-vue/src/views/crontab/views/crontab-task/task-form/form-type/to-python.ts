import { FormButton, FormGroup, FormSelect, FormTextarea, FormCustom } from '@/hooks/tools/form/form-item'
import { useDialog } from '@/hooks/tools'
import { getSystemUserList, getPythonEnvList } from '@/api/crontab'
import CRONTAB_TASK_STORE from '../../useStore'

// 执行用户
const { shellOptions, pythonEnvOptions } = storeToRefs(CRONTAB_TASK_STORE())

export const toPython = (form: any) =>
	[
		// 执行用户
		FormSelect('执行用户', 'user', shellOptions.value, { attrs: { class: '!w-[30rem]', placeholder: '默认使用root用户执行' } }),
		FormGroup([
			// python环境
			FormSelect('python环境', 'python_env', pythonEnvOptions.value, {
				attrs: { class: '!w-[30rem]', placeholder: '请选择python环境' },
				rules: [{ required: true, message: '请选择python环境', trigger: 'change' }],
			}),
			FormCustom(() => h('span', { class: 'ml-[1.5rem] bt-link h-[3rem] leading-[3rem]', onClick: openPythonEnvManageView }, 'python环境管理')),
		]),
		// 脚本内容
		FormGroup([
			FormTextarea('脚本内容', 'sBody', {
				attrs: {
					class: 'w-[60rem]',
					rows: 10,
					resize: 'none',
					placeholder: '请输入脚本内容',
				},
				rules: [{ required: true, message: '请输入脚本内容', trigger: 'blur' }],
			}),
			FormButton('选择脚本', { attrs: { class: '!ml-4px', onClick: () => selectShell(form) } }),
		]),
	] as any[]

/**
 * @description: 选择脚本
 */
const selectShell = async (form: any) => {
	useDialog({
		title: '选择脚本',
		area: 40,
		component: () => import('../select-shell/index.vue'),
		compData: {
			value: form.value.sBody,
			type: 'python',
			onConfirm: (data: any) => {
				form.value.sBody = data.scriptText // 脚本值
				form.value.version = data.args // 参数值
			},
		},
		showFooter: true,
	})
}

/**
 * @description 打开Python环境管理
 */
export const openPythonEnvManageView = () => {
	useDialog({
		isAsync: true,
		title: `Python环境管理`,
		area: 105,
		component: () => import('@site/views/python-model/command-line-env-manage/index.vue'),
		onCancel: () => {
			init()
		},
	})
}
/**
 * @description 获取python环境列表
 */
const getPythonEnv = async () => {
	const { data } = await getPythonEnvList()
	return data.env_list.map((item: any) => ({ label: item.name, value: item.bin_path })) || []
}

/**
 * @description 获取系统用户
 */
const init = async () => {
	try {
		const pythonEnv = await getPythonEnv()
		pythonEnvOptions.value = pythonEnv
	} catch (error) {}
}

init()
