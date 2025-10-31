import type { ResponseResult } from '@hooks/tools/axios/types'

import type { App } from 'vue'
import { repairPanelNew, updatePanel, getUpdateInfo as getUpdateInfoApi, appleBeta, toOfficial, setDebug, ignoreVersion, writeNpsQuestion, setTaskStatus, upgradePanelNew, setNewAlarmTask, restartPanel, serviceManage, restartServer, getTotal, getUpgradeLog, histVersionInfo } from '@/api/global'
import { useGlobalStore } from '@/store/global'
import { Message, useConfirm, useDataHandle, useDialog, useHandleError } from '@hooks/tools'
import { defineStore, storeToRefs } from 'pinia'
import { router } from '@/router'
import HOME_STORE from '@home/store'
import { clearCache, compareVersion, formatTime, isBoolean, isString } from '@/utils/index'

import { checkDiskWarnDialog, npsThanksDialog, productPaymentDialog } from '@/public/index'

const HOME_HEADER_STORE = defineStore('HOME-HEADER-STORE', () => {
	const { panelVersion, payment, updatePush, panel, push, plugin, getUpdatePushInfo, getOldSenderAlarmListInfo } = useGlobalStore() // 全局持久化数据
	const { bindUser, authType, authExpirationTime } = toRefs(payment.value) // 绑定

	const homeStore = HOME_STORE()
	const { panelInfo, systemInfo } = storeToRefs(homeStore)
	const { upgrade, currentInfo } = toRefs(panelInfo.value)

	/**
	 * @description 修复面板
	 */
	const onRepair = async () => {
		const isCheck = await checkDiskWarnDialog()
		if (isCheck) return null
		await useDataHandle({
			loading: '正在获取数据，请稍后...',
			request: repairPanelNew(),
			success: async (res: any) => {
				const data = res.data
				if (data.upgrade === 1) {
					//存在修复面板
					await useConfirm({
						title: '修复面板',
						content: `<div class="flex items-center">
              <div class="mr-1rem w-[4rem]"><img width="40" src="/static/icons/icon-upgrade.svg"></img></div>
              <div class="flex-1">
                <div class="text-medium leading-2.4rem">发现新版本，继续修复面板能修复使用中遇到的各种异常问题</div>
              </div>
            </div>
            <div class="pl-5rem mt-[4px]">
              <div>最新版本：${data.cloud.version}</div>
              <div>更新时间：${formatTime(data.cloud.update_time * 1000)}</div>
            </div>`,
						icon: false,
						width: '40rem',
						isHtml: true,
						confirmText: '继续修复',
					})
					useDataHandle({
						loading: '正在修复面板，请稍后...',
						request: repairPanelNew({ force: 1 }),
						message: true,
						success: (res: any) => {
							clearCache()
							if (res.status) {
								setTimeout(() => {
									// 修复日志
									useDialog({
										title: `正在${data.type === 'repair' ? '修复' : '更新'}面板，请耐心等候...`,
										area: 70,
										compData: { type: 'repair' },
										component: () => import('@home/views/header/repair-upgrade-log/index.vue'),
									})
								}, 1500)
							}
						},
					})
				} else {
					Message.msg({
						message: `<div style="line-height:22px;">
              <div>当前已是最新版本</div>
              <div>当前版本：${data.local.version}</div>
              <div>更新时间：${formatTime(data.local.update_time * 1000)}</div>
            </div>`,
						type: 'success',
						dangerouslyUseHTMLString: true,
					})
				}
			},
		})
	}

	/**
	 * @description 历史版本
	 * @returns {App}
	 */
	const histVersionInfoDialog = async (): Promise<App> =>
		useDialog({
			title: '历史版本',
			area: [60, 52],
			component: () => import('@home/views/header/history-version/index.vue'),
		})

	/**
	 * @description 重启弹窗
	 * @returns {App}
	 */
	const restartSeverDialog = async (): Promise<App> => {
		const isCheck = await checkDiskWarnDialog()
		if (isCheck) return null
		return useDialog({
			title: '重启服务器或者面板',
			area: [33, 11],
			component: () => import('@home/views/header/restart/index.vue'),
		})
	}

	/**
	 * @description 更新版本
	 * @returns {App}
	 */
	const updateVersionDialog = async (): Promise<App> => {
		const isCheck = await checkDiskWarnDialog()
		if (isCheck) return null
		return useDialog({
			area: 50,
			component: () => import('@home/views/header/update/index.vue'),
		})
	}

	/**
	 * @description 跳转路由
	 */
	const jumpRouter = (name: string) => {
		router.push({ path: `/config/${name}` })
	}

	// user-info
	const advantageList = ref([
		['plunge', '30+款付费插件'],
		['function', '20+企业版专享功能'],
		['certificate', '2张SSL商用证书'],
		['message', '1000条免费短信'],
		['time', '5分钟极速响应'],
		['other', '更多特权>>'],
	])
	const v2AdvantageList = ref([
		['plugin', '30+款付费插件'],
		['more', '20+企业版专享功能'],
		['recom', '2张SSL商用证书'],
		['message', '1000条免费短信'],
		['speed', '5分钟极速响应'],
		['other', '更多特权>>'],
	])
	/**
	 * @description 跳转支付页面
	 */
	const productPayment = () => {
		productPaymentDialog({
			disablePro: true,
			sourceId: 300,
		})
	}

	// update
	const { isDebug } = panel.value
	const { isBeta, cloudBeta, isUpgrade, grayscale } = toRefs(panelInfo.value) // 是否是测试版，是否有更新，测试版信息，正式版信息，灰度值

	const loading = ref<boolean>(false) // 请求过渡
	const isSetDebug = ref<boolean>(false) // 是否有自动配置过调试模式，用于恢复调试模式
	const questions = ref('') // 反馈数据
	const isNPSShow = ref(false) // 是否显示反馈
	const formPhone = ref<any>(null) // 表单验证
	const betaInfo = ref<any>({}) // 测试版信息
	const officialInfo = ref<any>({}) // 正式版信息
	const form = ref({
		phone: '',
		status: false,
	})
	const rules = ref({
		phone: [
			{
				validator: (rule: any, value: any, callback: any) => {
					if (form.value.status) {
						if (!/^1[3456789]\d{9}$/.test(value) && !/^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/.test(value)) {
							callback(new Error('请输入正确的手机号码或邮箱'))
						} else {
							callback()
						}
					} else {
						callback()
					}
				},
			},
		],
		give: [
			{
				required: true,
				validator: (rule: any, value: any, callback: any) => {
					if (value.length === 0) {
						callback(new Error('请选择至少一种告警方式'))
					} else {
						callback()
					}
				},
				trigger: ['blur', 'change'],
			},
		],
	})

	const popupClose = inject('popupClose', () => {}) // 关闭弹窗

	/**
	 * @description 检查手机号码或邮箱
	 * @param str
	 */
	const checkString = (str: string) => {
		const phoneRegex = /^1[3456789]\d{9}$/
		const emailRegex = /^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/
		if (phoneRegex.test(str)) {
			return 'phone'
		} else if (emailRegex.test(str)) {
			return 'email'
		} else {
			return 'unknown'
		}
	}

	/**
	 * @description 打开设置更新提醒
	 * @returns {Promise<void>}
	 */
	const openUpdateReminder = async () => {
		if (updatePush.value.updatePush) {
			updateReminderDialog(!updatePush.value.updatePush)
		} else {
			useDataHandle({
				loading: '正在设置更新提醒，请稍后...',
				request: setTaskStatus({
					task_id: updatePush.value.updateTaskId,
					status: 0,
				}),
				message: true,
			})
		}
	}

	/**
	 * @description 切换正式版或者申请测试版
	 * @param {boolean | ''} types 更新版本的类型
	 * @returns {Promise<void>} load 过度loading配置
	 */
	const cutPanelVersion = async (types: boolean) => {
		let load: any
		try {
			const title = types ? '升级Linux测试版' : '切换到正式版'
			const message = types ? '请仔细阅读内测升级须知，是否升级Linux测试版？' : '是否从测试版切换到正式版？'
			await useConfirm({
				type: 'calc',
				title: title,
				content: message,
			})
			load = Message.load(`正在${title}，请稍候...`)
			clearCache()
			//关闭调试模式，如果开启调试模式
			if (isDebug) {
				await setDebug()
				isSetDebug.value = true
			}
			// 申请测试和切换正式版
			const rdata = types ? await appleBeta() : await toOfficial()
			if (!rdata.status) return Message.request(rdata)
		} catch (error) {
			console.log(error)
			return false
		} finally {
			// load && load.close()
			popupClose() // 关闭弹窗
			clearCache()
		}
		return load
	}

	/**
	 * @description 升级版本
	 * @param {boolean} types 更新版本的类型
	 * @returns {Promise<void>}
	 */
	const updateVersion = async (types?: boolean | '') => {
		let load: any
		try {
			// 传内容则升级版本,切换正式版或者申请测试版，
			if (typeof types === 'boolean') {
				await useConfirm({
					title: `升级面板`,
					content: '温馨提示：升级面板，有助于面板的BUG修复和功能加强，但不会影响用户的数据，即使面板发生故障，用户数据也不会受到影响。请您放心进行升级。',
				})
				load = await cutPanelVersion(types)
				if (!load) return
			} else {
				// const res: any = await useDataHandle({
				// 	loading: '正在获取数据，请稍后...',
				// 	request: upgradePanelNew(),
				// })
				// const data = res.data
				if (upgrade.value !== 0) {
					await useConfirm({
						title: '升级面板',
						content: `<div class="flex items-center">
            <div class="mr-1rem w-[4rem]"><img width="40" src="/static/icons/icon-upgrade.svg"></img></div>
              <div class="flex-1">
                <div class="text-medium leading-2.4rem">升级面板可以修复大部分已知BUG，同时安装最新的功能，用户数据也不会受到影响</div>
              </div>
            </div>
            <div class="pl-5rem mt-[4px]">
              <div>即将更新到：${currentInfo.value.version}</div>
              <div>更新时间：${formatTime(currentInfo.value.update_time * 1000)}</div>
            </div>`,
						icon: false,
						width: '40rem',
						isHtml: true,
						confirmText: '继续升级',
					})
					useDataHandle({
						loading: '正在升级面板，请稍后...',
						request: upgradePanelNew({ force: true, version: currentInfo.value.version }),
						message: true,
						success: (res: any) => {
							clearCache()
							if (res.status) {
								setTimeout(() => {
									useDialog({
										title: `正在更新面板，请耐心等候...`,
										area: 70,
										compData: { type: 'upgrade' },
										component: () => import('@home/views/header/repair-upgrade-log/index.vue'),
									})
								}, 1500)
							}
						},
					})
					return
				} else {
					Message.msg({
						message: `<div style="line-height:22px;">
              <div>当前已是最新版本</div>
              <div>当前版本：${currentInfo.value.version}</div>
              <div>更新时间：${formatTime(currentInfo.value.update_time * 1000)}</div>
            </div>`,
						type: 'success',
						dangerouslyUseHTMLString: true,
					})
					return
				}
			}
			// 获取云端的面板信息
			await getUpdateInfo({ check: true })
			// 更新到最新的版本
			const data = await updatePanel({ toUpdate: 'yes' })

			if (isSetDebug.value) {
				await setDebug()
				isSetDebug.value = false
			}
			if (data.status) {
				Message.success({
					msg: data.msg,
					onClose: () => window.location.reload(),
				})
				// 延迟2秒刷新浏览器页面
				setTimeout(() => {
					window.location.reload()
				}, 2000)
			} else {
				Message.error(data.msg)
			}
		} catch (err) {
			load && load.close()
		} finally {
			load && load.close()
			popupClose() // 关闭弹窗
			clearCache()
		}
	}

	/**
	 * @description 忽略本次更新
	 * @param {string} version 版本号
	 * @returns {Promise<void>}
	 */
	const ignoreUpdatEVersion = (version: string, close: any) => {
		useDataHandle({
			loading: '正在忽略本次更新，请稍后...',
			request: ignoreVersion({ version }),
			message: true,
			success: (res: any) => {
				if (res.status) close() // 关闭弹窗
			},
		})
	}

	/**
	 * @description: 提交更新的问卷
	 */
	const submit = async (close: any) => {
		if (questions.value === '') {
			Message.error('还有必填项没有填写哦~')
			throw new Error('还有必填项没有填写哦~')
		}
		formPhone.value.validate(async (valid: any) => {
			if (valid) {
				const type = checkString(form.value.phone)
				const params: any = {
					questions: JSON.stringify({
						22: questions.value,
					}), // 问题与回答
					product_type: 18, // 产品类型 0:面板 1:waf 2:监控报表 3：防篡改  7：需求分析
					software_name: 1, // 面板类型 panel、total、btwaf
					rate: 0, // 评分
				}
				if (form.value.status) {
					params.feedback = JSON.stringify(type === 'phone' ? { phone: form.value.phone } : { email: form.value.phone }) // 反馈内容
				}
				useDataHandle({
					loading: '正在提交问卷，请稍后...',
					request: writeNpsQuestion(params),
					success: (res: any) => {
						if (res.status) {
							npsThanksDialog()
							close()
						}
					},
				})
			}
		})
	}

	/**
	 * @description: 获取面板更新内容
	 * @param {boolean} data.check 是否检查更新
	 * @param {boolean} data.toUpdate 是否更新版本
	 * @returns {Promise<void>}
	 */
	const getUpdateInfo = async (data: { check?: boolean; toUpdate?: 'yes' } = {}): Promise<ResponseResult | boolean> => {
		try {
			const { data: rdata } = await getUpdateInfoApi(data)
			const locaVersion = window.vite_public_version
			const lastPart = locaVersion?.split('.').pop() as string
			const isBetaData = Number.parseInt(lastPart).toString() === lastPart && lastPart.length === 2
			const { is_beta, version, beta, downUrl, updateMsg, uptime, grayscale_test } = rdata.msg
			cloudBeta.value = is_beta
			isBeta.value = isBetaData
			betaInfo.value = beta
			officialInfo.value = {
				downUrl,
				updateMsg,
				version,
				uptime,
			}
			grayscale.value = grayscale_test
			if (rdata.status) isUpgrade.value = compareVersion(panelVersion.value, isBeta.value ? beta.version : version)
			return rdata
		} catch (err) {
			useHandleError(err)
			console.log(err, 'getUpdateData')
			return false
		}
	}

	/**
	 * @description 面板更新提醒
	 * @param {boolean} status 是否显示
	 */
	const updateReminderDialog = async (status?: boolean) => {
		updatePushBack.value = status || false
		msgForm.value.switch = true
		useDialog({
			title: '更新提示',
			area: 50,
			btn: true,
			component: () => import('@home/views/header/update/alarm.vue'),
		})
	}

	/**
	 * @description 打开页面
	 */
	const onOpen = async () => {
		try {
			loading.value = true
			const res = await getUpdateInfo({ check: true })
			if (isBoolean(res)) return
			// 返回的是错误信息
			if (!res.status && isString(res.msg)) {
				popupClose() // 关闭弹窗
				Message.error(res.msg)
			}
		} catch (error) {
			useHandleError(error)
		} finally {
			loading.value = false
		}
	}

	const updatePushBack = ref<boolean>(false) // 更新推送的状态
	const alarmRef = ref<any>() // 通知方式实例
	const pushMsgRef = ref<any>() // 表单实例
	const checkedLoad = ref<boolean>(false)
	const msgForm = ref({
		switch: updatePush.value.updatePush,
		give: [''],
		option: {},
	})

	/**
	 * @description 初始化，获取信息配置
	 */
	const renderPushConfig = async () => {
		checkedLoad.value = true
		await getOldSenderAlarmListInfo()
		checkedLoad.value = false
		msgForm.value.give = updatePush.value.modulePush
		msgForm.value.option = push.value.config
	}

	const refreshAlarmEvent = () => {
		alarmRef.value?.refresh()
		Message.success('刷新成功')
	}

	/**
	 * @description 提交更新提示
	 */
	const onConfirm = (close: any) => {
		pushMsgRef.value.validate(async (valid: boolean) => {
			if (valid) {
				const params = {
					task_data: JSON.stringify({
						task_data: {
							tid: '10',
							type: 'panel_update',
							title: '面板更新提醒',
							status: msgForm.value.switch,
							count: 0,
							interval: 600,
							project: '',
						},
						status: msgForm.value.switch,
						sender: msgForm.value.give,
						number_rule: { day_num: 0, total: 2 },
						time_rule: { send_interval: 0, time_range: [0, 86399] },
					}),
					template_id: '10',
				}

				useDataHandle({
					loading: '正在提交更新提示，请稍后...',
					request: setNewAlarmTask(params),
					message: true,
					success: (res: any) => {
						close() // 关闭弹窗
						getUpdatePushInfo()
					},
				})
			}
		})
	}

	/**
	 * @description 关闭更新提示
	 */
	const onCancel = () => {
		updatePush.value.updatePush = updatePushBack.value
	}

	const showFooter = ref(true)
	const showServer = ref(false)
	const serverRestartRef = ref() // 重启服务器弹窗ref
	const tipsList = ref<Array<{ text: string; color?: string }>>([])
	let timer: number | ReturnType<typeof setTimeout> | undefined
	const courseList = reactive<{ [key: string]: boolean }>({
		webServe: false,
		mysqlServe: false,
		restartServe: false,
		serveStart: false,
	})

	// 重启面板
	const onRestartPanel = async () => {
		await useConfirm({
			icon: 'warning-filled',
			title: '重启面板',
			content: '即将重启面板服务，继续吗？',
		})
		useDataHandle({
			loading: '正在重启面板，请稍候...',
			request: restartPanel(),
			message: true,
			success: (res: any) => {
				if (res.status) {
					setTimeout(() => {
						clearCache()
						window.location.reload()
					}, 1000)
				}
			},
		})
	}

	/**
	 * @description 重启服务器
	 * @param {Function} close 关闭弹窗
	 */
	const onRestartServer = async () => {
		try {
			// showServer.value = false
			panelInfo.value.isRestart = true
			tipsList.value.splice(0, tipsList.value.length)
			showFooter.value = false
			// 控制ref为serverRestart 下的el-dialog__footer的显示隐藏
			const serverRestartRefEl = serverRestartRef.value?.$el

			if (serverRestartRefEl) {
				const footerEl = serverRestartRefEl.querySelector('.el-dialog__footer')
				const bodyEl = serverRestartRefEl.querySelector('.el-dialog__body')
				bodyEl.style.height = '48rem'
				if (footerEl) {
					footerEl.style.display = 'none'
				}
			}
			courseList.webServe = true
			await serviceManage({ name: plugin.value.webserver, type: 'stop' })
			courseList.mysqlServe = true
			await serviceManage({ name: 'mysqld', type: 'stop' })
			courseList.restartServe = true
			await restartServer()
			courseList.serveStart = true
			setFlush()
			// localStorage.clear()
			// sessionStorage.clear()
			// window.location.reload()
		} catch (err) {
			useHandleError(err)
		}
	}

	// 刷新
	const setFlush = () => {
		timer = setInterval(async () => {
			try {
				const res = await getTotal()
				console.log(res)
				if (res) {
					if (res.hasOwnProperty('status') || res.code !== undefined) {
						Message.success('服务器重启成功!')
						setTimeout(() => {
							clearCache()
							window.location.reload()
						}, 2000)
						clearInterval(timer)
					}
				}
			} catch (error) {
				useHandleError(error)
			}
		}, 3000)
	}

	/**
	 * @description 清除定时器
	 */
	const clearRestart = () => {
		timer && clearInterval(timer) // 组件卸载时清除定时器
	}

	const logContent = ref<string>('') // 日志内容

	/**
	 * @description 获取更新日志
	 */
	const getLog = async () => {
		try {
			timer && clearTimeout(timer)
			const { data: res } = await getUpgradeLog()
			if (res.status || isString(res.data)) {
				logContent.value = isString(res.data) ? res.data : res.msg || '暂无日志'
				if (isString(res.data)) {
					Message.msg({
						customClass: 'bt-message-error-html',
						dangerouslyUseHTMLString: true,
						message: res.msg + `${res.status ? '<br>请按 Ctrl+F5 刷新缓存，或等待5s自动刷新！' : ''}`,
						type: res.status ? 'success' : 'error',
						showClose: res.status ? false : true,
						duration: res.status ? 5000 : 0,
					})
					if (res.status) {
						// 修复更新完成5秒后刷新页面
						setTimeout(() => {
							clearCache()
							window.location.reload()
						}, 5000)
					}
				} else {
					timer = setTimeout(() => {
						clearCache()
						getLog()
					}, 2000)
				}
			} else {
				Message.error(res.msg)
			}
		} catch (error) {
			timer && clearTimeout(timer)
			timer = setTimeout(() => {
				getLog()
			}, 2000)
		}
	}

	const hisLoading = ref(false) // 是否加载
	const histVersion = ref<AnyObject[]>([]) // 版本更新数据

	/**
	 * @description 获取历史版本信息
	 */
	const getHistoryVersion = async () => {
		await useDataHandle({
			loading: hisLoading,
			request: histVersionInfo(),
			data: [Array, histVersion],
		})
	}

	const $reset = () => {
		// 需求反馈状态清除
		isNPSShow.value = false
		questions.value = ''
		form.value = {
			phone: '',
			status: false,
		}
	}

	return {
		bindUser,
		authType,
		authExpirationTime,
		systemInfo,
		panelInfo,
		panelVersion,
		formPhone,
		jumpRouter,
		histVersionInfoDialog,
		onRepair,
		restartSeverDialog,
		updateVersionDialog,
		// user-info
		advantageList,
		productPayment,
		// update
		loading,
		isUpgrade,
		grayscale,
		isBeta,
		betaInfo,
		officialInfo,
		update: updatePush,
		isNPSShow,
		questions,
		form,
		rules,
		onOpen,
		submit,
		ignoreUpdatEVersion,
		getUpdatePushInfo,
		openUpdateReminder,
		updateReminderDialog,
		updateVersion,

		alarmRef,
		pushMsgRef,
		msgForm,
		checkedLoad,
		renderPushConfig,
		refreshAlarmEvent,
		onCancel,
		onConfirm,

		showFooter,
		showServer,
		serverRestartRef,
		tipsList,
		courseList,
		clearRestart,
		onRestartServer,
		onRestartPanel,
		// repair-upgrade-log
		logContent,
		getLog,
		// history-version
		hisLoading,
		histVersion,
		getHistoryVersion,
		$reset,
		v2AdvantageList,
	}
})

export default HOME_HEADER_STORE
