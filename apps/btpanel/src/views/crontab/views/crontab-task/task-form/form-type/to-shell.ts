import { FormButton, FormGroup, FormHelp, FormSelect, FormTextarea } from '@/hooks/tools/form/form-item'
import { useDialog } from '@/hooks/tools'
import { getSystemUserList } from '@/api/crontab'
import CRONTAB_TASK_STORE from '../../useStore'

const { shellOptions } = storeToRefs(CRONTAB_TASK_STORE())

export const toShell = (form: any) =>
	[
		// 执行用户
		FormSelect('执行用户', 'user', shellOptions.value, { attrs: { class: '!w-[30rem]', placeholder: '默认使用root用户执行' } }),
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
		FormHelp('温馨提示', [{ content: '为了保证服务器的安全稳定，shell脚本中以下命令不可使用：shutdown, init 0, mkfs, passwd, chpasswd, --stdin, mkfs.ext, mke2fs' }]),
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
			onConfirm: (data: any) => {
				form.value.sBody = data.scriptText // 脚本值
				form.value.version = data.args // 参数值
			},
		},
		showFooter: true,
	})
}

/**
 * @description 获取系统用户
 */
const getSystemUser = async () => {
	try {
		const { data } = await getSystemUserList({ all_user: true })
		return data.map((item: any) => ({ label: item, value: item })) || []
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description 获取系统用户
 */
const init = async () => {
	try {
		const res = await getSystemUser()
		shellOptions.value = res
	} catch (error) {}
}

init()
