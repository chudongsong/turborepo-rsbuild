import { Message, useConfirm } from '@/hooks/tools'
import { useMessage } from '@/hooks/tools'
import { useHandleError } from '@/hooks/tools'
import { useDataHandle } from '@/hooks/tools'
import { useDialog } from '@/hooks/tools'
import { fileSelectionDialog, openPluginView, pluginInstallDialog, productPaymentDialog } from '@/public'
import { useGlobalStore } from '@/store/global'
import { getRandomChart } from '@/utils'
import { isDark } from '@/utils/theme-config'
import { openResultDialog } from '@/views/site/useController'
import { getPluginInfo } from '@api/global'
import { addGitTask, closeHasPwd, delGitTask, delSiteRsync, removeSendTask, getBtSyncStatus, getCatalogueKey, getDirUserINI, getFileBody, getGitTask, getSitesFtp, runSiteTask, setDirUserINI, setHasPwd, setPath, setSiteRunPath, setSitesFtp, writeAccessLog } from '@api/site'

import { useSiteStore } from '@site/useStore'
import { storeToRefs } from 'pinia'

const { payment } = useGlobalStore()

const { siteInfo } = useSiteStore()

const { authType } = payment.value

export const viewLoading = ref(false) // 加载状态
export const passVisitFormRef = ref<any>() // 密码访问表单
export const gitFormRef = ref<any>() // git表单

export const siteMessage = reactive({
	path: '',
	runPath: '',
	dirs: [],
	userini: false,
	sync_git: false,
	logs: false,
	pass: false,
}) // 网站信息

export const ftpPopup = ref(false) // FTP配置弹窗
export const ftpForm = reactive<any>({
	ftp_status: false,
	ftp_name: '',
	ftp_pwd: '',
}) // FTP配置

export const rsyncStatus = ref(false) // rsync状态
export const rsyncName = ref('') // rsync名称
const rsyncData = ref<any[]>([]) // rsync数据

export const gitPopup = ref(false) // git配置弹窗
export const gitForm = reactive<any>({
	git_addr: '', // git地址
	branch: '', // 分支
	cycle: 1, // 同步周期
})

export const logsText = ref('') // 日志内容-git
export const gitLogsLoading = ref(false) // git日志加载状态
export const gitLogPopup = ref(false) // git日志弹窗
export const gitRules = {
	git_addr: [{ required: true, message: '请输入git地址', trigger: 'blur' }],
}

export const config = ref({
	mode: 'ace/mode/nginx',
	theme: !isDark.value ? 'ace/theme/monokai' : 'ace/theme/clouds_midnight', // 主题
	wrap: true, // 是否自动换行
	showInvisibles: false, // 是否显示空格
	showFoldWidgets: false, // 是否显示代码折叠线
	useSoftTabs: true, // 是否使用空格代替tab
	tabSize: 2, // tab宽度
	showPrintMargin: false, // 是否显示打印边距
	readOnly: true, // 是否只读
	fontSize: '12px', // 字体大小
}) // ace编辑器配置

export const passVisitForm = reactive({
	status: false,
	username: '',
	password: '',
	rePass: '',
})

export const passVisitRules = {
	username: [
		{
			required: true,
			message: '账号不能为空',
			trigger: ['blur'],
		},
	],
	password: [
		{
			required: true,
			message: '密码不能为空',
			trigger: ['blur'],
		},
	],
	rePass: [
		{
			required: true,
			message: '重复密码不能为空',
			trigger: ['blur'],
		},
		{
			validator: (rule: any, value: any, callback: any) => {
				if (value !== passVisitForm.password) {
					callback(new Error('两次输入密码不一致'))
				} else {
					callback()
				}
			},
			trigger: ['blur', 'change'],
		},
	],
}

/**
 * @description 密码访问确认
 */
export const onPassVisitConfirm = async () => {
	passVisitFormRef.value.validate(async (valid: boolean) => {
		if (valid) {
			let loading = Message.load('正在设置,请稍后...')
			try {
				const res = await setHasPwd({
					id: siteInfo.value.id,
					username: passVisitForm.username,
					password: passVisitForm.password,
				})
				Message.request(res)
			} catch (error) {
				console.log(error)
			} finally {
				loading.close()
			}
		}
	})
}

/**
 * @description 密码访问状态改变
 */
export const onChangePassStatus = async (val: boolean) => {
	let loading: any
	try {
		if (!val) {
			loading = Message.load('正在关闭密码访问,请稍后...')
			const res = await closeHasPwd({ id: siteInfo.value.id })
			loading.close()
			Message.request(res)
		}
	} catch (error) {
		console.log(error)
	} finally {
		loading?.close()
	}
}

/**
 * @description 获取网站目录
 */
export const getPath = async () => {
	try {
		const res: any = await getCatalogueKey({
			table: 'sites',
			key: 'path',
			id: siteInfo.value.id,
		})
		siteMessage.path = res.data
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description: 触发目录选择
 */
export const onPathChange = () => {
	fileSelectionDialog({
		type: 'dir',
		path: siteMessage.path,
		change: (path: string) => {
			siteMessage.path = path
		},
	})
}

/**
 * @description 获取用户目录
 */
export const getDirUser = async () => {
	try {
		const res: any = await getDirUserINI({
			path: siteMessage.path,
			id: siteInfo.value.id,
		})
		siteMessage.dirs = res.data.runPath.dirs
		siteMessage.runPath = res.data.runPath.runPath
		siteMessage.sync_git = res.data.sync_git
		siteMessage.logs = res.data.logs
		siteMessage.userini = res.data.userini
		passVisitForm.status = res.data.pass
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description 保存网站目录
 */
export const saveSitePath = async () => {
	let load = Message.load('正在保存中...')
	try {
		const res = await setPath({ path: siteMessage.path, id: siteInfo.value.id })
		Message.request(res)
		if (res.status) siteInfo.value.path = siteMessage.path
		getDirUser()
	} catch (error) {
		console.log(error)
	} finally {
		load.close()
	}
}

/**
 * @description 保存运行目录
 */
export const setRunPath = async () => {
	let load = Message.load('正在设置,请稍后...')
	try {
		const res = await setSiteRunPath({
			runPath: siteMessage.runPath,
			id: siteInfo.value.id,
		})
		Message.request(res)
	} catch (error) {
		console.log(error)
	} finally {
		load.close()
	}
}

/**
 * @description 获取网站FTP
 */
export const getSitesFtpEvent = async () => {
	try {
		const res = await getSitesFtp({ site_id: siteInfo.value.id })
		if (!res.data.info?.id) {
			ftpForm.ftp_status = false
			ftpForm.ftp_name = ''
			ftpForm.ftp_pwd = ''
			ftpForm.ftp_id = ''
		} else {
			ftpForm.ftp_status = true
			ftpForm.ftp_id = res.data.info?.id
			ftpForm.ftp_name = res.data.info?.name
			ftpForm.ftp_pwd = res.data.info.password
		}
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description 修改FTP状态+配置保存
 */
export const changeFtpStatus = async (val: boolean, isConfig: boolean) => {
	if (isConfig) {
		let loading = Message.load('正在处理中,请稍后...')
		// 配置界面
		try {
			if (!ftpForm.ftp_id) {
				changeFtpStatus(true, false)
				return
			}
			let params: any = {
				site_id: siteInfo.value.id,
				...ftpForm,
				siteName: siteInfo.value.name,
			}
			delete params.ftp_status
			const res = await setSitesFtp(params)
			Message.request(res)
			getSitesFtpEvent()
			if (res.data.status) {
				ftpPopup.value = false
			} else {
				return false
			}
		} catch (error) {
			console.log(error)
		} finally {
			loading.close()
		}
	} else {
		// 选项切换
		if (val) {
			ftpForm.ftp_name = ftpForm.ftp_name || getRandomChart(12)
			ftpForm.ftp_pwd = ftpForm.ftp_pwd || getRandomChart(12)
		}
		let params: any = { site_id: siteInfo.value.id, ...ftpForm, siteName: siteInfo.value.name }
		if (!params.ftp_id) delete params.ftp_id
		ftpForm.ftp_status = !val
		await useConfirm({
			title: 'FTP状态',
			content: val ? '创建FTP将会同步到FTP界面，是否继续操作？' : '关闭FTP后，将会删除当前网站的FTP账号，是否继续操作？',
			icon: 'warning-filled',
		})
		const res: AnyObject = await useDataHandle({
			loading: '正在处理中,请稍后...',
			request: setSitesFtp(params),
			message: true,
		})
		getSitesFtpEvent()
	}
}

/**
 * @description 获取rsync状态
 */
export const getRsync = async () => {
	try {
		const res = await getBtSyncStatus({ path: siteMessage.path })
		rsyncStatus.value = res.data.have_sync
		if (rsyncStatus.value) {
			rsyncData.value = Array.isArray(res.data?.data) ? res.data?.data : []
			if (res.data?.data?.name) rsyncName.value = res.data?.data?.name
		}
	} catch (error) {
		console.log(error)
	}
}

export const changeRsync = async (val: any) => {
	try {
		rsyncStatus.value = val
		if (val) {
			const { data } = await getPluginInfo({
				sName: 'rsync',
			})
			if (data.setup && data.endtime >= 0) {
				// 检测版本号是否满足最低3.9.3
				if (parseFloat(data.version) >= parseFloat('3.9.3')) {
					const { default: FILES_RSYNC_STORE } = await import('@files/public/file-rsync/store')
					const filesRsyncStore = FILES_RSYNC_STORE()
					const { compData, isSuccess } = storeToRefs(filesRsyncStore)
					compData.value = {
						row: {
							path: siteInfo.value.path,
							type: 'site',
							refreshEvent: getRsync,
						},
					}
					useDialog({
						isAsync: true,
						title: `【${siteInfo.value.name}】设置数据同步`,
						area: 56,
						component: () => import('@files/public/file-rsync/index.vue'),
						// compData: {
						// 	row: {
						// 		path: siteInfo.value.path,
						// 		type: 'site',
						// 		refreshEvent: getRsync,
						// 	}
						// },
						onCancel: () => {
							nextTick(() => {
								if (!isSuccess.value) rsyncStatus.value = false
							})
						},
					})
				} else {
					await useConfirm({
						title: '更新提示',
						content: '当前版本过低，无法使用此功能，是否继续更新？',
						icon: 'warning-filled',
					})
					await updateSoftEvent(data)
				}
			} else {
				if (data.endtime >= 0) {
					// 未安装未到期调用安装事件
					await useConfirm({
						title: '安装提示',
						content: `检测到【${data.title}】未安装，是否立即安装开启使用？`,
						icon: 'warning-filled',
					})
					pluginInstallDialog({
						name: data.name,
						type: 'i',
						pluginInfo: data,
					})
				} else {
					productPaymentDialog({
						sourceId: 120,
					})
				}
				nextTick(() => {
					rsyncStatus.value = false
				})
			}
		} else {
			await useConfirm({
				title: '删除同步任务',
				content: '即将删除该同步任务，是否继续操作？',
				icon: 'warning-filled',
			})
			if (rsyncData.value.length) {
				const loadT = Message.load('正在删除同步任务，请稍后...')
				const promises = rsyncData.value.map(async (item: any) => {
					if (item.type === 'modules') {
						const res = await delSiteRsync({
							mName: item.data.name,
						})
						return {
							...res.data,
							title: '接收任务',
							name: item.data.name,
						}
					} else {
						const res = await removeSendTask({
							send_id: item.data.id,
						})
						return {
							...res.data,
							title: '发送任务',
							name: item.data.name,
						}
					}
				})
				const result = await Promise.all(promises)
				loadT.close()
				if (result.length > 1) {
					openResultDialog({
						title: '删除同步任务',
						autoTitle: '删除同步任务完成',
						resultData: result,
						resultColumn: [
							{
								label: '任务名称',
								prop: 'name',
							},
							{
								label: '任务类型',
								prop: 'title',
							},
							{
								label: '操作结果',
								prop: 'msg',
								align: 'rigth',
								render: (row: any) => {
									return <span class={row.status ? 'text-primary' : 'text-danger'}>{row.msg}</span>
								},
							},
						],
					})
				} else {
					Message.request(result[0])
				}
			} else {
				await useDataHandle({
					loading: '正在删除同步任务，请稍后...',
					request: delSiteRsync({
						mName: rsyncName.value,
					}),
					message: true,
				})
			}
			getRsync()
		}
	} catch (error) {
		rsyncStatus.value = !val
	}
}

/**
 * @description 更新软件
 * @param {any} item 插件信息
 * @returns {Promise<void>}
 */
export const updateSoftEvent = async (row: any): Promise<void> => {
	// newPluginInstallDialog({
	// 	name: row.name,
	// 	type: 'u',
	// 	softData: { ...row, callback: init },
	// });
}
/**
 * @description 打开rsync配置-文件同步
 */
export const openRsync = async () => {
	try {
		const { data } = await getPluginInfo({ sName: 'rsync' })
		await openPluginView({ name: 'rsync', softData: data })
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description 修改git状态
 */
export const changeGit = async (val: boolean) => {
	if (authType !== 'ltd') {
		// 打开支付
		return productPaymentDialog({
			sourceId: 310,
			disablePro: true,
		})
	}
	if (!val) {
		siteMessage.sync_git = true
		await useConfirm({
			title: '关闭git同步',
			content: '关闭后将不在同步git文件到网站目录，是否继续操作？',
			icon: 'warning-filled',
		})
		const res: AnyObject = await useDataHandle({
			loading: '正在关闭，请稍后...',
			request: delGitTask({ site_id: siteInfo.value.id }),
			message: true,
		})
		if (res.status) siteMessage.sync_git = !res.status
	} else {
		siteMessage.sync_git = false
		await checkGit()
	}
}

/**
 * @description 打开git配置
 */
export const openGitPopup = async () => {
	if (authType !== 'ltd') {
		// 打开支付
		return productPaymentDialog({
			sourceId: 310,
			disablePro: true,
		})
	}
	await checkGit()
	gitPopup.value = true
}

/**
 * @description 获取git配置
 */
export const checkGit = async () => {
	try {
		const { data: res } = await getGitTask({ site_id: siteInfo.value.id })
		if (res.msg?.git_addr) {
			gitForm.git_addr = res.msg.git_addr
			gitForm.branch = res.msg.branch
			gitForm.cycle = res.msg.cycle
		} else {
			gitForm.git_addr = ''
			gitForm.branch = ''
			gitForm.cycle = 1
			gitPopup.value = true
		}
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description 添加git配置
 */
export const addGitConfig = async () => {
	await gitFormRef.value.validate()
	await useConfirm({
		title: 'git同步覆盖提示',
		content: '从git同步文件到网站目录将覆盖网站目录的文件，是否继续操作？',
		icon: 'warning-filled',
	})
	const res: AnyObject = await useDataHandle({
		loading: '正在设置，请稍后...',
		request: addGitTask({ site_id: siteInfo.value.id, ...gitForm }),
		message: true,
	})
	if (res.status) {
		gitPopup.value = false
		getDirUser()
	}
}

/**
 * @description 运行git
 */
export const runGit = async () => {
	if (authType !== 'ltd') {
		// 打开支付
		return productPaymentDialog({
			sourceId: 310,
			disablePro: true,
		})
	}
	useDataHandle({
		request: runSiteTask({ site_id: siteInfo.value.id }),
		message: true,
	})
}

/**
 * @description 打开git日志
 */
export const openGitLog = async () => {
	await getGitLogs()
	gitLogPopup.value = true
}

/**
 * @description 获取git日志
 */
export const getGitLogs = async () => {
	gitLogsLoading.value = true
	try {
		const res = await getFileBody({ path: '/www/wwwlogs/syncsite/' + siteInfo.value.id + '.log' })
		logsText.value = res.data.data || '暂无日志数据'
	} catch (error) {
		useHandleError(error)
	} finally {
		gitLogsLoading.value = false
	}
}
/**
 * @description 设置防跨站
 */
export const setDirUser = async () => {
	const res: AnyObject = await useDataHandle({
		loading: '正在设置防跨站，请稍后...',
		request: setDirUserINI({
			path: siteMessage.path,
		}),
		message: true,
	})
	if (res.status) getDirUser()
}

/**
 * @description 设置写访问日志
 */
export const setLogs = async () => {
	const res: AnyObject = await useDataHandle({
		loading: '正在设置写访问日志，请稍后...',
		request: writeAccessLog({
			id: siteInfo.value.id,
		}),
		message: true,
	})
	if (res.status) getDirUser()
}

export const init = async () => {
	// 获取网站信息
	viewLoading.value = true
	try {
		await getPath()
		await getDirUser()
		await getSitesFtpEvent()
		await getRsync()
	} catch (error) {
		console.log(error)
	} finally {
		viewLoading.value = false
	}
}
