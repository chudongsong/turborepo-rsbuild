import { defineStore } from 'pinia'
import { copyText } from '@/utils/index'
import { shareFile, getShareFile, closeShareFile } from '@api/files'
import { getWholePath, ShareDetailView } from '@files/useMethods'
import { Message, useConfirm, useDataHandle } from '@/hooks/tools'
import FILES_STORE from '@files/store'
import FILES_SHARE_LIST_STORE from '../../views/share-list/store'

const FILES_SHARE_STORE = defineStore('FILES-SHARE-STORE', () => {
	const { refreshFilesList } = FILES_STORE()

	const fileItem = ref<any>() // 文件信息

	// 表单
	const quickForm = reactive<any>({
		ps: '', // 分享名称
		expire: 24, // 有效期
		password: '', // 提取码
	})
	const disable = ref(false)
	// 帮助信息
	const help = [
		{
			isHtml: true,
			content: '<span class="text-[#ef0808]">注意：生成的外链分享链接具有一定的风险，请仅与可信任的人分享链接，避免敏感信息泄露</span>',
		},
	]
	const quickFormRef = ref()
	// 验证规则
	const quickRules = reactive({
		ps: [
			{
				validator: (rule: any, value: any, callback: any) => {
					if (value === '') {
						callback(new Error('请输入分享名称'))
					} else {
						callback()
					}
				},
				trigger: ['blur'],
			},
		],
	})

	// 提交
	const onConfirm = async (instance?: any) => {
		const params = {
			filename: getWholePath(fileItem.value.fileName),
			ps: quickForm.ps,
			password: quickForm.password,
			expire: quickForm.expire,
		}
		await quickFormRef.value.validate()

		await useDataHandle({
			loading: disable,
			request: shareFile(params),
			// message: true,
			success: (res: any) => {
				if (res.status) {
					Message.success('分享成功')
					instance.unmount()
				} else {
					Message.error(res.message)
				}
				refreshFilesList()
				return ShareDetailView(res.data)
			},
		})
	}

	const compData = ref<any>() // 组件数据
	// 表单
	const detailForm = reactive<any>({
		name: '',
		link: '',
		code: '',
		time: '',
	})

	const detail = ref<any>({})
	// 显示二维码
	const showQrcode = ref<boolean>(false)
	const isDisabled = ref<boolean>(false) // 是否禁用表单
	const detailFormRef = ref()
	const detailRules = reactive({})
	const helpList = [
		{
			content: '<span class="text-[#ef0808]">注意：生成的外链分享链接具有一定的风险，请仅与可信任的人分享链接，避免敏感信息泄露</span>',
			isHtml: true,
		},
	] // 帮助列表

	// 复制链接
	const copyLink = (e: any) => {
		copyText({ value: detailForm.link })
	}

	// 复制链接及提取码
	const copyAll = (e: any) => {
		copyText({ value: `链接：${detailForm.link} 提取码：${detailForm.code}` })
	}

	// 获取文件详情
	const getDetail = async () => {
		// 当为分享列表打开时不需要重复请求数据
		if (compData.value.isShareList) {
			detail.value = compData.value
			detailForm.name = compData.value.ps
			detailForm.link = location.origin + '/down/' + compData.value.token
			detailForm.code = compData.value.password || ''
			detailForm.time = compData.value.expire
			detailForm.qrcode = location.origin + '/down/' + compData.value.token + '?fname=' + compData.value.ps + '&down=true'
			return
		}
		// 需要进行请求获取数据的情况如：新建分享等
		await useDataHandle({
			loading: '正在获取分享详情，请稍后...',
			request: getShareFile({ id: Number(compData.value.isShare | compData.value.id) }),
			success: (res: any) => {
				detail.value = res.data
				detailForm.name = res.data.ps
				detailForm.link = location.origin + '/down/' + res.data.token
				detailForm.code = res.data.password || ''
				detailForm.time = res.data.expire
				detailForm.qrcode = location.origin + '/down/' + res.data.token + '?fname=' + res.data.ps + '&down=true'
			},
		})
	}

	// 关闭外链分享
	const onConfirmDetail = async () => {
		try {
			await detailFormRef.value.validate()
			await useConfirm({
				title: `取消分享【${detail.value.ps}】`,
				content: `您真的要取消分享【${detail.value.ps}】吗？`,
			})
			const params = {
				id: detail.value.id,
			}
			const res: any = await useDataHandle({
				loading: '正在取消文件分享，请稍后...',
				request: closeShareFile(params),
				message: true,
				success: (res: any) => {
					if (res.status) {
						const { getShareData } = FILES_SHARE_LIST_STORE()
						getShareData()
						refreshFilesList()
					}
				},
			})
			return res.status
		} catch (error) {
			console.log(error)
		}
	}

	const initDetail = () => {
		showQrcode.value = false
		Object.assign(detailForm, {
			name: '',
			link: location.origin + '/down/' + compData.value.token,
			code: '',
			time: compData.value.expire,
		})
		getDetail()
	}

	const init = () => {
		disable.value = false
		Object.assign(quickForm, {
			ps: fileItem.value.fileName, // 分享名称
			expire: 24, // 有效期
			password: '', // 提取码
		})
	}

	return {
		fileItem,
		quickFormRef,
		quickForm,
		quickRules,
		disable,
		help,
		compData,
		detail,
		detailFormRef,
		detailForm,
		detailRules,
		isDisabled,
		helpList,
		showQrcode,
		copyAll,
		copyLink,
		onConfirm,
		onConfirmDetail,
		initDetail,
		init,
	}
})

export default FILES_SHARE_STORE
