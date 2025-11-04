import { checkUrlConnecte } from '@/api/crontab'
import { Message, useDialog } from '@/hooks/tools'
import { FormButton, FormGroup, FormInput, FormTextarea } from '@/hooks/tools/form/form-item'
import { checkUrl } from '@/utils'
import CRONTAB_TASK_STORE from '../../useStore'

const { rowData } = storeToRefs(CRONTAB_TASK_STORE())
const isEdit = computed(() => !!rowData.value.id) // 是否编辑
const isAdd = computed(() => !rowData.value.id && !rowData.value) // 是否新增

export const toUrl = (form: any) => {
	// 初始化名称
	if (isAdd.value) {
		form.value.name = `访问URL-[ http:// ]`
		form.value.urladdress = 'http://'
	}
	return [
		// 脚本内容
		FormGroup([
			FormInput('URL地址', 'urladdress', {
				attrs: {
					placeholder: '请输入URL地址',
					class: '!w-[30rem]',
					onInput: (val: any) => {
						form.value.name = `访问URL-[ ${val} ]`
					},
				},
				rules: [{ required: true, message: '请输入URL地址', trigger: 'blur' }],
			}),
			FormButton('测试URL', {
				attrs: {
					class: '!ml-4px',
					onClick: () => testUrl(form),
				},
			}),
		]),
		FormTextarea('User-Agent', 'user_agent', {
			attrs: {
				placeholder: '请输入User-Agent',
				class: 'w-[60rem]',
			},
		}),
	] as any[]
}

/**
 * @description 测试url
 */
const testUrl = async (form: any) => {
	const urlPattern = checkUrl(form.value.urladdress)
	if (!urlPattern) {
		return Message.error('请输入正确的url地址')
	} else {
		const loading = Message.load('正在测试，请稍候...')
		try {
			const res = await checkUrlConnecte({ url: form.value.urladdress })
			useDialog({
				title: '测试URL结果',
				area: 59,
				component: () => import('../test-url-result/index.vue'),
				compData: { result: res.data },
			})
		} catch (error) {
			console.log(error)
		} finally {
			loading.close()
		}
	}
}
