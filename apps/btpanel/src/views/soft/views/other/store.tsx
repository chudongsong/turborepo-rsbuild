import { defineStore, storeToRefs } from 'pinia'
import { useAxios } from '@/hooks/tools'
import { has } from 'ramda'

import type { TableColumnProps } from '@components/data/bt-table/types'
import type { SoftTableRowProps, SoftTableProps } from '@/views/soft/types'

import { SOFT_STORE } from '@soft/store'
import { useGlobalStore } from '@store/global'

import { checkSoftPluginPay, checkPluginUpdate, productPaymentDialog, bindUserDialog } from '@/public'
import { Message, useMessage } from '@/hooks/tools'
import { useDialog } from '@hooks/tools/dialog'

import { getOrderStat, getSoftList, getThirdRenewOrder, uploadPlugin } from '@/api/soft'
import { openPluginEvent, useSoftDev, useSoftEndTime, useSoftHomeShow, useSoftName, useSoftPosition, useSoftPrice, useSoftPs, useSoftOperate, useSoftScore, setHomeShowEvent, pluginInstallEvent, softDataHandle, softForceMsg } from '@/views/soft/useMethod'
import { openProductPayView } from '@/public'
import { useHandleError } from '@hooks/tools/error'
import { inputZips } from '@/api/global'
import axios from 'axios'
import { UploadFile } from '@components/business/bt-file-upload/hooks'

const SOFT_OTHER_STORE = defineStore('SOFT-OTHER-STORE', () => {
	const { payment } = useGlobalStore()
	const { searchVal, historyList, showNpsCollect, isLoading, inputZipFlag, speedInstallView } = storeToRefs(SOFT_STORE())
	const { scoreEvent, unInstallPlugin } = SOFT_STORE()

	const rowData = ref()
	const buyPopup = ref<any>(null) // 购买弹窗

	const softTableList = shallowRef<SoftTableRowProps[]>([]) // 软件列表
	const tablePageConfig = ref({ total: 0, page: 1, row: 15 }) // 表格分页配置

	const uploadFilesList = ref<string[]>([])
	const uploadData = reactive({
		totalProgress: 0,
		uploadList: 0,
		sizeUploaded: 0,
		currentSpeed: 0,
		timeRemaining: 0,
		timeElapsed: 0,
		averageSpeed: 0,
		errorNumber: 0,
		successNumber: 0,
		uploadSize: '',
	})
	const uploadStatus = ref('paused')
	const uploadLoading = ref<any>(null)
	const uploadFile = new UploadFile({
		target: '/files?action=upload',
		uploadPath: '/tmp/plugin_tmp',
		// 更新上传文件列表
		renewalData: async (list: any) => {
			uploadFilesList.value = [...list]
			// 检查所有文件是否上传完成
			const allSuccess = list.length > 0 && list.every((item: any) => item.status === 'success')
			const hasError = list.some((item: any) => item.status === 'error')
			const isUploading = list.some((item: any) => item.status === 'uploading')
			
			const isUploadComplete = !isUploading && (allSuccess || hasError)
			
			// 关闭上传阶段的loading
			if (isUploadComplete && uploadLoading.value) {
				uploadLoading.value.close()
				uploadLoading.value = null
			}
			
			// 当所有文件上传成功时，调用安装
			if (allSuccess && !hasError && !isUploading) {
				const load = useMessage().load('正在解析插件压缩包，请稍后...')
				try {
					const res = await uploadPlugin({
						plugin_zip_path: `/tmp/plugin_tmp/${list[0].name}`,
					})
					if (has('status', res.data) && has('msg', res.data) && !res.data.status) {
						return Message.error(res.data.msg)
					}
					installOtherEvent(res.data)
				} catch (error) {
					console.log(error)
				} finally {
					load.close()
				}
			} else if (hasError) {
				Message.error('文件上传失败')
			}
		},

		// 更新上传进度
		renewalSpeed: (data: any) => {
			uploadData.totalProgress = data.totalProgress
			uploadData.uploadList = data.uploadList
			uploadData.sizeUploaded = data.sizeUploaded
			uploadData.currentSpeed = data.currentSpeed
			uploadData.timeRemaining = data.timeRemaining
			
			// 更新 loading 提示，显示进度百分比
			if (uploadLoading.value && uploadStatus.value === 'uploading') {
				const progress = Math.round(data.totalProgress || 0)
				uploadLoading.value.setText?.(`正在上传插件，请稍后... ${progress}%`)
			}
		},
		// 更新上传状态
		renewalStatus: (config: any) => {
			uploadStatus.value = config.status
			uploadData.timeElapsed = config.timeElapsed
			uploadData.averageSpeed = config.averageSpeed
			uploadData.uploadSize = config.uploadSize
			uploadData.successNumber = config.successNumber
			uploadData.errorNumber = config.errorNumber
		},
	})
	/**
	 * @description 安装第三方插件
	 * @param data
	 */
	const installOtherEvent = (data: any) => {
		rowData.value = data
		useDialog({
			title: `安装第三方插件包`,
			area: 50,
			btn: ['确定安装', '取消'],
			component: () => import('@soft/views/other/install-other-plugin/index.vue'),
		})
	}

	/**
	 * @description 第三方插件购买
	 * @returns {App}
	 */
	const buyThirdPluginView = async (row: any) => {
		rowData.value = row
		buyPopup.value = useDialog({
			title: `${row.title}购买`,
			area: 50, // 【number、string、array<number/string>】视图大小，支持数组[宽，高]，默认单位rem
			component: () => import('@soft/views/other/buy-other-plugin/index.vue'), // 组件引入
		})
	}

	/**
	 * @description 导入第三方插件
	 */
	const importOtherEvent = () => {
		const input = document.createElement('input')
		input.type = 'file'
		input.style.display = 'none'
		input.accept = '.zip,.tar.gz'
		input.id = 'update_zip'
		input.multiple = true
		input.addEventListener('change', async () => {
			const files = input.files || []
			if (files.length === 0) return
			const file = files[0]
			uploadFile.isGetFiles = true
			const path = `/${file.webkitRelativePath === '' ? file.name : file.webkitRelativePath}`
			const result = uploadFile.fileUploadLimit(file, path)
			
			if (!result) {
				console.log('文件添加失败')
				return
			}
			uploadStatus.value = 'uploading'
			uploadLoading.value = useMessage().load('正在上传插件，请稍后...')
			try {
				await uploadFile.useFileUploadExistsConfirm()
			} catch (error) {
				if (uploadLoading.value) {
					uploadLoading.value.close()
					uploadLoading.value = null
				}
				console.error(error)
			}
		})
		input.click()
	}

	const checkThirdPay = (row: any) => {
		return row.endtime < 0 // 未购买
	}

	/**
	 * @description 生成表格配置
	 * @returns {Promise<void>} void
	 */
	const useSoftTableColumn = () => {
		return shallowRef<TableColumnProps[]>([
			useSoftName({
				type: 'app',
				onClick: (row: SoftTableRowProps) => openPluginEvent(row),
			}),
			useSoftDev(),
			useSoftPs('app'),
			useSoftPrice(),
			useSoftEndTime({ onClick: buyThirdPluginView }),
			useSoftPosition(),
			useSoftScore({ onClick: scoreEvent }),
			useSoftHomeShow({
				onChange: async (row: SoftTableRowProps, val: boolean) => {
					const rdata = await setHomeShowEvent(row, val)
					if (!rdata.status) refreshList('0')
				},
			}),

			useSoftOperate((row: SoftTableRowProps) => {
				let softOperateList = []
				const payStatus = !checkThirdPay(row) // 是否已支付插件

				// if (!payment.value.bindUser) {
				// 	if (row.price > 0) {
				// 		softOperateList.push({
				// 			onClick: () => bindUserDialog(),
				// 			title: '立即购买',
				// 		})
				// 	} else {
				// 		softOperateList.push({ onClick: pluginInstallEvent, title: '安装' })
				// 	}
				// 	return softOperateList
				// }
				softOperateList.push({
					onClick: buyThirdPluginView,
					title: row.endtime !== -1 ? '立即续费' : '立即购买',
					isHide: () => payStatus,
				}) // 判定续费 -1：购买 -2：续费

				// 若软件已安装显示卸载
				if (row.setup && !payStatus) softOperateList.push({ onClick: unInstallPlugin, title: '卸载' })

				if (!payStatus) return softOperateList // 直接返回 不再进行后续判断

				if (row.setup) {
					const showUpdate = checkPluginUpdate(row) // 更新：比对版本，添加更新操作
					softOperateList.push({
						onClick: (row: any) => pluginInstallEvent(row, 'update'),
						title: '更新',
						isHide: () => !showUpdate,
					})
					softOperateList.push({ onClick: openPluginEvent, title: '设置' })
					softOperateList.push({ onClick: unInstallPlugin, title: '卸载' })
				} else {
					if (row.price > 0 && !payment.value.bindUser) {
						softOperateList.push({
							onClick: () => bindUserDialog(),
							title: '立即购买',
						})
					} else {
						softOperateList.push({ onClick: pluginInstallEvent, title: '安装' })
					}
				}
				return softOperateList
			}),
		])
	}

	/**
	 * @description 分页事件
	 * @param {number} page 页码
	 * @param {number} row 条数
	 */
	const pageChangeEvent = (page: number, row: number) => {
		tablePageConfig.value.page = page
		tablePageConfig.value.row = row
		refreshList('0')
	}

	/**
	 * @description 获取软件列表
	 * @returns {Promise<void>} void
	 */
	const getSoftListData = async (
		params: SoftTableProps = {
			type: 10,
			query: searchVal.value,
			p: tablePageConfig.value.page,
			row: tablePageConfig.value.row,
			force: '0',
		}
	) => {
		try {
			params.query = searchVal.value || ''
			const { data } = await getSoftList(params)
			const { softList, total, historyList: history, isForce } = await softDataHandle(data) // 数据处理
			if (isForce) softForceMsg(isForce) // 强制刷新提示
			showNpsCollect.value = !softList.length // 显示NPS弹窗
			softTableList.value = softList as SoftTableRowProps[] // 软件列表
			historyList.value = history // 软件历史记录
			tablePageConfig.value.total = total // 分页总数
		} catch (error) {
			useHandleError(error, 'getSoftListData') // 错误处理
		} finally {
			isLoading.value = false
		}
	}

	// 表格列
	let TableColumn = useSoftTableColumn()

	const refreshList = (force: '0' | '1' = '0') => {
		TableColumn = useSoftTableColumn()
		getSoftListData({
			type: 10,
			query: searchVal.value,
			p: tablePageConfig.value.page,
			row: tablePageConfig.value.row,
			force,
		})
	}

	// 购买第三方插件
	const plugin = reactive({
		bugTime: '1',
		qrcode: 'https://www.bt.cn',
		qrcodeSize: 160,
	})
	const oid = ref<number>(0) // 订单id
	const price = ref<string>('0') // 价格
	const timer = ref<any>(0)

	// 获取续费订单
	const getRenewOrder = async (): Promise<void> => {
		// 清理所有定时器
		clearTimeout(timer.value)
		price.value = (rowData.value.price * Number(plugin.bugTime)).toFixed(2)
		const { data } = await getThirdRenewOrder({
			pid: rowData.value.pid,
			cycle: plugin.bugTime,
			type: rowData.value.endtime === -1 ? 0 : 1, // 续费1，购买0
		})
		if (!data?.msg.code) {
			Message.request(data)
			const dialog = await buyPopup.value
			dialog.unmount()
			return
		}
		plugin.qrcode = data.msg.code
		oid.value = data.msg.oid
		getOrderStatus()
	}

	/**
	 * 获取订单状态
	 */
	const getOrderStatus = async () => {
		clearTimeout(timer.value)
		timer.value = setTimeout(async () => {
			const { data } = await getOrderStat({
				oid: oid.value,
				type: rowData.value.endtime === -1 ? 0 : 1, // 续费1，购买0
			})
			if (data !== 0) {
				refreshList('1')
				const dialog = await buyPopup.value
				dialog.unmount()
				return Message.success(rowData.value.endtime !== -1 ? '续费成功' : '购买成功')
			} else {
				getOrderStatus()
			}
		}, 1000)
	}

	const isShowSpeedVisible = ref<boolean>(false) // 进度窗口是否可见

	/**
	 * 安装第三方插件
	 */
	const installThirdPlugin = async (close: any) => {
		try {
			isShowSpeedVisible.value = true
			// 请求get_lines接口
			const { status, msg } = await inputZips({
				plugin_name: rowData.value.name,
				tmp_path: rowData.value.tmp_path,
			})
			inputZipFlag.value = false
			Message.request({ status, msg: msg?.replace(/<br>/g, '\n') })
			speedInstallView.value = false
			isShowSpeedVisible.value = false // 关闭视图
			refreshList('0')
			close()
		} catch (error) {
			console.log(error)
		}
	}

	/**
	 * @description 取消安装
	 */
	const cancelInstall = () => {
		isShowSpeedVisible.value = false
		Message.error('已取消安装!')
	}

	const $reset_buy = () => {
		clearTimeout(timer.value)
		oid.value = 0
	}

	const $reset_install = () => {
		rowData.value = {}
	}

	const $reset = () => {
		searchVal.value = ''
		softTableList.value = []
		tablePageConfig.value.page = 1
		// TableColumn.value = []
	}

	return {
		searchVal,
		softTableList,
		tablePageConfig,
		TableColumn,
		importOtherEvent,
		pageChangeEvent,
		getSoftListData,
		refreshList,
		buyThirdPluginView,
		$reset,

		// 购买弹窗
		plugin,
		oid,
		price,
		buyPopup,
		getRenewOrder,
		getOrderStatus,
		$reset_buy,

		// 安装
		rowData,
		isShowSpeedVisible,
		installThirdPlugin,
		cancelInstall,
		installOtherEvent,
		$reset_install,
	}
})

export default SOFT_OTHER_STORE
