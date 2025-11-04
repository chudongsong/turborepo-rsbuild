import { defineStore } from 'pinia'
import { useDataHandle, useDialog } from '@/hooks/tools'
import ReceiveForm from './receive.vue'
import SendForm from './send.vue'
import { addFileRsync, addReceiveRsync, addSendRsync } from '@api/files'

const FILES_RSYNC_STORE = defineStore('FILES-RSYNC-STORE', () => {
	const compData = ref<any>() // 组件数据

	/**
	 * @description 重置表单
	 */
	const resetForm = () => {
		formDisabled.value = false
		isSuccess.value = false
		// 打开对应弹窗
		Object.assign(receiveForm, {
			mName: '',
			password: '',
			path: compData.value.row.path,
			comment: '',
		})
		alertRsync.value = false
		checkOffRsync.value = false
		Object.assign(sendForm, {
			ip: '', // ip
			rsync: 'user', // 链接方式
			sname: '', // 用户名
			password: '', // 密码
			path: compData.value.row.path, // 同步目录
			port: 873, // 端口
			secret_key: '', // 密钥
			delete: false, // 同步方式
			realtime: true, // 同步周期
			bwlimit: 1024, // 限速
			delay: 3, // 延迟
			compress: true, // 压缩传输
			cron: {
				type: 'day',
				where1: '',
				hour: 0,
				minute: 1,
				id: '',
				port: '',
			},
		})
	}

	const handleClick = (type: string, isReset?: boolean, callback?: any) => {
		receiveForm.path = compData.value.row.path
		sendForm.path = compData.value.row.path
		if (isReset) resetForm()
		if (type === 'receive') {
			useDialog({
				title: '创建接收端',
				area: 42,
				btn: ['确认', '取消'],
				showFooter: !isSuccess.value,
				component: ReceiveForm,
				onConfirm: onConfirmReceive,
			})
		} else {
			useDialog({
				title: '创建发送端',
				area: 58,
				btn: ['确认', '取消'],
				component: SendForm,
				onConfirm: onConfirmSend,
			})
		}
		if (callback) callback()
	}

	/**
	 * @description 刷新事件
	 */
	const refreshEvent = async () => {
		if (compData.value.row?.type === 'site') {
			compData.value.row.refreshEvent()
		} else {
			const { default: FILES_STORE } = await import('@files/store')
			const { refreshFilesList } = FILES_STORE()
			refreshFilesList()
		}
	}

	const popupSetFooter = inject('popupSetFooter', (value: boolean) => {}) // 设置底部按钮
	const formDisabled = ref<boolean>(false) // 表单是否禁用
	const receiveForm = reactive({
		mName: '',
		password: '',
		path: '',
		comment: '',
	})
	const receiveFormRef = ref<any>() // 表单ref
	const isSuccess = ref<boolean>(false) // 是否成功

	const rules = reactive({
		mName: [
			{ required: true, message: '请输入用户名', trigger: 'blur' },
			{ min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' },
			{
				validator: (rule: any, value: any, callback: any) => {
					// 用户名称不能有中文或特殊符号
					// 长度在 3 到 20 个字符
					const reg = /^[a-zA-Z0-9_]{3,20}$/
					if (!reg.test(value)) {
						callback(new Error('用户名不能有中文或特殊符号'))
					} else {
						callback()
					}
				},
				trigger: 'blur',
			},
		],
		password: [
			{ required: true, message: '请输入密码', trigger: 'blur' },
			{ min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' },
		],
	})

	/**
	 * @description 确认
	 */
	const onConfirmReceive = async (instance: any) => {
		// 确认
		// if (!isSuccess.value) {
		await receiveFormRef.value.validate()
		await useDataHandle({
			loading: formDisabled,
			request: addReceiveRsync({
				...receiveForm,
				comment: receiveForm.mName,
			}),
			message: true,
			success: async (res: any) => {
				isSuccess.value = res.status
				if (res.status) {
					await addFileRsync({
						path: compData.value.row.path,
						s_type: 'recv',
					})
					// isSuccess.value && popupSetFooter(false) // 隐藏底部按钮;
					instance.unmount()
					refreshEvent()
					handleClick('receive')
				}
			},
		})
		// } else {
		// 	close()
		// }
	}

	const sendForm = reactive({
		ip: '', // ip
		rsync: 'user', // 链接方式
		sname: '', // 用户名
		password: '', // 密码
		path: '', // 同步目录
		port: 873, // 端口
		secret_key: '', // 密钥
		delete: false, // 同步方式
		realtime: true, // 同步周期
		bwlimit: 1024, // 限速
		delay: 3, // 延迟
		compress: true, // 压缩传输
		cron: {
			type: 'day',
			where1: '',
			hour: 0,
			minute: 1,
			id: '',
			port: '',
		},
	})
	const sendFormRef = ref<any>() // 表单ref
	const alertRsync = ref<boolean>(false) // 是否成功
	const checkOffRsync = ref<boolean>(false) // 是否勾选关闭
	const helpList = [
		{ content: '【同步目录】：若不以/结尾，则表示将数据同步到二级目录，一般情况下目录路径请以/结尾' },
		{ content: '【同步方式】增量： 数据更改/增加时同步，且只追加和替换文件' },
		{ content: '【同步方式】完全： 保持两端的数据与目录结构的一致性，会同步删除、追加和替换文件和目录' },
		{ content: '【限速】：限制数据同步任务的速度，防止因同步数据导致带宽跑高' },
		{ content: '【延迟】：在延迟时间周期内仅记录不同步，到达周期后一次性同步数据，以节省开销' },
		{ content: '【压缩传输】：开启后可减少带宽开销，但会增加CPU开销，如带宽充足，建议关闭此选项' },
	]

	const rulesSend = reactive({
		ip: [
			{ required: true, message: '请输入ip', trigger: 'blur' },
			{
				//检验ip格式
				validator: (rule: any, value: any, callback: any) => {
					const reg = /^(\d+)\.(\d+)\.(\d+)\.(\d+)$/
					if (!reg.test(value)) {
						callback(new Error('请输入正确的ip'))
					} else {
						callback()
					}
				},
			},
		],
		sname: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
		password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
		secret_key: [{ required: true, message: '请输入密钥', trigger: 'blur' }],
	})

	/**
	 * @description 同步方式
	 */
	const handleChangeDelete = async (val: boolean) => {
		if (val) {
			alertRsync.value = true
			sendForm.delete = !val
		} else {
			alertRsync.value = false
		}
	}

	/**
	 * @description 确认
	 */
	const onConfirmSend = async (instance: any) => {
		let params: any = {
			...sendForm,
			cron: JSON.stringify({
				...sendForm.cron,
				port: String(sendForm.port),
				hour: String(sendForm.cron.hour),
				minute: String(sendForm.cron.minute),
			}),
		}
		if (sendForm.cron.type === 'minute-n') {
			params.cron = JSON.stringify({
				...sendForm.cron,
				hour: String(sendForm.cron.hour),
				where1: String(sendForm.cron.minute),
				minute: '',
				port: String(sendForm.port),
			})
		}
		if (sendForm.rsync === 'key') {
			params.sname = ''
			params.password = ''
		} else {
			params.secret_key = ''
		}
		delete params.rsync
		await sendFormRef.value.validate()
		const res: any = await useDataHandle({
			loading: formDisabled,
			request: addSendRsync(params),
			message: true,
			success: async (res: any) => {
				if (res.status) {
					await useDataHandle({
						request: addFileRsync({
							path: compData.value.row.path,
							s_type: 'send',
						}),
					})
					refreshEvent()
				}
			},
		})
		return res.status
	}

	/**
	 * @description 确认
	 */
	const handleConfirm = (val: boolean) => {
		sendForm.delete = val
		alertRsync.value = false
		checkOffRsync.value = false
	}

	return {
		compData,
		handleClick,

		formDisabled,
		rules,
		isSuccess,
		receiveForm,
		receiveFormRef,

		sendFormRef,
		rulesSend,
		sendForm,
		alertRsync,
		checkOffRsync,
		helpList,
		handleChangeDelete,
		handleConfirm,
	}
})

export default FILES_RSYNC_STORE
