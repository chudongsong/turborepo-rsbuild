import { defineStore } from 'pinia'
import { checkEmail, getByteUnit } from '@/utils/index'
import { getEmail, sendEmail } from '@api/files'
import { getWholePath } from '@files/useMethods'
import { Message, useDataHandle, useDialog } from '@/hooks/tools'
import { pushMessageConfigDialog } from '@/public/index'

const FILES_SEND_EMAIL_STORE = defineStore('FILES-SEND-EMAIL-STORE', () => {
	const fileItem = ref<any>() // 文件信息

	// 表单
	const quickForm = reactive<any>({
		email: '',
		msg: '',
	})
	const disable = ref(false)

	const quickFormRef = ref()
	// 验证规则
	const quickRules = reactive({
		email: [
			{
				validator: (rule: any, value: any, callback: any) => {
					if (value === '') {
						callback(new Error('请输入接受者邮箱'))
					} else {
						// 获取邮箱数组
						const email = value
							.trim()
							.split(',')
							.filter((item: any) => item !== '')
						let flag = false
						email.forEach((item: any) => {
							if (!checkEmail(item)) {
								flag = true
							}
						})
						if (flag) {
							callback(new Error('请输入正确的邮箱'))
						} else {
							callback()
						}
					}
				},
				trigger: ['blur'],
			},
		],
		fileName: [
			{
				validator: (rule: any, value: any, callback: any) => {
					if (fileItem.value.size > 52428800) {
						callback(new Error('请选择小于50M的附件'))
					} else {
						callback()
					}
				},
			},
		],
	})

	// 获取邮箱信息
	const getDetail = async () => {
		const { data } = await getEmail()
		if (isEmptyObject(data)) {
			pushMessageConfigDialog({
				...{
					title: '发送者配置',
					type: 'mail',
				},
				callback: () => {},
			} as any)
		}
	}
	/**
	 * @description 判断是否为空对象
	 */
	const isEmptyObject = (obj: any) => {
		return Object.keys(obj).length === 0
	}

	// 提交
	const onConfirm = async () => {
		const params: any = {
			to_email: quickForm.email,
			msg: quickForm.msg,
			flist: [getWholePath(fileItem.value.fileName)],
		}
		await quickFormRef.value.validate()
		const res: any = await useDataHandle({
			loading: disable,
			request: sendEmail({ data: JSON.stringify(params) }),
			success: (res: any) => {
				const { data } = res
				if (data.msg && data.msg != '') {
					Message.error(data.msg)
					return null
				}
				let list: any = []
				Object.keys(data.list).forEach((item: any) => {
					const Status = isEmptyObject(data.list[item].error)
					let msgArr: any = []
					if (!Status) {
						Object.keys(data.list[item].error).forEach((key: any) => {
							msgArr.push(key + '：' + data.list[item].error[key])
						})
					}
					list.push({
						name: item,
						msg: Status ? '发送成功' : msgArr.join('<br>'),
						//判断是否为空对象
						status: Status ? true : false,
					})
				})
				useDialog({
					title: '发送至邮箱-结果',
					area: 50,
					component: () => import('@components/extension/bt-result/index.vue'),
					compData: {
						resultData: list,
						resultTitle: '发送至邮箱',
						resultColumn: [
							{
								label: '邮箱',
								prop: 'name',
							},
							{
								label: '结果',
								width: 80,
								render: (row: any) => {
									return h('span', { class: row.status ? 'text-primary' : 'text-danger' }, row.status ? '操作成功' : '操作失败')
								},
							},
							{
								label: '信息',
								render: (row: any) => {
									return h('span', { class: row.status ? '' : 'text-danger' }, row.msg)
								},
							},
						],
					},
				})
			},
		})
		return res.data.status
	}

	const $reset = () => {
		disable.value = false
		Object.assign(quickForm, {
			email: '',
			msg: '',
		})
	}

	return {
		fileItem,
		quickFormRef,
		quickForm,
		quickRules,
		disable,
		getDetail,
		onConfirm,
		$reset,
	}
})

export default FILES_SEND_EMAIL_STORE
